import { GameCard as GameCardType } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

interface GameCardProps {
    card: GameCardType;
    isMatched: boolean;
    isSelected: boolean;
    isIncorrect: boolean;
    onClick: () => void;
}

const shakeAnimation = {
    x: [0, -5, 5, -5, 5, 0],
    transition: { duration: 0.3 }
}

export const GameCard: React.FC<GameCardProps> = ({ 
    card, isMatched, isSelected, isIncorrect, onClick
}) => (
    <AnimatePresence>
        <motion.div
            data-testid={`game-card-${card._id}-${card.type}`}
            animate={isIncorrect ? shakeAnimation : {}}
            className={`cursor-pointer w-full aspect-[4/3] rounded-md sm:rounded-lg shadow-sm sm:shadow-md flex items-center justify-center p-1 sm:p-3 lg:p-4 xl:p-6 text-center transition-all duration-200 hover:shadow-lg
              ${isSelected ? 'bg-blue-100 border-2 border-blue-300' : 'bg-white border border-gray-200'}  
              ${isIncorrect ? 'bg-red-100 border-red-300' : ''}
              ${isMatched ? 'opacity-0 pointer-events-none' : 'opacity-100'}
            `}
            onClick={onClick}
        >
            <span className="text-xs sm:text-base lg:text-lg xl:text-xl font-medium leading-tight break-words px-1">
                {card.type === 'eng' ? card.engCard : card.userLangCard}
            </span>
        </motion.div>
    </AnimatePresence>
)