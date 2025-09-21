import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { hasGrammaticalContext } from '@/utils/grammarUtils';

interface LearningModeToggleProps {
  learningMode: boolean;
  onToggle: (enabled: boolean) => void;
  words?: any[];
}

export const LearningModeToggle: React.FC<LearningModeToggleProps> = ({
  learningMode,
  onToggle,
  words = []
}) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Count words with meaningful grammar context using the improved detection logic
  const wordsWithGrammar = words.filter(word => hasGrammaticalContext(word.pattern)).length;

  const handleToggle = (enabled: boolean) => {
    // If turning off learning mode and there are words with grammar context, show confirmation
    if (!enabled && learningMode && wordsWithGrammar > 0) {
      setShowConfirmDialog(true);
    } else {
      onToggle(enabled);
    }
  };

  const handleConfirmTurnOff = () => {
    setShowConfirmDialog(false);
    onToggle(false);
  };

  const handleCancelTurnOff = () => {
    setShowConfirmDialog(false);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Learning Mode</span>
        <Switch
          checked={learningMode}
          onCheckedChange={handleToggle}
          aria-label="Toggle Learning Mode"
        />
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <DialogTitle className="text-lg font-semibold">
                Turn off Learning Mode?
              </DialogTitle>
            </div>
            <DialogDescription className="text-gray-600 leading-relaxed">
              You will lose the grammatical context of <strong>{wordsWithGrammar} word{wordsWithGrammar !== 1 ? 's' : ''}</strong> with detailed grammar insights. 
              {wordsWithGrammar > 0 && (
                <span className="block mt-2 text-sm">
                  This includes morphology patterns, usage examples, and linguistic explanations.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={handleCancelTurnOff}
              className="flex-1"
            >
              Keep Learning Mode
            </Button>
            <Button
              onClick={handleConfirmTurnOff}
              className="flex-1 bg-amber-600 hover:bg-amber-700"
            >
              Turn Off Anyway
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
