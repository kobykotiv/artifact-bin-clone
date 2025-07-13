import React, { useState } from 'react';
import { dbService } from '../../lib/services/db';
import { type ReviewData } from '../../lib/models/Review';

interface ReviewFormProps {
  artifactId: string;
  onReviewSubmitted: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ artifactId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || comment.trim() === '') {
      setError('Please provide a rating and a comment.');
      return;
    }

    try {
      const newReview: Omit<ReviewData, 'id' | 'createdAt' | 'updatedAt'> = {
        artifactId,
        rating,
        comment,
        userId: 'current-user-id', // TODO: Get from auth context
      };
      await dbService.createReview(newReview);
      onReviewSubmitted();
      setRating(0);
      setComment('');
      setError(null);
    } catch (err) {
      setError('Failed to submit review. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold">Leave a Review</h3>
      {error && <p className="text-red-500">{error}</p>}
      <div>
        <label htmlFor="rating" className="block text-sm font-medium text-gray-700">
          Rating
        </label>
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              type="button"
              key={star}
              onClick={() => setRating(star)}
              className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
          Comment
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          rows={4}
        />
      </div>
      <button
        type="submit"
        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Submit Review
      </button>
    </form>
  );
};

export { ReviewForm };
export default ReviewForm;
