import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen">
      <aside className="w-60 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-6">Asset Tracker</h2>
        <ul className="space-y-2">
          <li>
            <Link href="/companies" className="hover:underline">Companies</Link>
          </li>
          <li>
            <Link href="/assets/new" className="hover:underline">Add Asset</Link>
          </li>
        </ul>
      </aside>
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-semibold mb-4">Welcome to the Asset Tracker</h1>
        <p>Select a section from the menu to get started.</p>
      </main>
    </div>
  );
}
