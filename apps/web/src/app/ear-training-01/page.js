'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {
  const [exerciseData, setExerciseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const loadExerciseData = async () => {
      try {
        const response = await fetch('/api/load-exercise');
        if (!response.ok) {
          throw new Error('Failed to load exercise data');
        }
        const data = await response.json();
        setExerciseData(data);
      } catch (err) {
        console.error('Error loading exercise data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadExerciseData();
  }, []);

  const handleStartExercise = () => {
    if (exerciseData) {
      // Navigate to melody-bricks with JSON payload
      const params = new URLSearchParams({
        jsonPayload: JSON.stringify(exerciseData),
        returnTo: '/ear-training-01'
      });
      router.push(`/melody-bricks?${params.toString()}`);
    }
  };

  const handleViewResult = () => {
    // Placeholder for result viewing functionality
    alert('Result viewing functionality will be implemented later');
  };

  if (loading) {
    return (
      <div className="reactive-container">
        <div className="max-w-2xl mx-auto text-center space-y-6 py-12">
          <p className="text-lg md:text-xl text-gray-700">Loading exercise...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reactive-container">
        <div className="max-w-2xl mx-auto text-center space-y-6 py-12">
          <p className="text-lg md:text-xl text-red-600">Error loading exercise: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reactive-container">
      <div className="max-w-2xl mx-auto text-center space-y-6 py-12">
        <p className="text-lg md:text-xl text-gray-700">
          {exerciseData?.introText || 'Do the following exercise to train yourself to distinguish major 2nds, perfect 5th, and perfect octaves.'}
        </p>
        <div>
          <button 
            onClick={handleStartExercise}
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors"
          >
            start exercise
          </button>
        </div>
        <p className="text-lg md:text-xl text-gray-700">Click here to see how you did.</p>
        <div>
          <button 
            onClick={handleViewResult}
            className="inline-block bg-yellow-500 text-green-900 px-6 py-3 rounded-lg font-bold hover:bg-yellow-400 transition-colors"
          >
            view result
          </button>
        </div>
      </div>
    </div>
  );
}


