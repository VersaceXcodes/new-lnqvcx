import React from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useAppStore } from '@/store/main'; // Import the Zustand store
import { Link } from 'react-router-dom';

// Interfaces for fetched data
interface ReportItem {
  report_uid: string;
  content_summary: string;
  reported_by: string;
  report_date: string;
}

interface Analytics {
  total_users: number;
  active_users: number;
  new_posts: number;
  comments_received: number;
}

const UV_AdminDashboard: React.FC = () => {
  const auth_token = useAppStore((state) => state.auth_token);

  // Fetch Reports
  const fetchReports = async (): Promise<ReportItem[]> => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/reports`, {
        headers: {
          Authorization: `Bearer ${auth_token}`,
        },
      });
      return data;
    } catch (error) {
      throw new Error('Error fetching reports');
    }
  };

  // Fetch Analytics
  const fetchAnalytics = async (): Promise<Analytics> => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/stats`, {
        headers: {
          Authorization: `Bearer ${auth_token}`,
        },
      });
      return data;
    } catch (error) {
      throw new Error('Error fetching analytics');
    }
  };

  // UseReactQuery for data fetching
  const { data: reports, isLoading: isLoadingReports, error: errorReports } = useQuery(['reports'], fetchReports);
  const { data: analytics, isLoading: isLoadingAnalytics, error: errorAnalytics } = useQuery(['analytics'], fetchAnalytics);

  return (
    <>
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Admin Dashboard</h1>

        {isLoadingReports || isLoadingAnalytics ? (
          <p>Loading data...</p>
        ) : errorReports || errorAnalytics ? (
          <p>Error loading data. Please try again later.</p>
        ) : (
          <>
            <section>
              <h2 className="text-lg font-semibold mb-2">Reported Content</h2>
              <ul className="list-disc pl-5">
                {reports?.map((report) => (
                  <li key={report.report_uid}>
                    Summary: {report.content_summary} - Reported by: {report.reported_by} on {report.report_date}
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-6">
              <h2 className="text-lg font-semibold mb-2">Site Analytics</h2>
              <div>
                <p>Total Users: {analytics?.total_users}</p>
                <p>Active Users: {analytics?.active_users}</p>
                <p>New Posts: {analytics?.new_posts}</p>
                <p>Comments Received: {analytics?.comments_received}</p>
              </div>
            </section>

            <div className="mt-6">
              <Link to="/feedback" className="text-blue-500">Provide Feedback</Link>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default UV_AdminDashboard;