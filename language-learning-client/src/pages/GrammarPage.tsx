import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Header } from '../components/Header';

export const GrammarPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tags = searchParams.get('tags');
  const tagList = tags ? tags.split(',') : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Grammar Reference</h1>
          
          {tagList.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                Filtered by tags:
              </h2>
              <div className="flex flex-wrap gap-2">
                {tagList.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-violet-100 text-violet-800 rounded-full text-sm font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg 
                  className="w-4 h-4 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Grammar Page Coming Soon
                </h3>
                <p className="text-blue-800 mb-4">
                  This page will contain detailed grammar explanations, examples, and exercises 
                  for the selected grammar patterns. You'll be able to:
                </p>
                <ul className="list-disc list-inside text-blue-800 space-y-1">
                  <li>Browse grammar patterns by category</li>
                  <li>View detailed explanations and examples</li>
                  <li>Practice with interactive exercises</li>
                  <li>Track your progress on different grammar topics</li>
                  <li>Access cards saved to grammar-specific decks</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              ← Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
