import React from 'react';

interface MorphologyRendererProps {
  morphology: string[] | string;
}

export const MorphologyRenderer: React.FC<MorphologyRendererProps> = ({ morphology }) => {
  if (!morphology) return null;
  
  // Handle both string and array formats for backward compatibility
  const morphologyArray = Array.isArray(morphology) ? morphology : [morphology];
  
  if (morphologyArray.length === 0) return null;
  
  return (
    <div className="space-y-2">
      {morphologyArray.map((step, i) => (
        <div key={i} className="flex flex-wrap items-center gap-2">
          {morphologyArray.length > 1 && (
            <span className="text-xs text-gray-500 font-medium min-w-fit">
              Step {i + 1}:
            </span>
          )}
          <div className="flex items-center gap-1 flex-wrap">
            {step.split('→').map((part, j) => {
              const trimmedPart = part.trim();
              const subParts = trimmedPart.includes('+') ? trimmedPart.split('+').map(p => p.trim()) : [trimmedPart];
              
              return (
                <div key={j} className="flex items-center gap-1">
                  {subParts.map((subPart, k) => (
                    <span 
                      key={k} 
                      className="px-2 py-1 rounded-2xl shadow-sm border text-sm bg-gray-50 text-gray-700"
                    >
                      {subPart}
                    </span>
                  ))}
                  {j < step.split('→').length - 1 && (
                    <span className="px-1 text-gray-500">→</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
