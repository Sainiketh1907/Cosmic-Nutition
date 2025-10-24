
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { MealInputForm } from '../components/MealInputForm';
import { MealLog } from '../components/MealLog';
import API_URL from '../config.js';

const Dashboard = () => {
    const [meals, setMeals] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const { getAccessTokenSilently } = useAuth0();

    const fetchMeals = async () => {
        try {
            const token = await getAccessTokenSilently();
            const response = await fetch(`${API_URL}/meals`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch meals.');
            const data = await response.json();
            setMeals(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMeals();
    }, [getAccessTokenSilently]);
    
    const handleAddMeal = async (newMealData) => {
        try {
          const token = await getAccessTokenSilently();
          const response = await fetch(`${API_URL}/meals`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(newMealData),
          });
          if (!response.ok) throw new Error('Failed to save meal.');
          // Refetch meals to get the latest list including the new one
          fetchMeals();
          setError(null);
        } catch (err) {
          setError(err.message);
        }
    };

    const handleDeleteMeal = async (mealId) => {
        try {
            const token = await getAccessTokenSilently();
            const response = await fetch(`${API_URL}/meals/${mealId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to delete meal.');
            setMeals(prevMeals => prevMeals.filter(meal => meal._id !== mealId));
        } catch (err) {
            setError(err.message);
        }
    };

    const todaysMeals = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return meals.filter(meal => {
            const mealDate = new Date(meal.date);
            return mealDate >= today && mealDate < tomorrow;
        });
    }, [meals]);
    
    const todaysMealsByCategory = useMemo(() => {
      const categories = { 'Breakfast': [], 'Lunch': [], 'Dinner': [], 'Snack': [] };
      todaysMeals.forEach(meal => {
        if (categories[meal.category]) {
          categories[meal.category].push(meal);
        }
      });
      return categories;
    }, [todaysMeals]);

    return (
        <div className="space-y-8">
            {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg" role="alert">
                    <strong className="font-bold">Error:</strong>
                    <span className="block sm:inline ml-2">{error}</span>
                </div>
            )}

            <MealInputForm onAddMeal={handleAddMeal} setError={setError} />

            <div className="space-y-6">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Today's Log</h2>
                {loading ? (
                    <div className="text-center p-8 text-muted-foreground rounded-lg border bg-card/50 text-card-foreground shadow-sm">
                        Loading today's meals...
                    </div>
                ) : (
                    Object.entries(todaysMealsByCategory).map(([category, mealsInCategory]) => 
                        mealsInCategory.length > 0 && (
                            <div key={category}>
                                <h3 className="text-lg font-semibold text-primary mb-3">{category}</h3>
                                <div className="space-y-4">
                                    {mealsInCategory.sort((a, b) => new Date(b.date) - new Date(a.date)).map(meal => (
                                        <div key={meal._id} className="ml-4 pl-4 border-l-2 border-border">
                                           <MealLog meals={[meal]} onDeleteMeal={handleDeleteMeal} title="" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    )
                )}
                {!loading && todaysMeals.length === 0 && (
                     <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
                        <p className="text-muted-foreground">You haven't logged any meals today.</p>
                        <p className="text-sm text-muted-foreground">Add a meal above to start tracking!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
