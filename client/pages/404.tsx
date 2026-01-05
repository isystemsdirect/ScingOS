import Head from 'next/head';
import Link from 'next/link';
import { Layout } from '../components/layout/Layout';

export default function NotFound() {
  return (
    <>
      <Head>
        <title>404 - Page Not Found | ScingOS</title>
      </Head>

      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-9xl font-bold text-primary-600">404</h1>
            <h2 className="mt-4 text-3xl font-bold text-gray-900">Page not found</h2>
            <p className="mt-2 text-lg text-gray-600">
              Sorry, we couldn't find the page you're looking for.
            </p>
            <div className="mt-6">
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                Go back home
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}