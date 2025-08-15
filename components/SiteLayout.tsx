// components/SiteLayout.tsx
import Link from "next/link";

export default function SiteLayout({
  children,
  pathname,
}: {
  children: React.ReactNode;
  pathname: string;
}) {
  const showLayout = pathname !== "/";

  if (!showLayout) {
    return <>{children}</>; // Login page: no layout
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-black text-white py-4 px-6">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <h1 className="text-xl font-bold">assetTRAC</h1>
          <nav className="space-x-4">
            <Link href="/companies" className="hover:underline">
              Companies
            </Link>
            <Link href="/assets" className="hover:underline">
              Assets
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow bg-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4">{children}</div>
      </main>

      <footer className="bg-black text-white text-center py-4 text-sm">
        &copy; {new Date().getFullYear()} assetTRAC. All rights reserved.
      </footer>
    </div>
  );
}
