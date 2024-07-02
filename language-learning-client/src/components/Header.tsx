import { MobileNav } from "./MobileNav";
import { MainNav } from "./MainNav";

export const Header = () => {
    return (
        <div className="pt-6">
            <div className="container flex flex-wrap justify-between items-center">
                <MobileNav />
                <MainNav />
            </div>
        </div>
    );
};
