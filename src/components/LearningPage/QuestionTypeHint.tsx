import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, X } from "lucide-react";

const STORAGE_KEY = 'seenQuestionTypes';

const hintMessages: Record<string, string> = {
    'multiple-choice': 'Pick the correct English translation from the options.',
    'reverse-mc': 'Now it\'s reversed! See the English word and pick the correct translation.',
    'word-scramble': 'The letters are jumbled up. Unscramble them to form the original word.',
    'type-answer': 'No more options! Type the English translation from memory.',
    'reverse-type': 'Type the word in the target language. This tests your production skills.',
    'listening': 'Listen carefully and type the word you hear. Click the speaker to replay.',
};

function getSeenTypes(): Set<string> {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
        return new Set();
    }
}

function markTypeSeen(type: string) {
    const seen = getSeenTypes();
    seen.add(type);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...seen]));
}

interface QuestionTypeHintProps {
    questionType: string;
}

export const QuestionTypeHint: React.FC<QuestionTypeHintProps> = ({ questionType }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const seen = getSeenTypes();
        if (!seen.has(questionType) && hintMessages[questionType]) {
            setVisible(true);
            markTypeSeen(questionType);
        }
    }, [questionType]);

    const dismiss = () => setVisible(false);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mb-4"
                >
                    <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <Lightbulb className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">New question type</span>
                            <p className="text-sm text-amber-800 mt-0.5">{hintMessages[questionType]}</p>
                        </div>
                        <button onClick={dismiss} className="text-amber-400 hover:text-amber-600 flex-shrink-0">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
