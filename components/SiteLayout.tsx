// components/SiteLayout.tsx
import { ReactNode } from "react";
import Link from "next/link";

interface SiteLayoutProps {
  children: ReactNode;
  pathname: string;
}

export default function SiteLayout({ children, pathname }: SiteLayoutProps) {
  const hideLayout = pathname === "/";

  if (hideLayout) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-blue-600 text-white p-4 shadow">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold">Asset Manager</h1>
          <nav className="space-x-4">
            <Link href="/companies" className="hover:underline">
              Companies
            </Link>
            <Link href="/assets" className="hover:underline">
              Assets
            </Link>
            <Link href="/logout" className="hover:underline">
              Logout
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto p-4">{children}</main>

      <footer className="bg-gray-200 text-center p-4 text-sm text-gray-700">
        &copy; {new Date().getFullYear()} Asset Manager. All rights reserved.
      </footer>
    </div>
  );
}
