import { useMatchGame } from "@/state/hooks/useMatchGame"
import { Navigate, useParams } from "react-router-dom"
import { GameBoard, GameCompletedMessage, GameHeader, GameIntro } from "./MatchGameComponents/MatchGameComponents";

export const MatchGame = () => {
    const { id } = useParams()

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
        setGameOptions,
        shuffleCards,
        handleCardClick,
        startGame,
    } = useMatchGame(id ?? '')

    if (!id) { return <Navigate to="/" replace /> }

    if (!gameStarted) {
        return <GameIntro gameOptions={gameOptions} setGameOptions={setGameOptions} onStart={startGame} />
    }

    return (
        <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 h-screen mt-8">
            <GameHeader
                shuffleCards={shuffleCards}
                timeElapsed={timeElapsed}
                showPenalty={showPenalty}
                gameOptions={gameOptions}
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