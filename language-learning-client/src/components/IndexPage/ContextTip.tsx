import React, { useState } from 'react';
import { dismissContextTip } from '@/utils/cookie';

interface ContextTipProps {
  surfaceForm: string;
  en: string;
  en_base: string
  lemma: string;
  defaultSaveAs: 'original' | 'base';
  onChange: (saveAs: 'original' | 'base') => void;
}

export const ContextTip: React.FC<ContextTipProps> = ({
  surfaceForm,
  lemma,
  defaultSaveAs,
  onChange,
  en,
  en_base
}) => {
  const [saveAs, setSaveAs] = useState<'original' | 'base'>(defaultSaveAs);
  const [isVisible, setIsVisible] = useState(true);

  const handleRadioChange = (value: 'original' | 'base') => {
    setSaveAs(value);
    onChange(value);
  };

  const handleDismiss = (checked: boolean) => {
    if (checked) {
      dismissContextTip();
      setIsVisible(false);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      role="note" 
      aria-labelledby="context-tip-title"
      className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4"
    > 
      <p className="text-sm text-blue-800 mb-2">
        💡 Tip: You can choose to save the word in its base form<br/>
        For example, here it would save "<strong>{lemma}</strong>" ({en_base})
        instead of "<strong>{surfaceForm}</strong>" ({en}).
      </p>

      <div className="space-y-1.5 mb-2">
        <label className="flex items-start sm:items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            name="saveAs"
            value="base"
            checked={saveAs === 'base'}
            onChange={() => handleRadioChange('base')}
            className="text-blue-600 focus:ring-blue-500 mt-0.5 sm:mt-0"
          />
          <span className="text-sm text-gray-700 break-words">
            Base form: <strong>{lemma}</strong>
          </span>
        </label>
        
        <label className="flex items-start sm:items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            name="saveAs"
            value="original"
            checked={saveAs === 'original'}
            onChange={() => handleRadioChange('original')}
            className="text-blue-600 focus:ring-blue-500 mt-0.5 sm:mt-0"
          />
          <span className="text-sm text-gray-700 break-words">
            This form: <strong>{surfaceForm}</strong>
          </span>
        </label>
      </div>

      <label className="flex items-center space-x-2 cursor-pointer">
        <input
          type="checkbox"
          onChange={(e) => handleDismiss(e.target.checked)}
          className="text-blue-600 focus:ring-blue-500"
        />
        <span className="text-xs text-gray-600">
          Don't show this again
        </span>
      </label>
    </div>
  );
}; 