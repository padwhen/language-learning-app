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
        <div className="flex flex-col w-full max-w-6xl xl:max-w-7xl mx-auto p-2 sm:p-4 lg:p-6 xl:p-8 min-h-screen">
            <GameHeader
                shuffleCards={shuffleCards}
                timeElapsed={timeElapsed}
                showPenalty={showPenalty}
                gameOptions={gameOptions}
            />
            <div className="w-full mt-4 sm:mt-6 lg:mt-8">
                <GameBoard
                    gameCards={gameCards}
                    selectedCards={selectedCards}
                    matchedPairs={matchedPairs}
                    incorrectPair={incorrectPair}
                    handleCardClick={handleCardClick}
                />
            </div>
            {isGameCompleted && <GameCompletedMessage timeElapsed={timeElapsed} />}
        </div>
    )
}