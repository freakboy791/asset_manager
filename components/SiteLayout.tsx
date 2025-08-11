import Link from "next/link";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-semibold">Asset Tracker</Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <Link href="/companies" className="hover:text-blue-600">Companies</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-6">{children}</div>
      </main>

      <footer className="bg-white border-t">
        <div className="max-w-6xl mx-auto px-4 h-12 text-sm text-gray-500 flex items-center">
          © {new Date().getFullYear()} Asset Manager
        </div>
      </footer>
    </div>
  );
}
