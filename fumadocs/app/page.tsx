import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center min-h-screen text-center px-4 bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800">
      <div className="max-w-3xl mx-auto">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="text-5xl">👶</span>
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            BabyShopHub
          </h1>
        </div>

        {/* Tagline */}
        <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-2 font-medium">
          Complete Documentation
        </p>
        <p className="text-zinc-500 dark:text-zinc-500 mb-10 max-w-xl mx-auto">
          Everything you need — whether you&apos;re a parent shopping for your little one,
          or a developer building the next feature.
        </p>

        {/* Doc portals */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          <Link
            href="/docs/user-guide"
            className="group flex flex-col gap-3 p-6 rounded-2xl border border-pink-200 dark:border-pink-900 bg-white dark:bg-zinc-800 shadow-sm hover:shadow-lg hover:border-pink-400 dark:hover:border-pink-600 transition-all duration-200 text-left"
          >
            <span className="text-3xl">🛍️</span>
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                User Guide
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                For parents &amp; shoppers. Learn to browse products, manage orders, set up 2FA, use the AI assistant, and more.
              </p>
            </div>
            <span className="text-pink-500 text-sm font-medium mt-auto">
              Browse User Guide →
            </span>
          </Link>

          <Link
            href="/docs/developer-guide"
            className="group flex flex-col gap-3 p-6 rounded-2xl border border-purple-200 dark:border-purple-900 bg-white dark:bg-zinc-800 shadow-sm hover:shadow-lg hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-200 text-left"
          >
            <span className="text-3xl">🛠️</span>
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                Developer Guide
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                For contributors &amp; maintainers. Architecture, Firestore schemas, service deep-dives, deployment, and security rules.
              </p>
            </div>
            <span className="text-purple-500 text-sm font-medium mt-auto">
              Browse Developer Guide →
            </span>
          </Link>
        </div>

        {/* Quick stats */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-zinc-500 dark:text-zinc-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 inline-block"></span>
            Flutter 3.x · Dart 3
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-400 inline-block"></span>
            Firebase Auth · Firestore
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400 inline-block"></span>
            Groq AI · Cloudinary
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-pink-400 inline-block"></span>
            v0.1.0
          </span>
        </div>
      </div>
    </main>
  );
}
