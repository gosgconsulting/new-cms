import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, Trash2, Package, Search } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Review {
  id: number;
  product_id: number;
  user_id: number;
  user_name: string | null;
  user_email: string | null;
  content: string;
  rating: number;
  date: string;
  product_name?: string;
  product_slug?: string;
}

interface ReviewsManagerProps {
  currentTenantId: string;
}

export default function ReviewsManager({ currentTenantId }: ReviewsManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const queryClient = useQueryClient();

  // Get all products first to fetch reviews
  const { data: products = [] } = useQuery({
    queryKey: ['products', currentTenantId],
    queryFn: async () => {
      const response = await api.get('/api/shop/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const result = await response.json();
      return result.data || [];
    },
  });

  // Fetch reviews for all products
  const { data: allReviews = [], isLoading } = useQuery({
    queryKey: ['reviews', currentTenantId],
    queryFn: async () => {
      const reviewsPromises = products.map(async (product: any) => {
        const response = await api.get(`/api/shop/products/${product.product_id}/reviews`);
        if (response.ok) {
          const result = await response.json();
          return (result.data || []).map((review: Review) => ({
            ...review,
            product_name: product.name,
            product_slug: product.slug,
          }));
        }
        return [];
      });
      const reviewsArrays = await Promise.all(reviewsPromises);
      return reviewsArrays.flat();
    },
    enabled: products.length > 0,
  });

  const deleteMutation = useMutation({
    mutationFn: async (reviewId: number) => {
      const response = await api.delete(`/api/shop/reviews/${reviewId}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete review');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', currentTenantId] });
    },
  });

  const handleDelete = async (reviewId: number) => {
    if (!confirm('Are you sure you want to delete this review?')) {
      return;
    }
    deleteMutation.mutate(reviewId);
  };

  const filteredReviews = allReviews.filter((review: Review) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        review.content.toLowerCase().includes(searchLower) ||
        review.user_name?.toLowerCase().includes(searchLower) ||
        review.product_name?.toLowerCase().includes(searchLower)
      );
    }
    if (ratingFilter !== 'all') {
      return review.rating === parseInt(ratingFilter);
    }
    return true;
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reviews</h1>
        <p className="text-muted-foreground mt-1">Manage product reviews</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reviews..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="px-3 py-2 border border-border rounded-md bg-background"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="text-center py-12">Loading reviews...</div>
      ) : filteredReviews.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No reviews found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-3 font-semibold">Product</th>
                  <th className="px-6 py-3 font-semibold">User</th>
                  <th className="px-6 py-3 font-semibold">Rating</th>
                  <th className="px-6 py-3 font-semibold">Review</th>
                  <th className="px-6 py-3 font-semibold">Date</th>
                  <th className="px-6 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReviews.map((review: Review) => (
                  <tr key={review.id} className="border-t border-gray-200 transition-colors hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {review.product_name || 'Unknown Product'}
                          </div>
                          <div className="text-xs text-gray-500">{review.product_slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {review.user_name || 'Anonymous'}
                        </div>
                        {review.user_email && (
                          <div className="text-xs text-gray-500">{review.user_email}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {renderStars(review.rating)}
                        <span className="ml-2 text-sm text-gray-600">({review.rating})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 line-clamp-2 max-w-md">
                        {review.content}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {new Date(review.date).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedReview(review)}
                        >
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(review.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedReview && (
        <ReviewDetailDialog
          review={selectedReview}
          onClose={() => setSelectedReview(null)}
        />
      )}
    </div>
  );
}

interface ReviewDetailDialogProps {
  review: Review;
  onClose: () => void;
}

function ReviewDetailDialog({ review, onClose }: ReviewDetailDialogProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Review Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Product</h3>
            <p className="text-sm">{review.product_name || 'Unknown Product'}</p>
            <p className="text-xs text-muted-foreground">{review.product_slug}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">User</h3>
            <p className="text-sm">{review.user_name || 'Anonymous'}</p>
            {review.user_email && (
              <p className="text-xs text-muted-foreground">{review.user_email}</p>
            )}
          </div>
          <div>
            <h3 className="font-semibold mb-2">Rating</h3>
            <div className="flex items-center">
              {renderStars(review.rating)}
              <span className="ml-2 text-sm text-gray-600">({review.rating} out of 5)</span>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Review</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{review.content}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Date</h3>
            <p className="text-sm text-gray-600">
              {new Date(review.date).toLocaleString()}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
