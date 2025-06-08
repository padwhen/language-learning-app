import { useState, useEffect } from "react";
import { Label } from "../ui/label";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa"
import { Button } from "../ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface QuestionProps {
    data: {
        userLangCard: string;
        options: string[];
        correctAnswer: string;
        correctIndex: number;
        cardId: string;
        cardScore: number;
    };
    save: (answerIndex: number, correct: boolean, cardId: string, cardScore: number) => void;
    isReviewMode: boolean;
    currentQuestionIndex?: number;
    totalQuestions?: number;
}

// Sparkle component for correct answers
const Sparkle = ({ delay = 0 }: { delay?: number }) => (
    <motion.div
        className="absolute w-2 h-2 bg-yellow-400 rounded-full"
        initial={{ scale: 0, opacity: 0 }}
        animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
            x: [0, Math.random() * 40 - 20],
            y: [0, Math.random() * 40 - 20],
        }}
        transition={{ 
            duration: 1.5,
            delay,
            ease: "easeOut"
        }}
    />
);

// Fire particle component for correct answers
const FireParticle = ({ delay = 0 }: { delay?: number }) => (
    <motion.div
        className="absolute w-1 h-3 bg-gradient-to-t from-red-500 via-orange-400 to-yellow-300 rounded-full"
        initial={{ scale: 0, opacity: 0, y: 0 }}
        animate={{
            scale: [0, 1, 0.5, 0],
            opacity: [0, 1, 0.8, 0],
            y: [0, -30, -60, -80],
            x: [0, Math.random() * 20 - 10],
        }}
        transition={{ 
            duration: 2,
            delay,
            ease: "easeOut"
        }}
    />
);

// Shake animation for wrong answers
const shakeVariants = {
    shake: {
        x: [-10, 10, -10, 10, -5, 5, 0],
        transition: {
            duration: 0.6,
            ease: "easeInOut"
        }
    }
};

// Glow effect for correct answers
const glowVariants = {
    glow: {
        scale: [1, 1.05, 1],
        transition: {
            duration: 1.5,
            ease: "easeInOut"
        }
    }
};

