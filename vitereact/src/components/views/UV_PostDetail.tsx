import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAppStore } from '@/store/main';
import { Link } from 'react-router-dom';

interface PostContent {
  post_uid: string;
  title: string;
  body_content: string;
  author: string;
  publication_date: string;
  tags: string[];
}

interface Comment {
  comment_uid: string;
  author: string;
  text: string;
  created_at: string;
}

interface CommentPayload {
  post_uid: string;
  comment_text: string;
  commenter_uid: string;
}

interface CommentResponse {
  success: boolean;
  message: string;
  comment_uid?: string;
}

const fetchPostContent = async (post_uid: string): Promise<PostContent> => {
  const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/blog_posts/${post_uid}`);
  return data.post; // Adjusted to match expected data property
};

const fetchComments = async (post_uid: string): Promise<Comment[]> => {
  const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/comments?post_uid=${post_uid}`);
  return data.comments; // Adjusted to match expected data property
};

const UV_PostDetail: React.FC = () => {
  const { post_uid } = useParams<'post_uid'>();
  const { current_user } = useAppStore();

  const { data: postContent, isLoading: postLoading, error: postError } = useQuery<PostContent, Error>(
    ['postContent', post_uid],
    () => fetchPostContent(post_uid!),
    { enabled: !!post_uid }
  );

  const { data: comments, isLoading: commentsLoading, error: commentsError } = useQuery<Comment[], Error>(
    ['comments', post_uid],
    () => fetchComments(post_uid!),
    { enabled: !!post_uid }
  );

  const queryClient = useQueryClient();

  const commentMutation = useMutation<CommentResponse, Error, CommentPayload>(
    async (newComment) => {
      const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/comments`, newComment);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['comments', post_uid]);
      },
    }
  );

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const commentText = (e.target as any).elements.commentText.value;
    if (!commentText.trim()) return; // Added validation for non-empty input
    commentMutation.mutate({ post_uid: post_uid!, comment_text: commentText, commenter_uid: current_user?.user_uid ?? '' }); // Included commenter_uid
  };

  if (postLoading || commentsLoading) return <div>Loading...</div>;
  if (postError || commentsError) return <div>Error loading data...</div>;

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <h1 className="text-3xl font-bold">{postContent?.title}</h1>
          <p className="text-sm text-gray-600">By <Link to={`/profile/${postContent?.author}`} className="text-blue-500">{postContent?.author}</Link> - {postContent?.publication_date}</p>
          <div className="mt-4">
            <p>{postContent?.body_content}</p>
          </div>
        </div>
        <div className="mt-8">
          <h2 className="text-2xl font-semibold">Comments</h2>
          {comments?.map((comment) => (
            <div key={comment.comment_uid} className="mt-4 p-4 border-t border-gray-200">
              <p className="text-gray-800">{comment.text}</p>
              <p className="text-sm text-gray-500">- {comment.author} {comment.created_at}</p>
            </div>
          ))}
        </div>
        {current_user && (
          <form onSubmit={handleCommentSubmit} className="mt-8">
            <textarea name="commentText" rows={3} className="w-full border border-gray-300 rounded p-2" placeholder="Write your comment..." />
            <button type="submit" className="mt-2 px-4 py-2 bg-blue-600 text-white rounded">Submit Comment</button>
          </form>
        )}
      </div>
    </>
  );
};

export default UV_PostDetail;