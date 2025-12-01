import React from 'react';
import { Card } from '@/types';

interface ExtendedCard extends Card {
  chosen?: boolean;
  aiEngCard?: string;
  explanation?: {
    text: string;
    link: string;
  };
  dictionarySuggestion?: string;
}

interface SuggestionItemProps {
  type: string;
  item: ExtendedCard;
  index: number;
  selectedSuggestion: string;
  handleSuggestionClick: (type: string, index: number) => void;
}

const SuggestionItem: React.FC<SuggestionItemProps> = ({ type, item, index, selectedSuggestion, handleSuggestionClick }) => {
  const isSelected = selectedSuggestion === (type === 'original' ? 'original' : `${index}-${type}`);
  const ringClass = isSelected ? 'ring-2 ring-blue-500 transition-all duration-300' : '';

  return (
    <div className={`border rounded-md p-2 cursor-pointer ${ringClass}`} onClick={() => handleSuggestionClick(type, index)}>
      <h3 className='font-bold'>
        {type === 'original' && 'Original: '}
        {type === 'ai' && 'AI Suggestion: '}
        {type === 'dictionary' && 'Dictionary Suggestion: '}
      </h3>
      {type === 'original' && `${item.userLangCard} -> ${item.engCard}`}
      {type === 'ai' && (
        <>
          {item.userLangCard} -&gt; {item.aiEngCard}
          {item.explanation && (
            <p className="text-sm text-gray-600 mt-2">
              {item.explanation.text}
              {item.explanation.link && (
                <a href={item.explanation.link} target="_blank" rel="noopener noreferrer" className='underline'> (source)</a>
              )}
            </p>
          )}
        </>
      )}
      {type === 'dictionary' && (
        <>
          {item.userLangCard} -&gt; {item.dictionarySuggestion}
          <a href={`https://www.sanakirja.fi/finnish-english/${item.userLangCard}`} target="_blank" rel="noopener noreferrer" className='underline text-sm text-gray-500'> (source)</a>
        </>
      )}
    </div>
  );
};

export default SuggestionItem;
