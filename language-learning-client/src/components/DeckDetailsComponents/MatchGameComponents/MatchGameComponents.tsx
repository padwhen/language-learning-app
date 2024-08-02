import React from 'react';
import demoVideo from '../../../assets/match_demo.gif'
import { Button } from '@/components/ui/button';
import { GameCard as GameCardType, GameOptions } from '@/types';
import { Shuffle } from 'lucide-react';
import { OptionsDialog } from './OptionsDialog';
import { GameCard } from './GameCard';

export const GameIntro: React.FC<{ onStart: () => void }> = ({ onStart }) => (
    <div className='text-center'>
        <h2 className='text-2xl font-bold mb-4'>Ready to play?</h2>
        <p className='mb-4'>
            Match all the terms with their definitions as fast as you can. 
            Avoid wrong matches, they add extra time!
        </p>
        <img src={demoVideo} alt='Game Preview' className='mb-4' />
        <Button onClick={onStart}>Start Game</Button>
    </div>
)

export const GameHeader: React.FC<{
    shuffleCards: () => void,
    timeElapsed: number,
    showPenalty: boolean,
    gameOptions: GameOptions,
    setGameOptions: (options: GameOptions) => void

}> = ({ shuffleCards, timeElapsed, showPenalty, gameOptions, setGameOptions }) => (
    <div className='w-full flex justify-between items-center mb-4'>
        <div className='flex items-center'>
            <Button variant="ghost" className='mr-2' onClick={shuffleCards}>
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
            <OptionsDialog options={gameOptions} setOptions={setGameOptions} />
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