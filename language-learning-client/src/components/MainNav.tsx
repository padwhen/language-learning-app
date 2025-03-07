import { Link, useLocation } from "react-router-dom";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator } from "./ui/breadcrumb";
import { Home, LogOut, Settings, Library, BookOpen, Edit3 } from "lucide-react"; // Import relevant icons
import { useContext } from "react";
import { UserContext } from "@/contexts/UserContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Avatar, AvatarImage } from "./ui/avatar";
import axios from "axios";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { LoginPage } from "./UsersComponents/LoginPage";

const breadcrumbPaths = [
    { path: '/settings', label: 'Settings', icon: <Settings /> },
    { path: '/vocabulary', label: 'Vocabulary', icon: <BookOpen /> },
    { path: '/view-all-decks', label: 'Your decks', fallback: true, icon: <Library /> },
    { path: '/view-decks', label: 'Deck Details', icon: <BookOpen /> },
    { path: '/learn-decks', label: 'Deck Learning', icon: <BookOpen /> },
    { path: '/edit-deck', label: 'Edit deck', icon: <Edit3 /> },
    { path: '/view-decks/:deckId/learning-report', label: 'Learning Report', icon: <Library /> },
    { path: '/flashcards', label: 'Flashcards Review', icon: <Library /> },
    { path: '/matchgame', label: 'Match Game', icon: <Library /> },
    { path: '/testpage', label: 'Test', icon: <Library /> },
];

export const MainNav = () => {
    const location = useLocation();
    const deckId = location.pathname.split('/')[2];
    const { user, setUser } = useContext(UserContext)

    const getLinkClassName = (path: string): string =>
        `text-base md:text-lg ${location.pathname === path || location.pathname.startsWith(path) ? 'border-b-2 border-blue-500' : ''}`;

    const getBreadcrumbs = () => {
        const pathSegments = location.pathname.split('/').filter(Boolean);
        const breadcrumbs = [];
    
        if (pathSegments[0] === 'view-decks' && pathSegments[2] === 'learning-report') {
            breadcrumbs.push(
                { path: '/view-all-decks', label: 'Your decks', icon: <Library /> },
                { path: `/view-decks/${pathSegments[1]}`, label: 'Deck Details', icon: <BookOpen /> },
                { path: location.pathname, label: 'Learning Report', icon: <Library /> }
            );
        } else {
            breadcrumbPaths.forEach(({ path, label, icon, fallback }) => {
                if (location.pathname.startsWith(path) || (fallback && !breadcrumbs.length)) {
                    breadcrumbs.push({ 
                        path: path.includes(':deckId') ? path.replace(':deckId', deckId) : path, 
                        label, 
                        icon 
                    });
                }
            });
        }

        return breadcrumbs;
    };

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

    return (
        <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-6 md:gap-12 flex-grow">
                <Link to={'/'}>
                    <h1 className="text-2xl md:text-2xl font-bold text-blue-600 cursor-pointer">Frassitsanakirja</h1>
                </Link>
                <div className="hidden md:flex flex-wrap items-center gap-4 md:gap-6">
                    <Button variant="ghost">
                        <Link to={'/'} className="flex gap-2 items-center">
                            <Home className="w-4 h-4" />
                            <h2 className="text-base md:text-lg">Translate</h2>
                        </Link>                        
                    </Button>
                    <Breadcrumb>
                        <BreadcrumbList>
                            {getBreadcrumbs().map((breadcrumb, index) => (
                                <Button variant="ghost" className="p-3" key={breadcrumb.path}>
                                    <BreadcrumbItem>
                                        {index > 0 && <BreadcrumbSeparator />}
                                        <Link to={breadcrumb.path} className="ml-1 flex items-center gap-1">
                                            {breadcrumb.icon && breadcrumb.icon} 
                                            <h2 className={getLinkClassName(breadcrumb.path)}>{breadcrumb.label}</h2>
                                        </Link>
                                    </BreadcrumbItem>
                                </Button>
                            ))}
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </div>
            <div className="flex items-center">
                {user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" className="flex items-center gap-2">
                                <Avatar className="rounded-3xl my-2 border-black">
                                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                                </Avatar>
                                <span className="text-blue-700">{user.name}</span>
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
                            <Button variant="outline" size="lg">Log In</Button>
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
