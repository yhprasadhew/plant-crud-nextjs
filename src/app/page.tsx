import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 via-white to-white">

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-12 items-center">

        {/* Text */}
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            Manage Your <span className="text-green-600">Plant Collection</span> Effortlessly 🌱
          </h1>

          <p className="mt-5 text-gray-600 text-lg leading-relaxed">
            Track, organize, and manage all your plants in one modern system.
            Built for gardeners, nurseries, and plant lovers who want clarity and control.
          </p>

          <div className="mt-7 flex gap-4">
            <a
              href="/dashboard"
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition shadow-sm"
            >
              Get Started
            </a>

            <a
              href="/plants"
              className="border border-green-600 text-green-600 px-6 py-3 rounded-lg hover:bg-green-50 transition"
            >
              View Plants
            </a>
          </div>
        </div>

        {/* Image */}
        <div className="flex justify-center">
          <Image
            src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b"
            alt="Plants"
            width={520}
            height={520}
            className="rounded-2xl shadow-xl object-cover"
          />
        </div>

      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-24 grid md:grid-cols-3 gap-6">

        <div className="p-6 bg-white rounded-xl border hover:shadow-md transition">
          <h3 className="font-semibold text-green-700 text-lg">🌱 Easy Tracking</h3>
          <p className="text-gray-600 text-sm mt-2">
            Keep all plant details organized in one clean dashboard.
          </p>
        </div>

        <div className="p-6 bg-white rounded-xl border hover:shadow-md transition">
          <h3 className="font-semibold text-green-700 text-lg">📦 Inventory Control</h3>
          <p className="text-gray-600 text-sm mt-2">
            Manage stock levels, categories, and plant growth stages.
          </p>
        </div>

        <div className="p-6 bg-white rounded-xl border hover:shadow-md transition">
          <h3 className="font-semibold text-green-700 text-lg">📊 Analytics</h3>
          <p className="text-gray-600 text-sm mt-2">
            Get insights about your plant collection and trends.
          </p>
        </div>

      </section>

      {/* Footer */}
      <footer className="text-center py-10 text-gray-500 text-sm border-t">
        © {new Date().getFullYear()} Plant Inventory System. Built with Next.js 🌿
      </footer>

    </main>
  );
}