import Link from 'next/link';

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Reuse the main sidebar from the homepage later, or make it community specific */}
        <aside className="hidden md:block md:col-span-3 lg:col-span-2 space-y-4">
             <Link href="/" className="block px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md">← Back Home</Link>
             <div className="h-px bg-gray-200 my-2"></div>
             <div className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3">Community Tools</div>
             <a href="#" className="block px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md">Wiki</a>
             <a href="#" className="block px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md">Rules</a>
        </aside>

        <div className="md:col-span-9 lg:col-span-10">
          {children}
        </div>
      </main>
    </div>
  );
}
