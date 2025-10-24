import React from 'react';

const MealCard = ({ meal, onDeleteMeal }) => {
  const mealTime = new Date(meal.date).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className="rounded-lg border bg-background/80 text-foreground transition-shadow hover:shadow-md">
       <div className="p-4 flex justify-between items-start gap-4">
        <div>
          <div className="flex items-baseline gap-2 mb-1">
            <p className="font-semibold text-primary">{meal.category}</p>
            <p className="text-xs text-muted-foreground">{mealTime}</p>
          </div>
          <p className="text-sm text-muted-foreground italic mb-2">"{meal.description}"</p>
          <ul className="text-sm list-disc pl-5 space-y-1">
            {meal.items.map((item, index) => (
              <li key={index}>
                <span className="font-medium">{item.name}</span> - <span className="text-muted-foreground">{item.calories} kcal</span>
              </li>
            ))}
          </ul>
           {meal.feedback && (
            <div className="mt-3 pt-3 border-t border-border/50">
              <p className="text-xs text-muted-foreground font-medium">Cosmic Feedback:</p>
              <p className="text-sm italic text-primary">"{meal.feedback}"</p>
            </div>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <p className="font-bold text-lg text-foreground">{meal.totalCalories} kcal</p>
          <button
            onClick={() => onDeleteMeal(meal._id)}
            className="text-destructive hover:underline text-xs mt-2 font-medium"
            aria-label={`Delete meal: ${meal.description}`}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export function MealLog({ meals, onDeleteMeal, title = "Meal Log" }) {
  const groupedMeals = meals.reduce((acc, meal) => {
    const date = new Date(meal.date).toLocaleDateString(undefined, {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(meal);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedMeals).sort((a, b) => new Date(b) - new Date(a));

  return (
    <div className="rounded-xl border bg-card/50 dark:bg-card/20 text-card-foreground shadow-lg backdrop-blur-sm">
      <div className="p-6">
        <h3 className="font-semibold tracking-tight text-xl">{title}</h3>
      </div>
      <div className="p-6 pt-0">
      {sortedDates.length > 0 ? (
        <div className="space-y-6">
          {sortedDates.map(date => (
            <div key={date}>
              <h4 className="font-semibold mb-3 text-md text-muted-foreground">{date}</h4>
              <div className="space-y-4">
                {groupedMeals[date].sort((a, b) => new Date(b.date) - new Date(a.date)).map(meal => (
                  <MealCard key={meal._id} meal={meal} onDeleteMeal={onDeleteMeal} />
                ))}
              </div>
            </div>
          ))}
        </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No meals logged for this period.</p>
          </div>
        )}
      </div>
    </div>
  );
}