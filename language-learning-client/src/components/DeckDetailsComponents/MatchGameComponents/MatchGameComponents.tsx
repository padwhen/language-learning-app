import React from 'react';
import demoVideo from '../../../assets/match_demo.gif'
import { Button } from '@/components/ui/button';
import { GameCard as GameCardType, GameOptions as GameOptionsType } from '@/types';
import { Shuffle } from 'lucide-react';
import { GameCard } from './GameCard';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export const GameIntro: React.FC<{ 
    onStart: () => void,
    gameOptions: GameOptionsType,
    setGameOptions: (options: GameOptionsType) => void
}> = ({ onStart, gameOptions, setGameOptions }) => (
<div className='flex flex-col items-center justify-center h-screen max-w-2xl mx-auto p-4'>
        <h2 className='text-2xl font-bold mb-4'>Ready to play?</h2>
        <p className='mb-4 text-center'>
            Match all the terms with their definitions as fast as you can. 
            Avoid wrong matches, they add extra time!
        </p>
        <img src={demoVideo} alt='Game Preview' className='mb-4 w-full max-w-md' />
        
        <div className='mb-6 w-full'>
            <h3 className='text-lg font-semibold mb-2'>Game Options</h3>
            <div className='flex flex-col space-y-2'>
                <div className='flex items-center justify-between'>
                    <Label htmlFor='show-timer'>Show Timer</Label>
                    <Switch
                        id='show-timer'
                        checked={gameOptions.showTimer}
                        onCheckedChange={(checked) => setGameOptions({ ...gameOptions, showTimer: checked })}
                    />
                </div>
                <div className='flex items-center justify-between'>
                    <Label htmlFor='allow-deselect'>Allow Card Deselection</Label>
                    <Switch
                        id='allow-deselect'
                        checked={gameOptions.allowDeselect}
                        onCheckedChange={(checked) => setGameOptions({ ...gameOptions, allowDeselect: checked })}
                    />
                </div>
                {/* Add more options here as needed */}
            </div>
        </div>
        
        <Button onClick={onStart} className='w-full max-w-xs'>Start Game</Button>
    </div>
)

export const GameHeader: React.FC<{
    shuffleCards: () => void,
    timeElapsed: number,
    showPenalty: boolean,
    gameOptions: GameOptionsType,
}> = ({ shuffleCards, timeElapsed, showPenalty, gameOptions }) => (
    <div className='w-full flex justify-between items-center mb-4'>
        <div className='flex items-center'>
            <Button variant="ghost" className='mr-2' onClick={shuffleCards} data-testid="shuffle-button">
                <Shuffle className='w-4 h-4' />
            </Button>
            <h2 className='text-2xl font-semibold'>Match</h2>
        </div>
        <div className='flex items-center'>
            {gameOptions.showTimer && (
                <span className='text-sm mr-4'> 
                    {(timeElapsed / 1000).toFixed(1)}s
                    {showPenalty && (
                        <span className='text-red-500 ml-2'>
                            +5 penalty!
                        </span>
                    )}
                </span>
            )}
            <Button variant="ghost">
                Return to Deck Details
            </Button>
        </div>
    </div>
)

export const GameBoard: React.FC<{
    gameCards: GameCardType[],
    selectedCards: string[],
    matchedPairs: string[],
    incorrectPair: string[],
    handleCardClick: (cardId: string) => void
}> = ({ gameCards, selectedCards, matchedPairs, incorrectPair, handleCardClick }) => (
    <div className='grid grid-cols-4 gap-4 w-full'>
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
    <div>
        Time Taken: {(timeElapsed / 1000).toFixed(1)}s
    </div>
)

export const GameOptions: React.FC<{
    options: GameOptionsType,
    setOptions: (options: GameOptionsType) => void
}> = ({ options, setOptions }) => (
    <div className='mt-4 flex space-x-4'>
        <div className='flex items-center space-x-2'>
            <Switch
                id='show-timer'
                checked={options.showTimer}
                onCheckedChange={(checked) => setOptions({ ...options, showTimer: checked })}
            />
            <Label htmlFor='show-timer'>Show Timer</Label>
        </div>
        <div className='flex items-center space-x-2'>
            <Switch
                id='allow-deselect'
                checked={options.allowDeselect}
                onCheckedChange={(checked) => setOptions({ ...options, allowDeselect: checked })}
            />
            <Label htmlFor='allow-deselect'>Allow Deselect</Label>
        </div>
    </div>
)