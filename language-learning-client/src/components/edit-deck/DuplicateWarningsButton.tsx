import { useEffect, useState } from "react";
import { Button } from "../ui/button";

interface DuplicateWarningsButtonProps {
    duplicates: { [key: string]: any[] }
    onNavigate: (cardId: string) => void
}

export const DuplicateWarningsButton: React.FC<DuplicateWarningsButtonProps> = ({
    duplicates, onNavigate
}) => {
    const [warningCount, setWarningCount] = useState(0)
    const [currentWarningIndex, setCurrentWarningIndex] = useState(0)

    useEffect(() => {
        setWarningCount(Object.keys(duplicates).length)
    }, [duplicates])

    const handleClick = () => {
        if (warningCount > 0) {
            const duplicateCardIds = Object.keys(duplicates)
            const cardId = duplicateCardIds[currentWarningIndex]
            onNavigate(cardId)
            setCurrentWarningIndex((prevIndex) => (prevIndex + 1) % warningCount)
        }
    }

    if (warningCount == 0) return null;

    return (
        <Button
            onClick={handleClick}
            disabled={warningCount == 0}
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
        >
            Duplications warning -- Click here to check ({warningCount})
        </Button>
    )
}