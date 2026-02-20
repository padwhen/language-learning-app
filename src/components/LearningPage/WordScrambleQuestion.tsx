import { useState, useEffect, useRef } from "react";
import { Label } from "../ui/label";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Shuffle } from "lucide-react";
import { QuestionTypeHint } from "./QuestionTypeHint";

interface WordScrambleQuestionProps {
    data: {
        userLangCard: string; // scrambled word
        correctAnswer: string; // original word
        cardId: string;
        cardScore: number;
    };
    save: (answerIndex: number, correct: boolean, cardId: string, cardScore: number, userAnswerText?: string, isPartial?: boolean) => void;
    isReviewMode: boolean;
}

export const WordScrambleQuestion: React.FC<WordScrambleQuestionProps> = (props) => {
    const [userInput, setUserInput] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const checkAnswer = (input: string): boolean => {
        const normalized = input.trim().toLowerCase();
        const correct = props.data.correctAnswer.trim().toLowerCase();
        return normalized === correct;
    };

    const submitAnswer = () => {
        if (submitted || !userInput.trim()) return;
        setSubmitted(true);
        const correct = checkAnswer(userInput);
        setIsCorrect(correct);

        setTimeout(() => {
            props.save(
                correct ? 0 : -1,
                correct,
                props.data.cardId,
                props.data.cardScore,
                userInput.trim()
            );
        }, 1500);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            submitAnswer();
        }
    };

    // Display scrambled letters with spacing
    const scrambledDisplay = props.data.userLangCard.split('').join(' ');

    return (
        <div className="flex flex-col space-y-6 w-full max-w-4xl mx-auto" data-testid="word-scramble-box">
            <QuestionTypeHint questionType="word-scramble" />
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center"
            >
                <div className="flex items-center justify-center gap-2 mb-4">
                    <Shuffle className="h-6 w-6 text-purple-500" />
                    <Label className="text-xl sm:text-2xl font-semibold text-purple-700">Unscramble this word</Label>
                </div>
                <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-6 sm:p-8 inline-block">
                    <span className="text-3xl sm:text-4xl md:text-5xl font-mono font-bold tracking-[0.3em] text-purple-900">
                        {scrambledDisplay}
                    </span>
                </div>
            </motion.div>

            <motion.div
                className="w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
            >
                <div className="max-w-2xl mx-auto space-y-4">
                    <motion.div
                        animate={submitted && !isCorrect ? { x: [-10, 10, -10, 10, -5, 5, 0] } : {}}
                        transition={{ duration: 0.6 }}
                    >
                        <Input
                            ref={inputRef}
                            type="text"
                            value={userInput}
                            onChange={(e) => !submitted && setUserInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={submitted}
                            placeholder="Type the unscrambled word..."
                            className={`text-lg py-6 px-6 ${
                                submitted
                                    ? isCorrect
                                        ? "border-green-500 bg-green-50 text-green-800"
                                        : "border-red-500 bg-red-50 text-red-800"
                                    : ""
                            }`}
                        />
                    </motion.div>

                    {!submitted && (
                        <Button
                            onClick={submitAnswer}
                            disabled={!userInput.trim()}
                            className="w-full py-6 text-lg flex items-center justify-center gap-2"
                        >
                            <Send className="h-5 w-5" />
                            Submit Answer
                        </Button>
                    )}

                    <AnimatePresence>
                        {submitted && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                                className={`flex items-center gap-3 p-4 rounded-lg ${
                                    isCorrect
                                        ? "bg-green-100 border border-green-300"
                                        : "bg-red-100 border border-red-300"
                                }`}
                            >
                                {isCorrect ? (
                                    <>
                                        <FaCheckCircle size={24} className="text-green-600" />
                                        <span className="text-green-800 font-medium text-lg">Correct!</span>
                                    </>
                                ) : (
                                    <>
                                        <FaTimesCircle size={24} className="text-red-600" />
                                        <div>
                                            <span className="text-red-800 font-medium text-lg">Incorrect</span>
                                            <p className="text-red-700 text-sm mt-1">
                                                Correct answer: <span className="font-semibold">{props.data.correctAnswer}</span>
                                            </p>
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            <AnimatePresence>
                {!submitted && (
                    <motion.div
                        initial={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Button
                            variant="link"
                            className="w-full text-lg hover:scale-105 transition-transform"
                            onClick={() => {
                                setUserInput("");
                                setSubmitted(true);
                                setIsCorrect(false);
                                setTimeout(() => {
                                    props.save(-1, false, props.data.cardId, props.data.cardScore, "");
                                }, 1500);
                            }}
                        >
                            Don't know?
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {submitted && (
                    <motion.div
                        className="mt-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <motion.div className="text-center text-xl">
                            <motion.span
                                animate={{ opacity: [0.7, 1, 0.7] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                            >
                                Moving to next question...
                            </motion.span>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
