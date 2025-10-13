export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold">BlogStreamPro</h1>
        <p className="text-xl">Modern Blogging Platform</p>
      </div>

      <div className="relative flex place-items-center">
        <h2 className="text-2xl font-semibold">Welcome to Next.js with Coolify</h2>
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100">
          <h3 className="mb-3 text-2xl font-semibold">Next.js</h3>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Built with Next.js 14 and deployed on Coolify using Nixpacks.
          </p>
        </div>

        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100">
          <h3 className="mb-3 text-2xl font-semibold">API Routes</h3>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            API routes are proxied to the Express backend server.
          </p>
        </div>

        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100">
          <h3 className="mb-3 text-2xl font-semibold">Database</h3>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Connected to MySQL database with Drizzle ORM.
          </p>
        </div>

        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100">
          <h3 className="mb-3 text-2xl font-semibold">Deploy</h3>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Instant deployments with Coolify and Nixpacks.
          </p>
        </div>
      </div>
    </main>
  )
}