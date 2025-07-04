import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/main';

// TypeScript interfaces for data structures
interface BlogPost {
  post_uid: string;
  author: string;
  title: string;
  created_at: string;
  tags: string;
  categories: string;
}

interface FetchBlogPostsResponse {
  posts: BlogPost[];
}

const fetchBlogPosts = async (tags?: string, categories?: string, page: number = 1, token?: string): Promise<FetchBlogPostsResponse> => {
  const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/blog_posts`, {
    params: { tags, categories, page },
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
  return response.data;
};

const UV_BlogFeed: React.FC = () => {
  const [filters, setFilters] = useState<{ tags: string[]; categories: string[] }>({ tags: [], categories: [] });
  const [currentPage, setCurrentPage] = useState(1);
  const { auth_token } = useAppStore(state => state);

  const { data, isLoading, isError, error, refetch } = useQuery<FetchBlogPostsResponse, Error>(
    ['blogPosts', filters, currentPage],
    () => fetchBlogPosts(filters.tags.join(','), filters.categories.join(','), currentPage, auth_token),
    { keepPreviousData: true }
  );

  useEffect(() => {
    refetch();
  }, [filters, currentPage, refetch]);

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  return (
    <>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <input
            type="text"
            placeholder="Search by tags or categories..."
            className="border p-2 rounded w-full"
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                // Assume search by keyword
                setFilters({ ...filters, tags: [event.currentTarget.value] });
              }
            }}
          />
        </div>

        {isLoading ? (
          <div>Loading...</div>
        ) : isError ? (
          <div>Error: {error?.message}</div>
        ) : (
          <div className="space-y-4">
            {data?.posts.map((post) => (
              <div key={post.post_uid} className="border p-4 rounded shadow">
                <Link to={`/post/${post.post_uid}`} className="text-lg font-bold hover:underline">
                  {post.title}
                </Link>
                <div className="text-sm text-gray-500">
                  By {post.author} on {new Date(post.created_at).toLocaleDateString()}
                </div>
                <div className="text-sm">
                  Tags: {post.tags}, Categories: {post.categories}
                </div>
              </div>
            ))}
          </div>
        )}

        <button onClick={handleLoadMore} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
          Load More
        </button>
      </div>
    </>
  );
};

export default UV_BlogFeed;