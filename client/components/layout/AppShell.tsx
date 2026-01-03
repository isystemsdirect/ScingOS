import Head from 'next/head';
import type { ReactNode } from 'react';
import { Layout } from './Layout';

type AppShellProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
};

export default function AppShell({ title, subtitle, children }: AppShellProps) {
  const pageTitle = title ? `${title} - ScingOS` : 'ScingOS';

  return (
    <Layout>
      <Head>
        <title>{pageTitle}</title>
      </Head>

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {title ? (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            {subtitle ? <p className="mt-2 text-gray-600">{subtitle}</p> : null}
          </div>
        ) : null}

        {children}
      </div>
    </Layout>
  );
}
