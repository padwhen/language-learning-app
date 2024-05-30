import { Link } from "react-router-dom";
import { Button } from "../ui/button";

export const NoCard = () => {
    return (
        <>
        <div data-testid="no-card-container" className="h-[350px] shadow-md w-[875px] border mt-5 flex items-center justify-center flex-col">
            <h1 className="text-5xl">There is no card in this deck yet</h1>
        </div>
        <Button className="mt-5 text-lg">
                <Link to={'/'}>Back to translate page</Link>
            </Button>
        </>
    );
};
