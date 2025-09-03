"use client";
import { useState } from "react";

export default function SimpleRating({ 
  agentId, 
  studentId,
  agentName 
}: { 
  agentId: string; 
  studentId: string;
  agentName: string;
}) {
  const [stars, setStars] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [alreadyRated, setAlreadyRated] = useState(false);

  const handleSubmit = async () => {
    console.log('🔍 Submitting rating:', { agentId, studentId, stars, feedback });
    
    const res = await fetch("/api/ratings", {
      method: "POST",
      body: JSON.stringify({ agentId, studentId, stars, feedback }),
      headers: { "Content-Type": "application/json" },
    });
    
    if (res.ok) {
      setSubmitted(true);
    } else {
      const errorData = await res.json();
      console.error('❌ Rating error:', errorData);
      
      if (errorData.error?.includes('duplicate key') || errorData.error?.includes('unique constraint')) {
        setAlreadyRated(true);
      } else {
        alert(`Error: ${errorData.error}`);
      }
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-4">
        <p className="text-green-600">✅ Thanks for your feedback!</p>
      </div>
    );
  }

  if (alreadyRated) {
    return (
      <div className="text-center py-4">
        <p className="text-blue-600">⭐ You have already rated this agent</p>
        <p className="text-sm text-gray-500">Each student can only rate an agent once</p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded">
      <h3 className="mb-2">Rate {agentName}</h3>

      <div className="flex space-x-2 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setStars(star)}
            className={`text-3xl ${stars >= star ? "text-yellow-400" : "text-gray-400"}`}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        placeholder="Leave feedback (optional)"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />

      <button
        onClick={handleSubmit}
        className="bg-blue-500 text-white px-4 py-2 rounded"
        disabled={stars === 0}
      >
        Submit
      </button>
    </div>
  );
}