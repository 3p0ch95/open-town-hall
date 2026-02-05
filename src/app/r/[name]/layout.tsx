import Link from 'next/link';

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Community Sidebar */}
        <aside className="hidden md:block md:col-span-3 lg:col-span-2 space-y-4">
             <Link href="/" className="block px-3 py-2 text-zinc-400 hover:bg-zinc-900 rounded-md transition-colors text-sm">← Back Home</Link>
             <div className="h-px bg-zinc-800 my-2"></div>
             <div className="text-xs font-bold text-zinc-600 uppercase tracking-wider px-3">Community Tools</div>
             <a href="#" className="block px-3 py-2 text-zinc-400 hover:bg-zinc-900 rounded-md transition-colors text-sm">Wiki</a>
             <a href="#" className="block px-3 py-2 text-zinc-400 hover:bg-zinc-900 rounded-md transition-colors text-sm">Rules</a>
        </aside>

        <div className="md:col-span-9 lg:col-span-10">
          {children}
        </div>
      </main>
    </div>
  );
}
