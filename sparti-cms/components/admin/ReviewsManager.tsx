import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, Trash2, Package, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../../utils/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

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
  const [expandedReviews, setExpandedReviews] = useState<Set<number>>(new Set());
  const queryClient = useQueryClient();

  // Get all products first to fetch reviews
  const { data: products = [] } = useQuery({
    queryKey: ['products', currentTenantId],
    queryFn: async () => {
      if (!currentTenantId) {
        throw new Error('Tenant ID is required');
      }
      const response = await api.get('/api/shop/products', { tenantId: currentTenantId });
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const result = await response.json();
      return result.data || [];
    },
    enabled: !!currentTenantId,
  });

  // Fetch reviews for all products
  const { data: allReviews = [], isLoading } = useQuery({
    queryKey: ['reviews', currentTenantId],
    queryFn: async () => {
      const reviewsPromises = products.map(async (product: any) => {
        const response = await api.get(`/api/shop/products/${product.product_id}/reviews`, { tenantId: currentTenantId });
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
    enabled: products.length > 0 && !!currentTenantId,
  });

  const deleteMutation = useMutation({
    mutationFn: async (reviewId: number) => {
      if (!currentTenantId) {
        throw new Error('Tenant ID is required');
      }
      const response = await api.delete(`/api/shop/reviews/${reviewId}`, { tenantId: currentTenantId });
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

  const toggleExpand = (reviewId: number) => {
    setExpandedReviews(prev => {
      const next = new Set(prev);
      if (next.has(reviewId)) {
        next.delete(reviewId);
      } else {
        next.add(reviewId);
      }
      return next;
    });
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

  const renderStars = (rating: number, size: 'sm' | 'md' = 'md') => {
    const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${iconSize} ${
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
        <div className="space-y-4">
          {filteredReviews.map((review: Review) => (
            <ReviewCard
              key={review.id}
              review={review}
              isExpanded={expandedReviews.has(review.id)}
              onToggleExpand={() => toggleExpand(review.id)}
              onDelete={() => handleDelete(review.id)}
              renderStars={renderStars}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ReviewCardProps {
  review: Review;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onDelete: () => void;
  renderStars: (rating: number, size?: 'sm' | 'md') => React.ReactNode;
}

function ReviewCard({ review, isExpanded, onToggleExpand, onDelete, renderStars }: ReviewCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Review Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-gray-400" />
                  <span className="font-semibold text-gray-900">
                    {review.product_name || 'Unknown Product'}
                  </span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {review.product_slug}
                </Badge>
              </div>
              <div className="flex items-center gap-4 mb-2">
                <div className="flex items-center gap-2">
                  {renderStars(review.rating, 'sm')}
                  <span className="text-sm text-gray-600">({review.rating}/5)</span>
                </div>
                <div className="text-sm text-gray-600">
                  by <span className="font-medium">{review.user_name || 'Anonymous'}</span>
                  {review.user_email && (
                    <span className="text-gray-500 ml-1">({review.user_email})</span>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(review.date).toLocaleDateString()}
                </div>
              </div>
              {!isExpanded && (
                <p className="text-sm text-gray-600 line-clamp-2">
                  {review.content}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleExpand}
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    More
                  </>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Expanded Review Details */}
          {isExpanded && (
            <div className="pt-4 border-t border-gray-200 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-gray-900">Product Information</h4>
                  <div className="text-sm space-y-1 text-gray-600">
                    <p><strong>Product:</strong> {review.product_name || 'Unknown Product'}</p>
                    <p><strong>Slug:</strong> {review.product_slug || 'N/A'}</p>
                    <p><strong>Product ID:</strong> {review.product_id}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-gray-900">User Information</h4>
                  <div className="text-sm space-y-1 text-gray-600">
                    <p><strong>Name:</strong> {review.user_name || 'Anonymous'}</p>
                    {review.user_email && (
                      <p><strong>Email:</strong> {review.user_email}</p>
                    )}
                    <p><strong>User ID:</strong> {review.user_id}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-gray-900">Rating</h4>
                <div className="flex items-center gap-3">
                  {renderStars(review.rating, 'md')}
                  <span className="text-sm text-gray-600">{review.rating} out of 5 stars</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-gray-900">Review Content</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-200">
                  {review.content}
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-3 text-gray-900">Review Date</h4>
                <p className="text-sm text-gray-600">
                  {new Date(review.date).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
