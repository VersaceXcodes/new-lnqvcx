import React from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '@/store/main';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

const fetchSearchResults = async (tags: string): Promise<any[]> => {
  const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/blog_posts?tags=${tags}`);
  return data;
};

interface GV_TopNavProps {}

const GV_TopNav: React.FC<GV_TopNavProps> = () => {
  const auth_token = useAppStore((state) => state.auth_token);
  const current_user = useAppStore((state) => state.current_user);
  const notifications = useAppStore((state) => state.notifications);
  const clear_auth_data = useAppStore((state) => state.clear_auth_data);

  const isAuthenticated = !!auth_token;
  const isAdmin = Boolean(current_user?.role === 'admin'); // Adjusted to check admin role

  const [searchQuery, setSearchQuery] = React.useState('');

  const { data: searchResults, refetch, error } = useQuery({
    queryKey: ['searchResults', searchQuery],
    queryFn: () => fetchSearchResults(searchQuery),
    enabled: false, // Run query only on demand
  });

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      refetch();
    }
  };

  React.useEffect(() => {
    if (error) {
      console.error('Error fetching search results:', error);
    }
  }, [error]);

  return (
    <>
      <nav className="w-full bg-gray-800 p-4 flex justify-between items-center">
        
        <Link to="/" className="text-white text-lg font-bold">
          BlogVerse
        </Link>

        <div className="flex items-center space-x-4">
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Search posts..."
            className="p-2 rounded bg-gray-700 text-white"
          />

          {isAuthenticated && (
            <>
              <Link to="/profile" className="text-white">Profile</Link>

              <div className="relative">
                <span className="text-white">Notifications</span>
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </div>

              {isAdmin && (
                <Link to="/admin" className="text-white">Admin</Link>
              )}

              <button onClick={clear_auth_data} className="text-white">Logout</button>
            </>
          )}

          {!isAuthenticated && (
            <>
              <Link to="/login" className="text-white">Login</Link>
              <Link to="/register" className="text-white">Register</Link>
            </>
          )}
        </div>
        
      </nav>
    </>
  );
};

export default GV_TopNav;