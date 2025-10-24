import React from 'react';

export function WeeklySummary({ meals }) {
  // Define the date range for the last 7 days, including today.
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999); // Set to the end of the current day

  const startOfPeriod = new Date();
  startOfPeriod.setDate(startOfPeriod.getDate() - 6); // Go back 6 days to get a 7-day total window
  startOfPeriod.setHours(0, 0, 0, 0); // Set to the beginning of that day

  const weeklyMeals = meals.filter(meal => {
    const mealDate = new Date(meal.date);
    return mealDate >= startOfPeriod && mealDate <= endOfToday;
  });

  const totalCalories = weeklyMeals.reduce((sum, meal) => sum + meal.totalCalories, 0);
  const totalProtein = weeklyMeals.reduce((sum, meal) => sum + meal.items.reduce((itemSum, item) => itemSum + (item.protein || 0), 0), 0);
  const totalCarbs = weeklyMeals.reduce((sum, meal) => sum + meal.items.reduce((itemSum, item) => itemSum + (item.carbs || 0), 0), 0);
  const totalFat = weeklyMeals.reduce((sum, meal) => sum + meal.items.reduce((itemSum, item) => itemSum + (item.fat || 0), 0), 0);

  const daysWithMeals = new Set(weeklyMeals.map(meal => new Date(meal.date).toDateString())).size;
  const averageDivisor = daysWithMeals > 0 ? daysWithMeals : 1;

  const avgCalories = totalCalories / averageDivisor;
  const avgProtein = totalProtein / averageDivisor;
  const avgCarbs = totalCarbs / averageDivisor;
  const avgFat = totalFat / averageDivisor;

  return (
    <div className="rounded-xl border bg-card/50 dark:bg-card/20 text-card-foreground shadow-lg backdrop-blur-sm">
      <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
        <h3 className="tracking-tight text-xl font-semibold">Weekly Summary</h3>
      </div>
      <div className="p-6 pt-0">
        <div className="text-3xl font-bold text-primary">{Math.round(avgCalories).toLocaleString()}</div>
        <p className="text-xs text-muted-foreground">Avg. Daily Calories</p>
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="font-semibold text-md">{Math.round(avgProtein)}g</p>
            <p className="text-xs text-muted-foreground">Protein</p>
          </div>
          <div>
            <p className="font-semibold text-md">{Math.round(avgCarbs)}g</p>
            <p className="text-xs text-muted-foreground">Carbs</p>
          </div>
          <div>
            <p className="font-semibold text-md">{Math.round(avgFat)}g</p>
            <p className="text-xs text-muted-foreground">Fat</p>
          </div>
        </div>
        <div className="pt-4 mt-4 border-t border-border/50 text-xs text-muted-foreground">
          <p>Total this week: <strong>{totalCalories.toLocaleString()}</strong> kcal</p>
        </div>
      </div>
    </div>
  );
}