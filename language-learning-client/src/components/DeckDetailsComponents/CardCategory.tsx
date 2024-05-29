import { Word } from "./Word";

type CardCategoryProps = {
    categoryName: string;
    cards: any[];
    id?: string;
}

export const CardCategory = ({ categoryName, cards, id }: CardCategoryProps) => {
    return (
        <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold text-pink-500 pt-3">{categoryName} ({cards.length})</h2>
            {cards.length > 0 ? (
                <>
                    {categoryName === 'Still learning' && (
                        <h3 className="text-gray-500 text-lg">You've begun learning these terms. Keep up the good work!</h3>
                    )}
                    {categoryName === 'Not studied' && (
                        <h3 className="text-gray-500 text-lg">You haven't studied these terms yet.</h3>
                    )}
                    {categoryName === 'Completed' && (
                        <h3 className="text-gray-500 text-lg">Congratulations!</h3>
                    )}
                    <div className="flex flex-col gap-3 mt-2">
                        {cards.map((card: any) => (
                            <Word cardId={card._id} key={card._id} deckId={id} engCard={card.engCard} userLangCard={card.userLangCard} />
                        ))}
                    </div>
                </>
            ) : (
                <h3 className="text-gray-500 text-md">There are no cards in "{categoryName}".</h3>
            )}
        </div>
    );
}