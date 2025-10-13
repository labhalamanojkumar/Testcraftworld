import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Home | Testcraft',
  description: 'Welcome to Testcraft - A modern blogging platform built with Next.js 15',
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 md:p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <div className="flex flex-col items-center lg:items-start">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Testcraft
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8">
            Modern Blogging Platform
          </p>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
              Next.js 15
            </span>
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
              React 19
            </span>
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full">
              Coolify
            </span>
            <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full">
              Nixpacks
            </span>
          </div>
        </div>
      </div>

      <div className="relative flex place-items-center mb-16">
        <div className="text-center">
          <h2 className="text-2xl md:text-4xl font-semibold mb-4">
            Welcome to Next.js 15 with Coolify
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Built with the latest Next.js 15 features, deployed seamlessly with Coolify's Nixpacks build system.
          </p>
        </div>
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left gap-6">
        <div className="group rounded-lg border border-gray-200 dark:border-gray-800 px-5 py-4 transition-all hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/10">
          <h3 className="mb-3 text-2xl font-semibold text-blue-600 dark:text-blue-400">Next.js 15</h3>
          <p className="m-0 max-w-[30ch] text-sm text-gray-600 dark:text-gray-300">
            Latest Next.js 15 with App Router, React 19 support, and enhanced performance optimizations.
          </p>
        </div>

        <div className="group rounded-lg border border-gray-200 dark:border-gray-800 px-5 py-4 transition-all hover:border-green-300 hover:shadow-lg hover:shadow-green-500/10">
          <h3 className="mb-3 text-2xl font-semibold text-green-600 dark:text-green-400">API Routes</h3>
          <p className="m-0 max-w-[30ch] text-sm text-gray-600 dark:text-gray-300">
            API routes are proxied to the Express backend server running on port 3001.
          </p>
        </div>

        <div className="group rounded-lg border border-gray-200 dark:border-gray-800 px-5 py-4 transition-all hover:border-purple-300 hover:shadow-lg hover:shadow-purple-500/10">
          <h3 className="mb-3 text-2xl font-semibold text-purple-600 dark:text-purple-400">Database</h3>
          <p className="m-0 max-w-[30ch] text-sm text-gray-600 dark:text-gray-300">
            Connected to MySQL database with Drizzle ORM and connection pooling.
          </p>
        </div>

        <div className="group rounded-lg border border-gray-200 dark:border-gray-800 px-5 py-4 transition-all hover:border-orange-300 hover:shadow-lg hover:shadow-orange-500/10">
          <h3 className="mb-3 text-2xl font-semibold text-orange-600 dark:text-orange-400">Deploy</h3>
          <p className="m-0 max-w-[30ch] text-sm text-gray-600 dark:text-gray-300">
            Instant deployments with Coolify and Nixpacks. Zero-config deployment experience.
          </p>
        </div>
      </div>

      <footer className="w-full text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800 pt-8">
        <p>Built with ❤️ using Next.js 15 and deployed on Coolify</p>
      </footer>
    </main>
  )
}