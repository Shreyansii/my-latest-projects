import Link from 'next/link';
import { Button } from '@/src/components/ui/button';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col justify-center items-center px-6 py-16">
      <section className="max-w-4xl w-full mx-auto text-center">
        <h1 className="text-6xl font-extrabold text-gray-900 mb-8 tracking-tight drop-shadow-sm">
          Bill Splitter
        </h1>
        <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto mb-12 leading-relaxed">
          Split bills and expenses with friends effortlessly. Track who owes what and settle up in just a few clicks.
        </p>

        <nav className="flex flex-wrap justify-center gap-6 mb-20">
        
          <Link href="/login" passHref>
            <Button size="lg" className="px-10 py-4 shadow-lg hover:shadow-xl transition-shadow">
              Sign In
            </Button>
          </Link>
          <Link href="/register" passHref>
            <Button
              variant="outline"
              size="lg"
              className="px-10 py-4 border-indigo-600 text-indigo-600 hover:bg-indigo-50 transition-colors"
            >
              Sign Up
            </Button>
          </Link>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center max-w-4xl mx-auto">
          {[
            {
              emoji: '💰',
              title: 'Split Expenses',
              description: 'Easily divide bills among friends and family',
            },
            {
              emoji: '📱',
              title: 'Track Balances',
              description: 'Keep track of who owes what in real-time',
            },
            {
              emoji: '✅',
              title: 'Settle Up',
              description: 'Mark expenses as paid and settle balances',
            },
          ].map(({ emoji, title, description }) => (
            <article
              key={title}
              className="p-8 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="text-5xl mb-6">{emoji}</div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{title}</h3>
              <p className="text-gray-600 leading-relaxed">{description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
