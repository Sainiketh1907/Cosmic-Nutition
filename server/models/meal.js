import mongoose from 'mongoose';

const foodItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  calories: { type: Number, required: true },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
}, { _id: false });

const mealSchema = new mongoose.Schema({
  user: {
    type: String, // Changed from ObjectId to String for Auth0 'sub'
    required: true,
  },
  description: { type: String, required: true },
  items: [foodItemSchema],
  totalCalories: { type: Number, required: true },
  category: {
    type: String,
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'],
    required: true,
  },
  feedback: {
    type: String,
    required: false,
  },
  date: { type: Date, required: true, default: Date.now },
}, { 
  timestamps: true,
});

const Meal = mongoose.model('Meal', mealSchema);

export default Meal;