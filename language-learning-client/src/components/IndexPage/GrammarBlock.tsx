import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GrammarPattern } from '@/types';
import { MorphologyRenderer } from './MorphologyRenderer';
import { hasGrammaticalContext } from '@/utils/grammarUtils';

interface GrammarBlockProps {
  pattern?: GrammarPattern;
  themes?: string[];
  showDifferenceCallout?: boolean;
}

export const GrammarBlock: React.FC<GrammarBlockProps> = ({ 
  pattern, 
  themes,
  showDifferenceCallout = false 
}) => {
  const navigate = useNavigate();

  const handleTagClick = (tag: string) => {
    navigate(`/grammar?tags=${encodeURIComponent(tag)}`);
  };

  // Check if this is a themes-only case (no other pattern data)
  const hasThemes = themes && themes.length > 0;
  const hasPatternData = hasGrammaticalContext(pattern);
  const isThemesOnly = !hasPatternData && hasThemes;

  return (
    <div className="space-y-4">
      {/* Pattern name and explanation */}
      {pattern?.pattern && (
        <div>
          <div className="text-lg font-semibold text-gray-900 mb-2">
            {pattern.pattern}
          </div>
          {pattern.explanation && (
            <div className="text-gray-700 text-sm">{pattern.explanation}</div>
          )}
        </div>
      )}

      {/* Themes-only case */}
      {isThemesOnly && (
        <div>
          <div className="text-lg font-semibold text-gray-900 mb-2">
            Semantic Themes
          </div>
          <div className="text-gray-700 text-sm mb-3">
            This word is associated with the following semantic domains:
          </div>
        </div>
      )}

      {/* Example and translation */}
      {pattern && (pattern.example || pattern.translation) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          {pattern.example && (
            <div className="mb-2">
              <span className="text-sm font-medium text-blue-900">Example: </span>
              <span className="text-blue-800">{pattern.example}</span>
            </div>
          )}
          {pattern.translation && (
            <div>
              <span className="text-sm font-medium text-blue-900">Translation: </span>
              <span className="text-blue-800">{pattern.translation}</span>
            </div>
          )}
        </div>
      )}

      {/* Morphology */}
      {pattern?.morphology && pattern.morphology.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Word Formation</div>
          <MorphologyRenderer morphology={pattern.morphology} />
        </div>
      )}

      {/* Grammar Tags */}
      {pattern?.tags && pattern.tags.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Grammar Tags</div>
          <div className="flex flex-wrap gap-2">
            {pattern.tags.map((tag: string, index: number) => (
              <button
                key={index}
                onClick={() => handleTagClick(tag)}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Semantic Themes */}
      {themes && themes.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">Semantic Themes</div>
          <div className="flex flex-wrap gap-2">
            {themes.map((theme: string, index: number) => (
              <button
                key={index}
                onClick={() => handleTagClick(theme)}
                className="px-3 py-1 bg-violet-100 text-violet-800 rounded-full text-sm hover:bg-violet-200 transition-colors cursor-pointer"
              >
                {theme}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {pattern?.notes && pattern.notes.length > 0 && (
        <div>
          <div className="text-sm font-medium text-gray-900 mb-2">Notes</div>
          <ul className="list-disc list-inside space-y-1">
            {pattern.notes.map((note, index) => (
              <li key={index} className="text-sm text-gray-700">{note}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Difference callout */}
      {showDifferenceCallout && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">!</span>
            </div>
            <div>
              <p className="text-amber-800 font-medium text-sm">This form differs from base</p>
              <p className="text-amber-700 text-xs">
                The word appears in a grammatical form that changes its meaning or usage from the base form.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const GrammarBlockSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 animate-pulse">
      <div>
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
      <div className="bg-gray-50 border rounded-lg p-3">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
      <div>
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 rounded-full w-16"></div>
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
        </div>
      </div>
    </div>
  );
};
