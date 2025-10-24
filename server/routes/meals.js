
import express from 'express';
import mongoose from 'mongoose';
import checkJwt from '../middleware/auth.js'; 
import { GoogleGenAI, Type } from '@google/genai';

const router = express.Router();

// @route   POST /api/meals/analyze
// @desc    Analyze a meal description using Gemini AI
// @access  Private
router.post('/analyze', checkJwt, async (req, res) => {
    if (!process.env.API_KEY) {
        return res.status(503).json({ message: 'AI service is not configured on the server. API_KEY is missing.' });
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const { description } = req.body;
    if (!description) {
        return res.status(400).json({ message: 'Meal description is required.' });
    }

    try {
        const schema = {
            type: Type.OBJECT,
            properties: {
              items: {
                type: Type.ARRAY,
                description: "List of food items in the meal.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING, description: "Name of the food item." },
                    calories: { type: Type.NUMBER, description: "Estimated calories for the item." },
                    protein: { type: Type.NUMBER, description: "Estimated protein in grams." },
                    carbs: { type: Type.NUMBER, description: "Estimated carbohydrates in grams." },
                    fat: { type: Type.NUMBER, description: "Estimated fat in grams." },
                  },
                  required: ["name", "calories"],
                },
              },
              totalCalories: {
                type: Type.NUMBER,
                description: "Sum of calories for all items in the meal.",
              },
              category: {
                type: Type.STRING,
                description: "Categorize the meal. If the user doesn't specify, infer from the food items or time of day. For example, coffee and croissant is likely 'Breakfast'.",
                enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'],
              },
            },
            required: ["items", "totalCalories", "category"],
        };

        const nutritionResponse = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: `As an expert nutritionist API, analyze the following meal description. Break it down into individual food items and provide your best estimate for the nutritional information (calories, protein, carbs, fat) for each. Calculate the total calories for the entire meal. Finally, categorize the meal as 'Breakfast', 'Lunch', 'Dinner', or 'Snack' based on the ingredients. Here is the meal: "${description}"`,
            config: {
              responseMimeType: "application/json",
              responseSchema: schema,
            },
        });

        const parsedNutrition = JSON.parse(nutritionResponse.text);

        const feedbackResponse = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: `Act as a friendly, encouraging nutritionist. Based on this meal description: "${description}", and its nutritional content: ${JSON.stringify(parsedNutrition.items)}, provide a single, short, positive, and helpful review. Keep it to one sentence. For example: 'A great source of protein to start your day!' or 'A balanced and colorful lunch.'`,
        });
        const feedbackText = feedbackResponse.text.trim();
        
        res.json({
            ...parsedNutrition,
            feedback: feedbackText
        });

    } catch (error) {
        console.error('Gemini API Error:', error);
        if (error.message && error.message.includes('API key not valid')) {
             return res.status(401).json({ message: 'The configured API key is invalid. Please check the server configuration.' });
        }
        res.status(500).json({ message: "Error analyzing meal with AI." });
    }
});


// @route   GET /api/meals
// @desc    Get all meals for the logged-in user
router.get('/', checkJwt, async (req, res) => {
  try {
    const Meal = mongoose.model('Meal');
    const userId = req.auth.payload.sub; // Auth0 user ID
    const meals = await Meal.find({ user: userId }).sort({ date: -1 });
    res.json(meals);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/meals
// @desc    Add a new meal for the logged-in user
router.post('/', checkJwt, async (req, res) => {
  try {
    const Meal = mongoose.model('Meal');
    const userId = req.auth.payload.sub; // Auth0 user ID
    const newMeal = new Meal({
      ...req.body,
      user: userId,
      date: new Date().toISOString()
    });
    const meal = await newMeal.save();
    res.json(meal);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/meals/:id
// @desc    Delete a meal for the logged-in user
router.delete('/:id', checkJwt, async (req, res) => {
  try {
    const Meal = mongoose.model('Meal');
    const userId = req.auth.payload.sub; // Auth0 user ID
    const meal = await Meal.findById(req.params.id);

    if (!meal) {
      return res.status(404).json({ msg: 'Meal not found' });
    }

    if (meal.user.toString() !== userId) {
        return res.status(401).json({ msg: 'User not authorized' });
    }

    await meal.deleteOne();
    res.json({ msg: 'Meal removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Meal not found' });
    }
    res.status(500).send('Server Error');
  }
});

export default router;