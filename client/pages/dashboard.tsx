import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Layout } from '../components/layout/Layout';
import { useAuthStore } from '../lib/store/authStore';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { firestore } from '../lib/firebase';

interface Session {
  id: string;
  user_id: string;
  started_at: any;
  last_activity: any;
}

export default function Dashboard() {
  const router = useRouter();
  const { user, loading } = useAuthStore();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  const fetchSessions = async () => {
    if (!user) return;

    try {
      const q = query(
        collection(firestore, 'sessions'),
        where('user_id', '==', user.uid),
        orderBy('last_activity', 'desc'),
        limit(5)
      );

      const querySnapshot = await getDocs(q);
      const sessionsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Session[];

      setSessions(sessionsData);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoadingSessions(false);
    }
  };

  if (loading || !user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard - ScingOS</title>
      </Head>

      <Layout>
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="mt-2 text-gray-600">Welcome back, {user.email}</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
                <div className="mt-4 space-y-2">
                  <button className="w-full text-left px-4 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition">
                    Start New Session
                  </button>
                  <button className="w-full text-left px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition">
                    View Inspections
                  </button>
                  <button className="w-full text-left px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition">
                    Generate Report
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg col-span-2">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">Recent Sessions</h3>
                {loadingSessions ? (
                  <div className="mt-4 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                ) : sessions.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    {sessions.map((session) => (
                      <div key={session.id} className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-medium">Session {session.id.slice(0, 8)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-gray-500">No recent sessions</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}