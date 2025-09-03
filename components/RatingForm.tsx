"use client";
import { useState } from "react";

export default function RatingForm({ 
  agentId, 
  studentId, 
  agentName,
  onSuccess 
}: { 
  agentId: string; 
  studentId: string;
  agentName: string;
  onSuccess?: () => void;
}) {
  const [stars, setStars] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (stars === 0) {
      alert('Please select a rating');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        body: JSON.stringify({ agentId, studentId, stars, feedback }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => {
          if (onSuccess) onSuccess();
        }, 1500);
      } else {
        const errorData = await res.json();
        alert(`Failed to submit rating: ${errorData.error}`);
      }
    } catch (error) {
      alert('Network error: Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return "😞 Poor - Not satisfied";
      case 2: return "😐 Fair - Could be better";
      case 3: return "😊 Good - Satisfied";
      case 4: return "😄 Very Good - Happy";
      case 5: return "🤩 Excellent - Highly recommend";
      default: return "";
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-6">
        <div className="text-4xl mb-2">✅</div>
        <p className="text-green-600 font-medium">Thanks for your feedback!</p>
        <p className="text-sm text-gray-600">Your {stars}-star rating has been submitted.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Rate {agentName}</h3>

        <div className="flex space-x-2 mb-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setStars(star)}
              className={`text-3xl transition-all duration-200 hover:scale-110 ${
                stars >= star ? "text-yellow-400" : "text-gray-400 hover:text-yellow-300"
              }`}
            >
              ★
            </button>
          ))}
        </div>

        {stars > 0 && (
          <p className="text-sm text-gray-600 mb-3">
            {getRatingText(stars)}
          </p>
        )}
      </div>

      <div>
        <textarea
          placeholder="Leave feedback (optional)"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          rows={3}
          maxLength={500}
        />
        <p className="text-xs text-gray-500 mt-1">{feedback.length}/500 characters</p>
      </div>

      <div className="flex space-x-2">
        {stars > 0 && (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {submitting ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </span>
            ) : (
              `Submit ${stars} Star${stars !== 1 ? 's' : ''}`
            )}
          </button>
        )}
        
        <button
          onClick={() => {
            setStars(0);
            setFeedback('');
            if (onSuccess) onSuccess();
          }}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}