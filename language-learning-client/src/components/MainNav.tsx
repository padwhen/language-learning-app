import { Link, useLocation, useNavigate } from "react-router-dom";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator } from "./ui/breadcrumb";
import { Home, LogOut, Settings, Library, BookOpen, Edit3, Info } from "lucide-react";
import { useContext } from "react";
import { UserContext } from "@/contexts/UserContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Avatar, AvatarImage } from "./ui/avatar";
import axios from "axios";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { LoginPage } from "./UsersComponents/LoginPage";
import { motion, AnimatePresence } from "framer-motion";

export const MainNav = ({ onStartTour, highlightUser }: { onStartTour?: () => void; highlightUser?: boolean }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, setUser } = useContext(UserContext)
    const isPage = (path: string): boolean => location.pathname.startsWith(path)
    const deckId = location.pathname.split('/')[2];
    const getLinkClassName = (path: string): string =>
        `relative font-medium tracking-wide transition-colors duration-200 px-1 py-0.5 rounded-md ` +
        (location.pathname === path ? 'text-blue-600' : 'text-gray-700 hover:text-blue-500') +
        ' text-base md:text-lg';

    const handleLogout = async () => {
        try {
            await axios.post('/logout');
            setUser(null);
            localStorage.clear();
            window.location.reload();
        } catch (error) {
            console.error('Error logging out: ', error);
        }
    }

    const handleStartTour = () => {
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('tour', 'true');
        navigate(currentUrl.pathname + currentUrl.search);
        
        if (onStartTour) {
            onStartTour();
        }
    };

    // Animation for underline
    const Underline = () => (
        <motion.div
            layoutId="underline"
            className="absolute left-0 right-0 bottom-0 h-[2.5px] bg-blue-500 rounded"
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
    );

    return (
        <div className="flex items-center justify-between w-full px-2 md:px-0">
            <div className="flex items-center gap-4 md:gap-12 flex-grow min-w-0">
                <Link to={'/'}>
                    <h1 className="text-xl md:text-2xl font-bold text-blue-600 cursor-pointer tracking-tight whitespace-nowrap">Frassitsanakirja</h1>
                </Link>
                <div className="hidden md:flex flex-wrap items-center gap-2 md:gap-6 mt-2 md:mt-[5px] min-w-0">
                    <Button variant="ghost" className="p-0 m-0 bg-transparent">
                        <Link to={'/'} className="flex gap-2 items-center relative">
                            <Home className="w-4 h-4" />
                            <span className={getLinkClassName('/') + ' flex items-center'}>
                                Translate
                                <AnimatePresence>
                                    {location.pathname === '/' && <Underline key="underline-translate" />}
                                </AnimatePresence>
                            </span>
                        </Link>
                    </Button>
                    <Breadcrumb>
                        <BreadcrumbList className="flex flex-wrap gap-1 md:gap-2">
                            <BreadcrumbItem>
                                {isPage('/settings') && (
                                    <Link to={'/settings'} className="flex gap-1 items-center relative">
                                        <Settings className="w-4 h-4" />
                                        <span className={getLinkClassName('/settings') + ' flex items-center'}>
                                            Settings
                                            <AnimatePresence>
                                                {location.pathname === '/settings' && <Underline key="underline-settings" />}
                                            </AnimatePresence>
                                        </span>
                                    </Link>  
                                )}
                                {isPage('/vocabulary') && (
                                    <Link to={'/vocabulary'} className="flex gap-1 items-center relative">
                                        <Library className="w-4 h-4" />
                                        <span className={getLinkClassName('/vocabulary') + ' flex items-center'}>
                                            Vocabulary
                                            <AnimatePresence>
                                                {location.pathname === '/vocabulary' && <Underline key="underline-vocab" />}
                                            </AnimatePresence>
                                        </span>
                                    </Link>  
                                )}
                                {!isPage('/settings') && !isPage('/vocabulary') && (
                                    <Link to={'/view-all-decks'} className="flex gap-1 items-center relative">
                                        <Library className="w-4 h-4" />
                                        <span className={getLinkClassName('/view-all-decks') + ' flex items-center'}>
                                            Your decks
                                            <AnimatePresence>
                                                {location.pathname === '/view-all-decks' && <Underline key="underline-decks" />}
                                            </AnimatePresence>
                                        </span>
                                    </Link>   
                                )}
                            </BreadcrumbItem>
                            {(isPage('/view-decks') || isPage('/learn-decks') || isPage('/matchgame') || isPage(`/view-decks/${deckId}`) || isPage('/flashcards') || isPage('/testpage') || isPage('/edit-deck')) &&  (
                                <>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        <Link to={`/view-decks/${deckId}`} className="ml-1 flex gap-1 items-center relative">
                                            <BookOpen className="w-4 h-4" />
                                            <span className={getLinkClassName(`/view-decks/${deckId}`) + ' flex items-center'}>
                                                Deck Details
                                                <AnimatePresence>
                                                    {location.pathname === `/view-decks/${deckId}` && <Underline key="underline-details" />}
                                                </AnimatePresence>
                                            </span>
                                        </Link>
                                    </BreadcrumbItem>
                                </>
                            )}
                            {isPage('/learn-decks') && (
                                <>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        <Link to={`${location.pathname}`} className="ml-1 flex gap-1 items-center relative">
                                            <BookOpen className="w-4 h-4" />
                                            <span className={getLinkClassName('/learn-decks') + ' flex items-center'}>
                                                Deck Learning
                                                <AnimatePresence>
                                                    {isPage('/learn-decks') && <Underline key="underline-learning" />}
                                                </AnimatePresence>
                                            </span>
                                        </Link>
                                    </BreadcrumbItem>
                                </>
                            )}
                            {isPage('/edit-deck') && (
                                <>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        <Link to={`${location.pathname}`} className="ml-1 flex gap-1 items-center relative">
                                            <Edit3 className="w-4 h-4" />
                                            <span className={getLinkClassName('/edit-deck') + ' flex items-center'}>
                                                Edit deck
                                                <AnimatePresence>
                                                    {isPage('/edit-deck') && <Underline key="underline-edit" />}
                                                </AnimatePresence>
                                            </span>
                                        </Link>
                                    </BreadcrumbItem>
                                </>
                            )}
                            {isPage(`/view-decks/${deckId}/learning-report`) && (
                                <>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        <Link to={`${location.pathname}`} className="ml-1 flex gap-1 items-center relative">
                                            <Library className="w-4 h-4" />
                                            <span className={getLinkClassName(`/view-decks/${deckId}/learning-report`) + ' flex items-center'}>
                                                Learning Report
                                                <AnimatePresence>
                                                    {isPage(`/view-decks/${deckId}/learning-report`) && <Underline key="underline-report" />}
                                                </AnimatePresence>
                                            </span>
                                        </Link>
                                    </BreadcrumbItem>
                                </>
                            )}
                            {isPage('/flashcards') && (
                                <>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        <Link to={`${location.pathname}`} className="ml-1 flex gap-1 items-center relative">
                                            <Library className="w-4 h-4" />
                                            <span className={getLinkClassName('/flashcards') + ' flex items-center'}>
                                                Flashcards Review
                                                <AnimatePresence>
                                                    {isPage('/flashcards') && <Underline key="underline-flashcards" />}
                                                </AnimatePresence>
                                            </span>
                                        </Link>
                                    </BreadcrumbItem>
                                </>
                            )}
                            {isPage('/matchgame') && (
                                <>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        <Link to={`${location.pathname}`} className="ml-1 flex gap-1 items-center relative">
                                            <Library className="w-4 h-4" />
                                            <span className={getLinkClassName('/matchgame') + ' flex items-center'}>
                                                Match Game
                                                <AnimatePresence>
                                                    {isPage('/matchgame') && <Underline key="underline-matchgame" />}
                                                </AnimatePresence>
                                            </span>
                                        </Link>
                                    </BreadcrumbItem>
                                </>
                            )}
                            {isPage('/testpage') && (
                                <>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        <Link to={`${location.pathname}`} className="ml-1 flex gap-1 items-center relative">
                                            <Library className="w-4 h-4" />
                                            <span className={getLinkClassName('/testpage') + ' flex items-center'}>
                                                Test
                                                <AnimatePresence>
                                                    {isPage('/testpage') && <Underline key="underline-test" />}
                                                </AnimatePresence>
                                            </span>
                                        </Link>
                                    </BreadcrumbItem>
                                </>
                            )}
                        </BreadcrumbList>                        
                    </Breadcrumb>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleStartTour}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                    <Info className="w-4 h-4" />
                    <span className="text-sm">Take Tour</span>
                </Button>
                {user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button 
                                variant="secondary" 
                                className={`flex items-center gap-2 transition-all duration-300 ${
                                    highlightUser ? 'ring-4 ring-blue-500 ring-opacity-75 bg-blue-50 shadow-lg' : ''
                                }`}
                            >
                                <Avatar className="rounded-3xl my-2 border-black">
                                    <AvatarImage aria-label="avatar" src={user.avatarUrl} alt={user.name} />
                                </Avatar>
                                <span className="text-blue-700 font-semibold">{user.name}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem>
                                <Link to="/settings" className="flex gap-2 items-center justify-center">
                                    <Settings className="w-4 h-4" />
                                    <span>Settings</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <button onClick={handleLogout} className="flex gap-2 items-center justify-center">
                                    <LogOut className="w-4 h-4" />
                                    <span>Log Out</span>
                                </button>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Link to="/vocabulary" className="flex gap-2 items-center justify-center">
                                    <Library className="w-4 h-4" />
                                    <span>All saved terms</span>
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>                  
                ) : (
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button 
                                variant="outline" 
                                size="lg"
                                className={`transition-all duration-300 ${
                                    highlightUser ? 'ring-4 ring-blue-500 ring-opacity-75 bg-blue-50 shadow-lg' : ''
                                }`}
                            >
                                Log In
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[555px] max-h-[570px] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="text-4xl flex items-center justify-center mt-8">Log In</DialogTitle>
                            </DialogHeader>
                            <LoginPage />
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </div>
    );
};
