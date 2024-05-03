import { useState } from 'react';
import ReactCardFlip from 'react-card-flip';

export const Flashcard = () => {
    const [isFlipped, setIsFlipped] = useState<boolean>(false);

    const flipCard = () => {
        setIsFlipped(!isFlipped);
    }

    return (
        <ReactCardFlip isFlipped={isFlipped} flipDirection='vertical'>
            <div key="front" onClick={flipCard}>
                This is the front of the card.
                <button onClick={flipCard}>Click to flip</button>
            </div>
            <div key="back" onClick={flipCard}>
                This is the back of the card.
                <button onClick={flipCard}>Click to flip</button>
            </div>
        </ReactCardFlip>
    );
}
