import React from 'react';
import demoVideo from '../../../assets/match_demo.gif'
import { Button } from '@/components/ui/button';
import { GameCard as GameCardType, GameOptions as GameOptionsType } from '@/types';
import { Shuffle } from 'lucide-react';
import { GameCard } from './GameCard';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useNavigate, useParams } from 'react-router-dom';

export const GameIntro: React.FC<{ 
    onStart: () => void,
    gameOptions: GameOptionsType,
    setGameOptions: (options: GameOptionsType) => void
}> = ({ onStart, gameOptions, setGameOptions }) => (
<div className='flex flex-col items-center justify-center min-h-screen max-w-2xl mx-auto p-4 sm:p-6 lg:p-8'>
        <h2 className='text-xl sm:text-2xl lg:text-3xl font-bold mb-4 lg:mb-6 text-center'>Ready to play?</h2>
        <p className='mb-4 lg:mb-6 text-center text-sm sm:text-base lg:text-lg px-2'>
            Match all the terms with their definitions as fast as you can. 
            Avoid wrong matches, they add extra time!
        </p>
        <img src={demoVideo} alt='Game Preview' className='mb-4 lg:mb-6 w-full max-w-xs sm:max-w-md lg:max-w-lg' />
        
        <div className='mb-6 lg:mb-8 w-full'>
            <h3 className='text-base sm:text-lg lg:text-xl font-semibold mb-3 lg:mb-4 text-center'>Game Options</h3>
            <div className='flex flex-col space-y-3 lg:space-y-4'>
                <div className='flex items-center justify-between p-2 sm:p-0'>
                    <Label htmlFor='show-timer' className='text-sm sm:text-base lg:text-base'>Show Timer</Label>
                    <Switch
                        id='show-timer'
                        checked={gameOptions.showTimer}
                        onCheckedChange={(checked) => setGameOptions({ ...gameOptions, showTimer: checked })}
                    />
                </div>
                <div className='flex items-center justify-between p-2 sm:p-0'>
                    <Label htmlFor='allow-deselect' className='text-sm sm:text-base lg:text-base'>Allow Card Deselection</Label>
                    <Switch
                        id='allow-deselect'
                        checked={gameOptions.allowDeselect}
                        onCheckedChange={(checked) => setGameOptions({ ...gameOptions, allowDeselect: checked })}
                    />
                </div>
                {/* Add more options here as needed */}
            </div>
        </div>
        
        <Button onClick={onStart} className='w-full max-w-xs text-sm sm:text-base lg:text-lg py-3 lg:py-4'>Start Game</Button>
    </div>
)

export const GameHeader: React.FC<{
    shuffleCards: () => void,
    timeElapsed: number,
    showPenalty: boolean,
    gameOptions: GameOptionsType,
}> = ({ shuffleCards, timeElapsed, showPenalty, gameOptions }) => {
    const navigate = useNavigate();
    const { id } = useParams();

    const handleReturnToDeckDetails = () => {
        navigate(`/view-decks/${id}`);
    };

    return (
        <div className='w-full flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 lg:mb-6 gap-3 sm:gap-0'>
            <div className='flex items-center'>
                <Button variant="ghost" className='mr-2 lg:mr-3 p-2' onClick={shuffleCards} data-testid="shuffle-button">
                    <Shuffle className='w-4 h-4 lg:w-5 lg:h-5' />
                </Button>
                <h2 className='text-xl sm:text-2xl lg:text-3xl font-semibold'>Match</h2>
            </div>
            <div className='flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 lg:gap-6'>
                {gameOptions.showTimer && (
                    <span className='text-sm lg:text-base'> 
                        {(timeElapsed / 1000).toFixed(1)}s
                        {showPenalty && (
                            <span className='text-red-500 ml-2'>
                                +5 penalty!
                            </span>
                        )}
                    </span>
                )}
                <Button variant="ghost" onClick={handleReturnToDeckDetails} className='text-xs sm:text-sm lg:text-base px-2 sm:px-4'>
                    Return to Deck Details
                </Button>
            </div>
        </div>
    );
}

export const GameBoard: React.FC<{
    gameCards: GameCardType[],
    selectedCards: string[],
    matchedPairs: string[],
    incorrectPair: string[],
    handleCardClick: (cardId: string) => void
}> = ({ gameCards, selectedCards, matchedPairs, incorrectPair, handleCardClick }) => (
    <div className='grid grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6 w-full'>
        {gameCards.map((card) => (
            <GameCard 
                key={`${card._id}-${card.type}`}
                card={card}
                isMatched={matchedPairs.includes(card._id + '-' + card.type)}
                isSelected={selectedCards.includes(card._id + '-' + card.type)}
                isIncorrect={incorrectPair.includes(card._id + '-' + card.type)}
                onClick={() => handleCardClick(card._id + '-' + card.type)}
            />
        ))}
    </div>
)

export const GameCompletedMessage: React.FC<{   timeElapsed: number}> = ({ timeElapsed }) => (
    <div className='mt-6 lg:mt-8 text-center'>
        <h3 className='text-xl lg:text-2xl font-bold mb-2'>Congratulations!</h3>
        <p className='text-lg lg:text-xl'>Time Taken: {(timeElapsed / 1000).toFixed(1)}s</p>
    </div>
)

export const GameOptions: React.FC<{
    options: GameOptionsType,
    setOptions: (options: GameOptionsType) => void
}> = ({ options, setOptions }) => (
    <div className='mt-4 lg:mt-6 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 lg:space-x-6'>
        <div className='flex items-center space-x-2 lg:space-x-3'>
            <Switch
                id='show-timer'
                checked={options.showTimer}
                onCheckedChange={(checked) => setOptions({ ...options, showTimer: checked })}
            />
            <Label htmlFor='show-timer' className='text-sm lg:text-base'>Show Timer</Label>
        </div>
        <div className='flex items-center space-x-2 lg:space-x-3'>
            <Switch
                id='allow-deselect'
                checked={options.allowDeselect}
                onCheckedChange={(checked) => setOptions({ ...options, allowDeselect: checked })}
            />
            <Label htmlFor='allow-deselect' className='text-sm lg:text-base'>Allow Deselect</Label>
        </div>
    </div>
)