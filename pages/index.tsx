import Layout from '@/components/Layout';
import Link from 'next/link';

export default function Home() {
  return (
    <Layout>
      <h2 className="text-xl font-semibold mb-4">Welcome</h2>
      <p className="text-gray-600 mb-6">Choose a section from the left to get started.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/companies" className="rounded border p-4 bg-white hover:shadow">
          <div className="font-medium">Companies</div>
          <div className="text-sm text-gray-600">View and manage companies.</div>
        </Link>
        <Link href="/assets/new" className="rounded border p-4 bg-white hover:shadow">
          <div className="font-medium">Add Asset</div>
          <div className="text-sm text-gray-600">Create a new asset and assign it.</div>
        </Link>
      </div>
    </Layout>
  );
}
