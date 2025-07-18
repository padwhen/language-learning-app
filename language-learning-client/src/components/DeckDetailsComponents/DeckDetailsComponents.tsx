import { ToolTip } from "@/composables/ToolTip";
import { MoveLeft, MoveRight, Play, Settings, Shuffle } from "lucide-react";
import { Link } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Card } from "@/types";
import ReactCardFlip from "react-card-flip";
import { FrontCard } from "../FlashCardComponents/FrontCard";
import { BackCard } from "../FlashCardComponents/BackCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { useState } from "react";
import { DialogDescription } from "@radix-ui/react-dialog";
import { SettingsDialogContentProps } from "./SettingsDialogContent";
import axios from "axios";
import { useToast } from "../ui/use-toast";

interface DeckNavigationProps {
    currentCardIndex: number;
    cardsLength: number;
    onMoveLeft: () => void;
    onMoveRight: () => void;
}

interface DeckControlsProps {
    onPlay: () => void;
    onShuffle: () => void;
    id: any
}

interface DeckLinksProps {
    id: string;
    cardsLength: number;
}

interface FlashCardProps {
    card: Card;
    isFlipped: boolean;
    onFlip: (event: React.MouseEvent) => void;
    hint: string;
    onGenerateHint: () => void;
    onToggleFavorite: () => void;
}

export const DeckNavigation: React.FC<DeckNavigationProps> = ({
    currentCardIndex, cardsLength, onMoveLeft, onMoveRight
}) => {
    const moveLeftRightStyle = "border rounded-full hover:bg-gray-200 transition duration-300"

    return (
        <div className="flex items-center justify-center gap-5 mb-4 w-full">
            <div data-testid="move-left"
                className={`${moveLeftRightStyle} transform hover:-translate-x-1 ${currentCardIndex === 0 || cardsLength <= 1 ? 'opacity-50 pointer-events-none cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={currentCardIndex !== 0 && cardsLength > 1 ? onMoveLeft : undefined}
            >
                <MoveLeft className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-[45px] lg:h-[45px]" />
            </div>
            <div data-testid="current-card-number" className="text-2xl sm:text-3xl">
                {currentCardIndex + 1} / {cardsLength}
            </div>
            <div data-testid="move-right"
                className={`${moveLeftRightStyle} transform hover:translate-x-1 ${currentCardIndex === cardsLength - 1 || cardsLength <= 1 ? 'opacity-50 pointer-events-none cursor-not-allowed' : 'cursor-pointer'}`}
                onClick={currentCardIndex !== cardsLength - 1 && cardsLength > 1 ? onMoveRight : undefined}
            >
                <MoveRight className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-[45px] lg:h-[45px]" />
            </div>
        </div>
    )
}

export const DeckControls: React.FC<DeckControlsProps> = ({
    onPlay, onShuffle, id
}) => {

    const [isHandwritingRecognitionEnabled, setIsHandwritingRecognitionEnabled] = useState(false)
    const { toast } = useToast()

    const handleResetProgress = async () => {
        try {
            await axios.put(`/decks/${id}/reset-progress`)
            toast({
                title: 'Success',
                description: 'Deck progress has been reset successfully.',
                variant: 'default'
            })
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to reset deck progress. Please try again.',
                variant: 'destructive'
            })
        }
    }

    const handleToggleHandwritingRecognition = (enabled: boolean) => {
        setIsHandwritingRecognitionEnabled(enabled)
    }

    return (
        <div className="pt-6 flex flex-wrap justify-between w-full">
            <div className="flex gap-6 items-center justify-center mb-6 w-full sm:w-auto">
                <ToolTip trigger={<Play />} content="Play" onClick={onPlay} />
                <ToolTip trigger={<Shuffle />} content="Shuffle" onClick={onShuffle} />
            </div>
            <div className="flex items-center justify-center w-full sm:w-auto">
                <Dialog>
                    <DialogTrigger>
                        <ToolTip trigger={<Settings />} content="Settings" />
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Settings</DialogTitle>
                            <DialogDescription>
                                Manage your deck settings and preferences
                            </DialogDescription>
                        </DialogHeader>
                        <SettingsDialogContentProps 
                            onResetProgress={handleResetProgress}
                            onToggleHandwritingRecognition={handleToggleHandwritingRecognition}
                            isHandwritingRecognitionEnabled={isHandwritingRecognitionEnabled}
                        />
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}

export const DeckLinks: React.FC<DeckLinksProps> = ({ id, cardsLength }) => {
    const aStyle = "text-xs sm:text-sm md:text-base lg:text-lg inline-block px-2 sm:px-3 md:px-4 lg:px-6 py-3 rounded-sm border border-gray-300 bg-gray-100 hover:bg-gray-200 hover:border-b-2 hover:border-blue-500 transition-colors duration-300 flex-1 min-w-0 text-center"
    return (
        <div className="flex gap-2 sm:gap-3 md:gap-4 mb-6">
            <Link to={`/flashcards/${id}`} className={aStyle}>Flashcards</Link>
            <Link to={`/learn-decks/${id}`} data-testid="learn-link" className={aStyle}>
                {cardsLength >= 4 ? (
                    <span>Learn</span>
                ): (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger><span data-testid="cannot-learn-link" className="opacity-50 cursor-not-allowed">Learn</span></TooltipTrigger>
                            <TooltipContent>Since "Learn" will create quizzes with options based on your flashcards, you need to have more than 4 flashcards</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </Link>
            <Link to={`/matchgame/${id}`} className={aStyle}>Match</Link>
            <Link to={`/testpage/${id}`} className={aStyle}>Test</Link>
        </div>
    )
}

export const FlashCard: React.FC<FlashCardProps> = ({
    card, isFlipped, onFlip, hint, onGenerateHint, onToggleFavorite
}) => (
    <div className="w-full max-w-[875px] mx-auto border mt-8" data-testid="card-flip-container">
        <ReactCardFlip isFlipped={isFlipped} flipDirection="vertical">
            <div key="front" onClick={onFlip}>
                <FrontCard 
                    word={card.userLangCard} 
                    hint={hint} 
                    onGenerateHint={onGenerateHint}
                    favorite={card.favorite || false}
                    onToggleFavorite={onToggleFavorite}
                />
            </div>
            <div key="back" onClick={onFlip}>
                <BackCard word={card.engCard} />
            </div>
        </ReactCardFlip>
    </div>
)