import { Link } from 'react-router-dom';
import { ArrowLeft, Construction } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-2xl mx-auto">
        <div className="mb-8">
          <Construction className="h-24 w-24 text-dance-gold mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-dance-black mb-4">
            {title}
          </h1>
          <p className="text-xl text-dance-gray-800 leading-relaxed">
            {description}
          </p>
        </div>
        
        <div className="space-y-4">
          <p className="text-dance-gray-600">
            This page is currently under construction. Continue prompting to help us build this section!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/"
              className="inline-flex items-center space-x-2 bg-dance-gold text-dance-black px-6 py-3 rounded-full font-medium hover:bg-dance-gold/90 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
            
            <button className="inline-flex items-center space-x-2 border-2 border-dance-gold text-dance-gold px-6 py-3 rounded-full font-medium hover:bg-dance-gold hover:text-dance-black transition-colors duration-200">
              <span>Contact Us</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
