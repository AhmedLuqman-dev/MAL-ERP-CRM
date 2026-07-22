import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { FileQuestion } from 'lucide-react';

export function NotFoundPage() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-full bg-warm-100 flex items-center justify-center">
          <FileQuestion className="w-8 h-8 text-charcoal-400" />
        </div>
        <h1 className="mt-6 text-3xl font-semibold text-charcoal-900">404</h1>
        <p className="mt-2 text-sm text-charcoal-500">The page you are looking for does not exist.</p>
        <Link to="/" className="btn-primary mt-6">
          Back to Dashboard
        </Link>
      </div>
    </Layout>
  );
}
