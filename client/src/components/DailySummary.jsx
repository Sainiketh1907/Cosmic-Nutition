import React from 'react';
import { MacroPieChart } from './MacroPieChart';

export function DailySummary({ meals }) {
  const totalCalories = meals.reduce((sum, meal) => sum + meal.totalCalories, 0);
  const totalProtein = meals.reduce((sum, meal) => sum + meal.items.reduce((itemSum, item) => itemSum + (item.protein || 0), 0), 0);
  const totalCarbs = meals.reduce((sum, meal) => sum + meal.items.reduce((itemSum, item) => itemSum + (item.carbs || 0), 0), 0);
  const totalFat = meals.reduce((sum, meal) => sum + meal.items.reduce((itemSum, item) => itemSum + (item.fat || 0), 0), 0);

  return (
    <div className="rounded-xl border bg-card/50 dark:bg-card/20 text-card-foreground shadow-lg backdrop-blur-sm h-full">
      <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-xl font-semibold">Today's Summary</h3>
      </div>
      <div className="p-6 pt-0">
        <div className="text-4xl font-bold text-primary">{totalCalories.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground">Total Calories</p>
        <div className="mt-6 pt-6 border-t border-border/50">
           <MacroPieChart protein={totalProtein} carbs={totalCarbs} fat={totalFat} />
        </div>
      </div>
    </div>
  );
}