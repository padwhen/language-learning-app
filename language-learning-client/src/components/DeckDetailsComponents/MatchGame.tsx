import { useMatchGame } from "@/state/hooks/useMatchGame"
import { useParams } from "react-router-dom"
import { GameBoard, GameCompletedMessage, GameHeader, GameIntro } from "./MatchGameComponents/MatchGameComponents";

export const MatchGame = () => {
    const { id } = useParams<{ id: string }>()
    if (!id) return null;
    const {
        gameCards, 
        selectedCards,
        matchedPairs,
        incorrectPair,
        timeElapsed,
        isGameCompleted,
        gameStarted,
        showPenalty,
        gameOptions,
        shuffleCards,
        handleCardClick,
        setGameStarted,
        setGameOptions
    } = useMatchGame(id)

    if (!gameStarted) {
        return <GameIntro onStart={() => setGameStarted(true)} />
    }

    return (
        <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 h-screen mt-8">
            <GameHeader
                shuffleCards={shuffleCards}
                timeElapsed={timeElapsed}
                showPenalty={showPenalty}
                gameOptions={gameOptions}
                setGameOptions={setGameOptions}
            />
            <GameBoard
                gameCards={gameCards}
                selectedCards={selectedCards}
                matchedPairs={matchedPairs}
                incorrectPair={incorrectPair}
                handleCardClick={handleCardClick}
            />
            {isGameCompleted && <GameCompletedMessage timeElapsed={timeElapsed} />}
        </div>
    )
}