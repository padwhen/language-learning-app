import { Link } from "react-router-dom";
import { Button } from "../ui/button";

export const NoCard = () => {
    return (
        <>
        <div data-testid="no-card-container" className="min-h-[250px] md:h-[350px] shadow-md max-w-[875px] border mt-5 flex items-center justify-center flex-col px-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl text-center">There is no card in this deck yet</h1>
        </div>
        <Button className="mt-5 sm:text-lg text-base">
                <Link to={'/'}>Back to translate page</Link>
            </Button>
        </>
    );
};
