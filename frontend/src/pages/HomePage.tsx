import { Link } from 'react-router-dom';
import { BookOpen, Search, Clock, Bell } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Hero */}
      <section className="bg-[#1B4332] text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#52B788]/20 rounded-full mb-6">
            <BookOpen size={40} className="text-[#52B788]" />
          </div>
          <h1 className="text-5xl font-serif font-bold mb-4 leading-tight">
            Your Digital Library,<br />Reimagined
          </h1>
          <p className="text-[#95D5B2] text-lg mb-8 max-w-xl mx-auto">
            Discover, borrow, and manage books with ease. A modern library experience for the digital age.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/catalog"
              className="bg-[#52B788] hover:bg-[#74C69D] text-[#1B4332] font-semibold px-8 py-3 rounded-xl transition-colors"
            >
              Browse Catalog
            </Link>
            <Link
              to="/register"
              className="border border-[#52B788] text-[#52B788] hover:bg-[#52B788]/10 px-8 py-3 rounded-xl font-medium transition-colors"
            >
              Join for Free
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-serif font-bold text-center text-[#1B4332] mb-12">Everything you need</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Search,
                title: 'Smart Search',
                desc: 'Find books by title, author, ISBN, or category with instant results.',
              },
              {
                icon: Clock,
                title: 'Track Loans',
                desc: 'Monitor due dates, view your history, and never miss a return.',
              },
              {
                icon: Bell,
                title: 'Smart Reservations',
                desc: 'Join the waitlist and get notified automatically when a book is returned.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-[#D8F3DC] rounded-xl mb-4">
                  <Icon size={24} className="text-[#2D6A4F]" />
                </div>
                <h3 className="text-lg font-serif font-semibold text-[#1B4332] mb-2">{title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-4 bg-[#D8F3DC]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-serif font-bold text-[#1B4332] mb-3">Ready to start reading?</h2>
          <p className="text-[#2D6A4F] mb-6 text-sm">Browse thousands of titles across every genre.</p>
          <Link
            to="/catalog"
            className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white px-8 py-3 rounded-xl font-medium transition-colors inline-block"
          >
            Explore the Catalog
          </Link>
        </div>
      </section>
    </div>
  );
}
