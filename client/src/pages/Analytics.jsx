
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { DailySummary } from '../components/DailySummary';
import { WeeklySummary } from '../components/WeeklySummary';
import { NutritionCharts } from '../components/NutritionCharts';
import { MealLog } from '../components/MealLog';
import API_URL from '../config.js';

const Analytics = () => {
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
            if (!response.ok) throw new Error('Failed to fetch analytics data.');
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
    
    if (loading) return <div className="text-center p-8">Loading analytics...</div>;
    if (error) return <div className="text-center text-destructive p-8">Error: {error}</div>;

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <DailySummary meals={todaysMeals} />
                <WeeklySummary meals={meals} />
            </div>
            <NutritionCharts meals={meals} />
            <MealLog meals={meals} onDeleteMeal={handleDeleteMeal} title="Complete Meal History" />
        </div>
    );
};

export default Analytics;
