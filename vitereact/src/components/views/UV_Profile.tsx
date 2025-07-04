import React, { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAppStore } from '@/store/main';
import { Link } from 'react-router-dom';

interface UserProfile {
  username: string;
  bio: string;
  profile_picture_url: string;
  authored_posts: Array<{ post_uid: string; title: string }>;
}

const fetchUserProfile = async (user_uid: string): Promise<UserProfile | null> => {
  if (!user_uid) return null;
  const { data } = await axios.get(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/users/${user_uid}`
  );
  return data;
};

const updateUserProfile = async ({
  user_uid,
  profile,
}: {
  user_uid: string;
  profile: Partial<UserProfile>;
}): Promise<void> => {
  const requestData = { username: profile.username, bio: profile.bio, profile_picture_url: profile.profile_picture_url };
  await axios.put(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/users/${user_uid}`,
    requestData
  );
};

const UV_Profile: React.FC = () => {
  const queryClient = useQueryClient();

  const { current_user, set_current_user } = useAppStore((state) => ({
    current_user: state.current_user,
    set_current_user: state.set_current_user,
  }));

  const { data, isLoading, isError, refetch } = useQuery<UserProfile, Error>(
    ['userProfile', current_user?.user_uid],
    () => current_user?.user_uid ? fetchUserProfile(current_user.user_uid) : Promise.resolve(null),
    {
      enabled: !!current_user?.user_uid,
    }
  );

  const { mutate: saveUserProfile, isLoading: isSaving } = useMutation(updateUserProfile, {
    onSuccess: (newProfile: UserProfile) => {
      set_current_user({ ...current_user, ...newProfile });
      queryClient.invalidateQueries(['userProfile', current_user?.user_uid]);
    },
  });

  const handleSaveChanges = () => {
    if (data && current_user?.user_uid) {
      const updatedProfile = { username: data.username, bio: data.bio, profile_picture_url: data.profile_picture_url };
      saveUserProfile({ user_uid: current_user.user_uid, profile: updatedProfile });
    }
  };

  return (
    <>
      {isLoading ? (
        <p>Loading...</p>
      ) : isError ? (
        <p>Error loading profile.</p>
      ) : (
        <div className="container mx-auto p-4">
          <div className="bg-white shadow-md rounded p-6 mb-4">
            <div className="flex items-center mb-4">
              <img
                className="w-16 h-16 rounded-full mr-4"
                src={data?.profile_picture_url}
                alt="Profile"
              />
              <div>
                <input
                  type="text"
                  value={data?.username || ''}
                  onChange={(e) => set_current_user({ ...current_user, username: e.target.value })}
                  className="border-b-2 focus:outline-none focus:ring ring-indigo-300"
                  placeholder="Username"
                />
              </div>
            </div>
            <textarea
              value={data?.bio || ''}
              onChange={(e) => set_current_user({ ...current_user, bio: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded mb-2"
              placeholder="Your bio..."
            />
            <button
              onClick={handleSaveChanges}
              className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
          <div className="bg-white shadow-md rounded p-4">
            <h3 className="text-lg font-semibold mb-2">Authored Posts</h3>
            {data?.authored_posts.length === 0 ? (
              <p>No posts yet.</p>
            ) : (
              <ul>
                {data?.authored_posts.map((post) => (
                  <li key={post.post_uid} className="mb-1">
                    <Link to={`/post/${post.post_uid}`} className="text-blue-500 hover:underline">
                      {post.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default UV_Profile;