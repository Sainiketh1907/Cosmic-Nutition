import React, { useState, useMemo } from 'react';

const BarChart = ({ data, title }) => {
  const maxValue = Math.max(...data.map(d => d.value), 1); // Use 1 to avoid division by zero
  const [activeBar, setActiveBar] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div>
      <h4 className="text-md font-semibold text-card-foreground mb-4">{title}</h4>
      {maxValue <= 1 && data.every(d => d.value === 0) ? (
         <div className="flex justify-center items-center h-48 bg-secondary/50 rounded-md p-2 border border-border">
            <p className="text-sm text-muted-foreground">No data for this period.</p>
         </div>
      ) : (
        <div 
          className="relative flex justify-around items-end h-48 bg-secondary/50 rounded-md p-2 gap-2 border border-border"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setActiveBar(null)}
        >
          {data.map((item, index) => (
            <div 
              key={index} 
              className="flex-1 flex flex-col items-center justify-end gap-1 h-full pt-4 group"
              onMouseOver={() => setActiveBar(item)}
            >
              <div
                className="w-full bg-primary/80 rounded-t-sm transition-all duration-300 group-hover:bg-primary"
                style={{ height: `${(item.value / maxValue) * 100}%` }}
              ></div>
              <span className="text-xs text-muted-foreground">{item.label}</span>
            </div>
          ))}

          {activeBar && (
            <div
              className="absolute z-10 p-3 rounded-lg shadow-lg bg-card border border-border text-card-foreground text-sm pointer-events-none transition-opacity duration-200"
              style={{
                left: tooltipPosition.x,
                top: tooltipPosition.y,
                transform: 'translate(-50%, -110%)', // Position above and centered on cursor
              }}
            >
              <p className="font-bold mb-1">{activeBar.label}</p>
              <p><strong>Calories:</strong> {Math.round(activeBar.value).toLocaleString()} kcal</p>
              <p><strong>Protein:</strong> {Math.round(activeBar.macros.protein)} g</p>
              <p><strong>Carbs:</strong> {Math.round(activeBar.macros.carbs)} g</p>
              <p><strong>Fat:</strong> {Math.round(activeBar.macros.fat)} g</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export function NutritionCharts({ meals }) {
  const [view, setView] = useState('daily'); // 'daily' or 'weekly'

  const { dailyData, weeklyData } = useMemo(() => {
    // --- Daily Data Processing ---
    const dailyMap = new Map();
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-CA'); // YYYY-MM-DD format
      dailyMap.set(key, { calories: 0, protein: 0, carbs: 0, fat: 0 });
    }

    meals.forEach(meal => {
      const mealDate = new Date(meal.date);
      const key = mealDate.toLocaleDateString('en-CA');
      if (dailyMap.has(key)) {
        const dayData = dailyMap.get(key);
        dayData.calories += meal.totalCalories;
        meal.items.forEach(item => {
          dayData.protein += item.protein || 0;
          dayData.carbs += item.carbs || 0;
          dayData.fat += item.fat || 0;
        });
      }
    });

    const processedDailyData = Array.from(dailyMap.entries())
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([date, data]) => ({
        label: new Date(date).toLocaleDateString(undefined, { weekday: 'short' }),
        value: data.calories,
        macros: { protein: data.protein, carbs: data.carbs, fat: data.fat }
      }));

    // --- Weekly Data Processing ---
    const getWeekKey = (d) => {
      const date = new Date(d);
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() + 4 - (date.getDay() || 7));
      const yearStart = new Date(date.getFullYear(), 0, 1);
      const weekNo = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
      return `W${weekNo}`;
    }

    const weeklyMap = new Map();
    const today = new Date();
    for (let i = 0; i < 4; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - (i * 7));
        const key = `${d.getFullYear()}-${getWeekKey(d)}`;
        if (!weeklyMap.has(key)) {
             weeklyMap.set(key, { calories: 0, protein: 0, carbs: 0, fat: 0, date: d });
        }
    }
    
    meals.forEach(meal => {
      const mealDate = new Date(meal.date);
      const key = `${mealDate.getFullYear()}-${getWeekKey(mealDate)}`;
      for(let [mapKey, weekData] of weeklyMap.entries()){
        const weekStart = new Date(weekData.date);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        if(mealDate >= weekStart && mealDate <= weekEnd){
           weekData.calories += meal.totalCalories;
            meal.items.forEach(item => {
              weekData.protein += item.protein || 0;
              weekData.carbs += item.carbs || 0;
              weekData.fat += item.fat || 0;
            });
           break;
        }
      }
    });
    
    const processedWeeklyData = Array.from(weeklyMap.entries())
      .sort((a,b) => a[1].date - b[1].date)
      .map(([weekKey, data]) => ({
        label: weekKey.split('-')[1],
        value: data.calories,
        macros: { protein: data.protein, carbs: data.carbs, fat: data.fat, }
      }));

    return { dailyData: processedDailyData, weeklyData: processedWeeklyData };
  }, [meals]);
  
  const currentData = view === 'daily' ? dailyData : weeklyData;
  const totalMacros = currentData.reduce((acc, day) => {
      acc.protein += day.macros.protein;
      acc.carbs += day.macros.carbs;
      acc.fat += day.macros.fat;
      return acc;
  }, { protein: 0, carbs: 0, fat: 0 });

  const divisor = currentData.filter(d => d.value > 0).length || 1;

  return (
    <div className="rounded-xl border bg-card/50 dark:bg-card/20 text-card-foreground shadow-lg backdrop-blur-sm">
      <div className="p-6 flex justify-between items-center">
        <h3 className="font-semibold tracking-tight text-xl">Nutrition Trends</h3>
        <div className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
          <button
            onClick={() => setView('daily')}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${view === 'daily' ? 'bg-background text-foreground shadow' : 'hover:bg-background/50'}`}
            aria-pressed={view === 'daily'}
          >
            Daily
          </button>
          <button
            onClick={() => setView('weekly')}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${view === 'weekly' ? 'bg-background text-foreground shadow' : 'hover:bg-background/50'}`}
            aria-pressed={view === 'weekly'}
          >
            Weekly
          </button>
        </div>
      </div>
      
      <div className="p-6 pt-0">
        <BarChart
          data={currentData}
          title={`Calorie Intake - Last ${view === 'daily' ? '7 Days' : '4 Weeks'}`}
        />
        <div className="mt-6 pt-4 border-t border-border/50">
          <h4 className="text-md font-semibold text-card-foreground mb-2">
            Average Macronutrients ({view === 'daily' ? 'per day' : 'per week'})
          </h4>
          <div className="grid grid-cols-3 gap-4 text-center">
             <div>
                <p className="font-semibold text-lg">{Math.round(totalMacros.protein / divisor)}g</p>
                <p className="text-xs text-muted-foreground">Protein</p>
             </div>
             <div>
                <p className="font-semibold text-lg">{Math.round(totalMacros.carbs / divisor)}g</p>
                <p className="text-xs text-muted-foreground">Carbs</p>
             </div>
             <div>
                <p className="font-semibold text-lg">{Math.round(totalMacros.fat / divisor)}g</p>
                <p className="text-xs text-muted-foreground">Fat</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}