import Link from 'next/link';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gray-50 text-gray-900">
      <aside className="w-64 bg-gray-900 text-white">
        <div className="p-6 border-b border-white/10">
          <div className="text-xl font-bold">Asset Tracker</div>
          <div className="text-xs text-gray-300 mt-1">Your Logo</div>
        </div>
        <nav className="p-4 space-y-2">
          <Link className="block rounded px-3 py-2 hover:bg-white/10" href="/">Home</Link>
          <Link className="block rounded px-3 py-2 hover:bg-white/10" href="/companies">Companies</Link>
          <Link className="block rounded px-3 py-2 hover:bg-white/10" href="/assets/new">Add Asset</Link>
        </nav>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="bg-white border-b p-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <div className="text-sm text-gray-500">v0.1</div>
          </div>
        </header>

        <section className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">{children}</div>
        </section>

        <footer className="bg-white border-t p-4 text-sm text-gray-500">
          <div className="max-w-6xl mx-auto">&copy; {new Date().getFullYear()} Asset Manager</div>
        </footer>
      </main>
    </div>
  );
}
