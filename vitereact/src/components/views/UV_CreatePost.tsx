import React, { useState } from 'react';
import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
import { useAppStore } from '@/store/main';
import { Link } from 'react-router-dom';

interface NewPost {
  title: string;
  body_content: string;
  tags: string;
  categories: string;
  status: 'draft' | 'published' | 'scheduled';
}

const UV_CreatePost: React.FC = () => {
  const [newPost, setNewPost] = useState<NewPost>({
    title: '',
    body_content: '',
    tags: '',
    categories: '',
    status: 'draft',
  });

  const auth_token = useAppStore((state) => state.auth_token);

  const createBlogPost = async (post: NewPost) => {
    const { data } = await axios.post(
      `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000'}/api/blog_posts`,
      post,
      {
        headers: {
          Authorization: auth_token ? `Bearer ${auth_token}` : undefined,
        },
      }
    );
    return data;
  };

  const createPostMutation = useMutation(createBlogPost, {
    onSuccess: () => {
      alert('Post processed successfully!');
      setNewPost({
        title: '',
        body_content: '',
        tags: '',
        categories: '',
        status: 'draft',
      });
    },
    onError: (error: any) => {
      alert(`Something went wrong: ${error.message}`);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewPost((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveDraft = () => {
    setNewPost((prev) => ({ ...prev }));
    createPostMutation.mutate({ ...newPost, status: 'draft' });
  };

  const handlePublishPost = () => {
    setNewPost((prev) => ({ ...prev }));
    createPostMutation.mutate({ ...newPost, status: 'published' });
  };

  const handleSchedulePost = () => {
    setNewPost((prev) => ({ ...prev }));
    createPostMutation.mutate({ ...newPost, status: 'scheduled' });
  };

  return (
    <>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Create Blog Post</h1>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">Title</label>
          <input
            type="text"
            name="title"
            value={newPost.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">Content</label>
          <textarea
            name="body_content"
            value={newPost.body_content}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded h-48"
          ></textarea>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">Tags</label>
          <input
            type="text"
            name="tags"
            value={newPost.tags}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-bold mb-2">Categories</label>
          <input
            type="text"
            name="categories"
            value={newPost.categories}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
        </div>
        <div className="flex space-x-4">
          <button
            onClick={handleSaveDraft}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Save Draft
          </button>
          <button
            onClick={handlePublishPost}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Publish
          </button>
          <button
            onClick={handleSchedulePost}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Schedule
          </button>
          <Link to="/profile" className="text-blue-700 hover:underline">
            Back to Profile
          </Link>
        </div>
      </div>
    </>
  );
};

export default UV_CreatePost;