export const Question: React.FC<QuestionProps> = (props) => {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
    const [submitted, setSubmitted] = useState(false)
    const [showEffects, setShowEffects] = useState(false)
    
    // Check if this is a resume mode and if current question was already answered
    const isCurrentQuestionAnswered = props.currentQuestionIndex && props.currentQuestionIndex <= (props.totalQuestions || 0)

    useEffect(() => {
        const handleKeyPress = (event: KeyboardEvent) => {
            if (!submitted && ['1', '2', '3', '4'].includes(event.key)) {
                const index = parseInt(event.key) - 1;
                if (index < props.data.options.length) {
                    setSelectedIndex(index);
                    submitAnswer(index);
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);

        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, [submitted, props.data.options]);

    const submitAnswer = (index: number) => {
        setSelectedIndex(index);
        setSubmitted(true);
        setShowEffects(true);
        
        setTimeout(() => {
            const isCorrect = index === props.data.correctIndex
            props.save(index, isCorrect, props.data.cardId, props.data.cardScore);
        }, 1000); 
    }

    const checkAnswer = (index: number) => {
        if (index === selectedIndex && index === props.data.correctIndex) {
            return true;
        }
        if (index === selectedIndex && index !== props.data.correctIndex) {
            return false;
        }
        if (index !== selectedIndex && index === props.data.correctIndex) {
            return true;
        }
        return undefined
    }

    const getButtonVariant = (index: number) => {
        if (!submitted) {
            return selectedIndex === index ? "default" : "outline";
        }
        
        const result = checkAnswer(index);
        if (result === true) return "default";
        if (result === false) return "destructive";
        return "outline";
    };

    const getButtonClassName = (index: number) => {
        let baseClass = "justify-between text-lg sm:text-xl py-6 px-6 overflow-hidden transition-all duration-300 w-full h-20 min-w-0";
        
        if (!submitted) return baseClass;
        
        const result = checkAnswer(index);
        if (result === true) {
            baseClass += " bg-green-500 hover:bg-green-600 text-white border-green-400";
        } else if (result === false) {
            baseClass += " bg-red-500 hover:bg-red-600 text-white border-red-400";
        }
        
        return baseClass;
    };

    return (
        <div className="flex flex-col space-y-6 w-full max-w-4xl mx-auto" data-testid="question-box">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Label className="text-3xl sm:text-4xl md:text-5xl font-bold block text-center mb-6">
                    {props.data.userLangCard}
                </Label>
            </motion.div>
            
            <motion.div 
                className="w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
            >
                <Label className="text-xl sm:text-2xl mb-4 block">Choose matching term</Label>
                <div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto">
                    {props.data.options.map((option: string, index: number) => {
                        const result = checkAnswer(index);
                        const isCorrect = result === true;
                        const isIncorrect = result === false;
                        
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                transition={{ 
                                    delay: index * 0.1,
                                    duration: 0.3,
                                    type: "spring",
                                    stiffness: 200
                                }}
                                variants={isIncorrect ? shakeVariants : isCorrect ? glowVariants : {}}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    ...(submitted &&
                                        (isIncorrect
                                        ? { x: [0, -10, 10, -10, 10, 0] } // simulate shake
                                        : isCorrect
                                        ? {}
                                        : {})),
                                    }}
                                className="w-full"
                            >
                                <Button 
                                    variant={getButtonVariant(index) as any}
                                    className={getButtonClassName(index)}
                                    onClick={() => !submitted && submitAnswer(index)}
                                    disabled={submitted}
                                    data-testid="answer-test"
                                >
                                    <span className="flex-1 text-left truncate">{index + 1}. {option}</span>
                                    
                                    <AnimatePresence>
                                        {submitted && isCorrect && (
                                            <motion.div
                                                initial={{ scale: 0, rotate: -180 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                exit={{ scale: 0, rotate: 180 }}
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 500,
                                                    damping: 25,
                                                    delay: 0.2
                                                }}
                                                className="flex-shrink-0 ml-2"
                                            >
                                                <FaCheckCircle size={24} color="#ffffff" />
                                            </motion.div>
                                        )}
                                        {submitted && isIncorrect && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: [0, 1.3, 1] }}
                                                exit={{ scale: 0 }}
                                                transition={{
                                                    duration: 0.4,
                                                    delay: 0.1
                                                }}
                                                className="flex-shrink-0 ml-2"
                                            >
                                                <FaTimesCircle size={24} color="#ffffff" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    
                                    {/* Sparkle effects for correct answers */}
                                    <AnimatePresence>
                                        {submitted && isCorrect && showEffects && (
                                            <>
                                                {[...Array(8)].map((_, i) => (
                                                    <Sparkle key={`sparkle-${i}`} delay={i * 0.1} />
                                                ))}
                                            </>
                                        )}
                                    </AnimatePresence>
                                    
                                    {/* Fire effect border for correct answers */}
                                    <AnimatePresence>
                                        {submitted && isCorrect && showEffects && (
                                            <motion.div
                                                className="absolute inset-0 pointer-events-none"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                            >
                                                {[...Array(12)].map((_, i) => (
                                                    <div
                                                        key={`fire-${i}`}
                                                        className="absolute"
                                                        style={{
                                                            left: `${(i / 12) * 100}%`,
                                                            top: i % 2 === 0 ? '0%' : '100%',
                                                            transform: i % 2 === 0 ? 'translateY(-50%)' : 'translateY(50%)'
                                                        }}
                                                    >
                                                        <FireParticle delay={i * 0.05} />
                                                    </div>
                                                ))}
                                                {[...Array(12)].map((_, i) => (
                                                    <div
                                                        key={`fire-side-${i}`}
                                                        className="absolute"
                                                        style={{
                                                            top: `${(i / 12) * 100}%`,
                                                            left: i % 2 === 0 ? '0%' : '100%',
                                                            transform: i % 2 === 0 ? 'translateX(-50%)' : 'translateX(50%)'
                                                        }}
                                                    >
                                                        <FireParticle delay={i * 0.05 + 0.3} />
                                                    </div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    
                                    {/* Pulsing glow effect for correct answers */}
                                    {submitted && isCorrect && (
                                        <motion.div
                                            animate={{
                                                opacity: [0.2, 0.4, 0.2],
                                                scale: [1, 1.02, 1]
                                            }}
                                            transition={{
                                                duration: 1.5,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                        />
                                    )}
                                </Button>
                            </motion.div>
                        );
                    })}
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
                            onClick={() => submitAnswer(-1)}
                        >
                            Don't know?
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
            
            <AnimatePresence>
                {submitted && (
                    <motion.div 
                        className="mt-4 text-center text-xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                    >
                        <motion.span
                            animate={{ 
                                opacity: [0.7, 1, 0.7],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            Moving to next question...
                        </motion.span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}