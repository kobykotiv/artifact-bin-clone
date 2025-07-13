import React, { useState, useEffect } from 'react';
import { dbService } from '../../lib/services/db';
import { type ReviewData } from '../../lib/models/Review';

interface ReviewListProps {
  artifactId: string;
}

const ReviewList: React.FC<ReviewListProps> = ({ artifactId }) => {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const artifactReviews = await dbService.getReviewsByArtifactId(artifactId);
        setReviews(artifactReviews);
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [artifactId]);

  if (loading) {
    return <div className="text-center py-4">Loading reviews...</div>;
  }

  if (reviews.length === 0) {
    return <div className="text-center py-4 text-gray-500">No reviews yet.</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Reviews ({reviews.length})</h3>
      {reviews.map((review) => (
        <div key={review.id} className="border rounded-lg p-4 space-y-2">
          <div className="flex items-center space-x-2">
            <div className="flex text-yellow-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star} className={star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                  ★
                </span>
              ))}
            </div>
            <span className="text-sm text-gray-500">
              {new Date(review.createdAt).toLocaleDateString()}
            </span>
          </div>
          <p className="text-gray-700">{review.comment}</p>
        </div>
      ))}
    </div>
  );
};

export { ReviewList };
export default ReviewList;