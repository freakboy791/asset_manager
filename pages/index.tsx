import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-6">
          Tailwind is working 🎉
        </h1>
        <Link
          href="/companies"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go to Companies
        </Link>
      </div>
    </main>
  );
}
