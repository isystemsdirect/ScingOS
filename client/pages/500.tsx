import Head from 'next/head';
import Link from 'next/link';
import { Layout } from '../components/layout/Layout';

export default function ServerError() {
  return (
    <>
      <Head>
        <title>500 - Server Error | ScingOS</title>
      </Head>

      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-9xl font-bold text-red-600">500</h1>
            <h2 className="mt-4 text-3xl font-bold text-gray-900">Server error</h2>
            <p className="mt-2 text-lg text-gray-600">
              Something went wrong. Please try again later.
            </p>
            <div className="mt-6 space-x-4">
              <Link href="/" className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">
                Go home
              </Link>
              <button onClick={() => window.location.reload()} className="inline-flex items-center px-4 py-2 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                Reload
              </button>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}