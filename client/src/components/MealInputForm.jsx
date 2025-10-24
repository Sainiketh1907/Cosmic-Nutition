
import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import API_URL from '../config.js';

export function MealInputForm({ onAddMeal, setError }) {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { getAccessTokenSilently } = useAuth0();
  const [feedbackData, setFeedbackData] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const token = await getAccessTokenSilently();

      if (!token) {
        throw new Error("Authentication error. Please log in again.");
      }

      const response = await fetch(`${API_URL}/meals/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ description: inputText }),
      });
      
      const contentType = response.headers.get("content-type");

      if (!response.ok) {
        let errorMessage = "Failed to analyze meal due to a server issue.";
        if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
        } else {
            errorMessage = `Server error (${response.status}): The response was not in the expected format. Please check the backend server logs.`;
        }
        throw new Error(errorMessage);
      }
      
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Received an invalid response format from the server. Expected JSON.");
      }
      
      const analysisResult = await response.json();

      const newMeal = {
        ...analysisResult,
        description: inputText,
      };

      onAddMeal(newMeal);
      setInputText('');

      // show Cosmic Feedback popup
      setFeedbackData(analysisResult);
      setShowFeedback(true);

    } catch (error) {
      console.error("Error analyzing meal:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let timer;
    if (showFeedback) {
      timer = setTimeout(() => setShowFeedback(false), 5000);
    }
    return () => clearTimeout(timer);
  }, [showFeedback]);

  return (
    <div className="rounded-xl border bg-card/50 dark:bg-card/20 text-card-foreground shadow-lg backdrop-blur-sm">
      <div className="p-6">
        <h3 className="font-semibold tracking-tight text-xl">Log a New Meal</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Describe your meal and let our Cosmic AI do the rest.
        </p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="p-6 pt-0">
          <textarea
            id="meal-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="e.g., 'For breakfast I had two eggs, a slice of toast with butter, and a black coffee'"
            className="flex min-h-[100px] w-full rounded-md border border-input bg-background/80 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="New meal description"
            disabled={isLoading}
          />
        </div>
        {/* Cosmic Feedback toast (green) - shows single-line feedback for 5s */}
        {showFeedback && feedbackData && (
          <div className="fixed inset-0 z-50 pointer-events-none">
            <div className="flex justify-center pt-6">
              <div
                role="status"
                aria-live="polite"
                onClick={() => setShowFeedback(false)}
                className="pointer-events-auto max-w-xl w-full inline-flex items-center justify-center mx-4 rounded-md bg-green-600/95 px-4 py-3 text-sm text-white shadow-lg cursor-pointer"
              >
                {feedbackData.feedback || feedbackData.feedbackText || 'Nice — feedback saved.'}
              </div>
            </div>
          </div>
        )}
        <div className="flex items-center justify-end p-6 pt-0">
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </>
            ) : (
              'Add Meal'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
