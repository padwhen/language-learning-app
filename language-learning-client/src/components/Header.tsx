import { useState, useEffect } from "react";
import { MobileNav } from "./MobileNav";
import { MainNav } from "./MainNav";

export const Header = ({ onStartTour, highlightUser }: { onStartTour?: () => void; highlightUser?: boolean }) => {
    const [isMobile, setIsMobile] = useState(false);

    // Function to check the screen width and update the state
    const handleResize = () => {
        setIsMobile(window.innerWidth <= 768);  // assuming <= 768px is mobile
    };

    // Check screen size on initial load and when resized
    useEffect(() => {
        handleResize(); // Check on initial load
        window.addEventListener("resize", handleResize); // Listen for window resize

        // Cleanup listener when component unmounts
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="pt-6">
            <div className="container flex flex-wrap justify-between items-center">
                {isMobile ? <MobileNav /> : <MainNav onStartTour={onStartTour} highlightUser={highlightUser} />}
            </div>
        </div>
    );
};
