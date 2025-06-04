import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { QuoteIcon } from 'lucide-react';

interface MotivationalQuoteProps {
  className?: string;
  type?: 'job-search' | 'sa-specific' | 'personal-growth';
}

export const MotivationalQuote: React.FC<MotivationalQuoteProps> = ({
  className,
  type = 'job-search'
}) => {
  const [quote, setQuote] = useState<{ text: string; author: string; }>({ 
    text: "", 
    author: "" 
  });

  // Different quote collections
  const jobSearchQuotes = [
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work.", author: "Steve Jobs" },
    { text: "Opportunities don't happen. You create them.", author: "Chris Grosser" },
    { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "The future depends on what you do today.", author: "Mahatma Gandhi" }
  ];
  
  const saSpecificQuotes = [
    { text: "In South Africa, diversity is our strength. Let your CV reflect your unique contribution to this multicultural landscape.", author: "Nelson Mandela" },
    { text: "Your skills are your power, especially in a challenging job market like South Africa's. Keep developing them.", author: "Cyril Ramaphosa" },
    { text: "Ubuntu - I am because we are. Bring this spirit of community to your job search.", author: "Desmond Tutu" },
    { text: "South Africa's greatest asset is its people. You are a valuable part of our nation's future.", author: "Thabo Mbeki" },
    { text: "Perseverance is a great element of success. Keep pushing forward even when times are tough in the South African job market.", author: "Patrice Motsepe" }
  ];
  
  const personalGrowthQuotes = [
    { text: "The greatest glory in living lies not in never falling, but in rising every time we fall.", author: "Nelson Mandela" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
    { text: "Your career is a journey, not a destination. Keep growing and learning every day.", author: "Hire Mzansi Team" },
    { text: "The only limit to our realization of tomorrow will be our doubts of today.", author: "Franklin D. Roosevelt" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" }
  ];
  
  // Get a random quote based on type
  useEffect(() => {
    let quoteCollection;
    
    switch (type) {
      case 'sa-specific':
        quoteCollection = saSpecificQuotes;
        break;
      case 'personal-growth':
        quoteCollection = personalGrowthQuotes;
        break;
      case 'job-search':
      default:
        quoteCollection = jobSearchQuotes;
        break;
    }
    
    const randomIndex = Math.floor(Math.random() * quoteCollection.length);
    setQuote(quoteCollection[randomIndex]);
  }, [type]);
  
  if (!quote.text) return null;
  
  return (
    <Card className={`bg-gradient-to-r from-amber-50 to-white border-amber-200 p-4 ${className}`}>
      <div className="flex space-x-3">
        <QuoteIcon className="h-6 w-6 text-amber-500 flex-shrink-0" />
        <div>
          <p className="italic text-gray-700">{quote.text}</p>
          <p className="text-sm text-right mt-1 text-amber-700">— {quote.author}</p>
        </div>
      </div>
    </Card>
  );
};

export default MotivationalQuote;