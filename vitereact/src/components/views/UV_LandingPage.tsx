import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Define the structure of a post.
interface BlogPost {
  post_uid: string;
  author: string;
  title: string;
  created_at: string;
  tags: string;
  categories: string;
  // Add other fields based on the FetchBlogPostsResponse if needed
}

// Fetch function for popular posts
const fetchPopularPosts = async (): Promise<BlogPost[]> => {
  const { data } = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/blog_posts`, {
      params: { popular: "true" }
    }
  );
  return data.posts;
};

const UV_LandingPage: React.FC = () => {
  // Named function within useQuery
  const { data: popularPosts, isLoading, error } = useQuery<BlogPost[], Error>({
    queryKey: ["popularPosts"],
    queryFn: fetchPopularPosts,
  });

  return (
    <>
      <div className="px-4 py-8 mx-auto max-w-screen-xl text-center lg:px-6">
        {/* Hero Section */}
        <h1 className="mb-4 text-4xl font-extrabold leading-none tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
          Welcome to BlogVerse
        </h1>
        <p className="mb-8 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48">
          Share your stories, ideas, and creativity. Join a community of passionate bloggers.
        </p>
        <div className="flex justify-center mb-8 space-x-4">
          <Link
            to="/register"
            className="inline-flex items-center justify-center px-5 py-3 mr-3 text-base font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300"
          >
            Sign Up
          </Link>
          <Link
            to="#"
            className="inline-flex items-center justify-center px-5 py-3 text-base font-medium text-center text-gray-900 bg-gray-100 rounded-lg hover:bg-gray-200 focus:ring-4 focus:ring-gray-200"
          >
            Learn More
          </Link>
        </div>

        {/* Popular Posts Section */}
        <div className="grid gap-8 lg:grid-cols-3">
          {isLoading && <p>Loading posts...</p>}
          {error && <p>Failed to load posts: {error.message}</p>}
          {popularPosts && popularPosts.length > 0 ? (
            popularPosts.map((post) => (
              <div key={post.post_uid} className="p-6 bg-white border border-gray-200 rounded-lg shadow-md">
                <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900">{post.title}</h5>
                <p className="font-normal text-gray-700">by {post.author}</p>
                <p className="font-normal text-gray-500">{new Date(post.created_at).toLocaleDateString()}</p>
                <Link
                  to={`/post/${post.post_uid}`}
                  className="inline-flex items-center mt-3 text-blue-600 hover:underline"
                >
                  Read more
                </Link>
              </div>
            ))
          ) : (
            !isLoading && <p>No popular posts available.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default UV_LandingPage;