import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';

interface FeedbackPayload {
  feedback_text: string;
  user_uid?: string;
}

const UV_Feedback: React.FC = () => {
  const [feedbackText, setFeedbackText] = useState<string>('');
  const currentUser = useAppStore(state => state.current_user);
  
  const submitFeedbackMutation = useMutation(async (payload: FeedbackPayload) => {
    const baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';
    const response = await axios.post(`${baseURL}/api/feedback`, payload);
    return response.data;
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const payload: FeedbackPayload = {
      feedback_text: feedbackText,
      user_uid: currentUser?.user_uid
    };

    submitFeedbackMutation.mutate(payload, {
      onSuccess: (data) => {
        alert('Thank you for your feedback!');
        setFeedbackText(''); // Clear the form on success
      },
      onError: (error) => {
        alert('Failed to submit feedback. Please try again.');
      }
    });
  };

  return (
    <>
      <div className="max-w-2xl mx-auto p-8">
        <h1 className="text-xl font-bold mb-4">User Feedback</h1>
        <form onSubmit={handleSubmit}>
          <label htmlFor="feedback" className="block text-sm font-medium text-gray-700">
            Your Feedback
          </label>
          <textarea
            id="feedback"
            rows={5}
            className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            required
          ></textarea>
          <button
            type="submit"
            className="mt-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={submitFeedbackMutation.isLoading}
          >
            {submitFeedbackMutation.isLoading ? 'Submitting...' : 'Submit Feedback'}
          </button>
        </form>
      </div>
    </>
  );
};

export default UV_Feedback;