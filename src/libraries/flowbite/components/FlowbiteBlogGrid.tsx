"use client";

import React from "react";
import type { ComponentSchema, SchemaItem } from "../../../../sparti-cms/types/schema";
import FlowbiteSection from "./FlowbiteSection";
import { Card } from "flowbite-react";

interface FlowbiteBlogGridProps {
  component: ComponentSchema;
  className?: string;
}

/**
 * Flowbite Blog Grid Component
 * 
 * Displays blog posts in a responsive grid layout
 * Following Diora pattern for data extraction
 */
const FlowbiteBlogGrid: React.FC<FlowbiteBlogGridProps> = ({
  component,
  className = "",
}) => {
  const props = component.props || {};
  const items = component.items || [];

  // Helper function to get array data
  const getArray = (key: string) => {
    const arr = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() && i.type === "array"
    ) as any;
    return Array.isArray(arr?.items) ? (arr.items as any[]) : [];
  };

  // Get blog posts from items array or props
  const blogPosts = getArray("posts") || props.posts || [];

  // Format date helper
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Get title from props or items
  const getHeading = (key: string) => {
    const item = items.find(
      (i) => i.key?.toLowerCase() === key.toLowerCase() &&
      i.type === "heading"
    ) as any;
    return item?.content || "";
  };

  const sectionTitle = getHeading("title") || props.title || "";
  const sectionSubtitle = props.subtitle || "";

  // Default empty state
  if (blogPosts.length === 0) {
    return (
      <FlowbiteSection 
        title={sectionTitle}
        subtitle={sectionSubtitle}
        className={className}
      >
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 text-lg">No blog posts available.</p>
        </div>
      </FlowbiteSection>
    );
  }

  return (
    <FlowbiteSection 
      title={sectionTitle}
      subtitle={sectionSubtitle}
      className={className}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {blogPosts.map((post: any, index: number) => {
          const postImage = post.image || post.featured_image || "/placeholder.svg";
          const postTitle = post.title || "Untitled Post";
          const postExcerpt = post.excerpt || post.description || "";
          const postDate = formatDate(post.date || post.published_date || "");
          const postReadTime = post.readTime || post.read_time || "5 min read";
          const postCategory = post.category || post.category_name || "";
          const postSlug = post.slug || `post-${index}`;

          return (
            <Card
              key={post.id || index}
              className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer"
              href={`/blog/${postSlug}`}
            >
              <div className="relative overflow-hidden">
                <img 
                  src={postImage}
                  alt={postTitle}
                  className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {postCategory && (
                  <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                    {postCategory}
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {postDate && (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{postDate}</span>
                    </>
                  )}
                  {postReadTime && (
                    <>
                      <svg className="w-4 h-4 ml-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{postReadTime}</span>
                    </>
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-300">
                  {postTitle}
                </h3>

                {postExcerpt && (
                  <p className="text-gray-700 dark:text-gray-300 line-clamp-3 mb-4">
                    {postExcerpt}
                  </p>
                )}

                <div className="flex items-center text-primary font-medium group-hover:underline">
                  Read more
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </FlowbiteSection>
  );
};

export default FlowbiteBlogGrid;

