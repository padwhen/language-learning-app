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
            animate={isIncorrect ? shakeAnimation : {}}
            className={`cursor-pointer w-full aspect-[4/3] rounded-lg shadow-md flex items-center justify-center p-4 text-center
              ${isSelected ? 'bg-blue-100' : 'bg-white'}  
              ${isIncorrect ? 'bg-red-100' : ''}
              ${isMatched ? 'opacity-0' : 'opacity-100'}
            `}
            onClick={onClick}
        >
            <span className="text-lg">
                {card.type === 'eng' ? card.engCard : card.userLangCard}
            </span>
        </motion.div>
    </AnimatePresence>
)