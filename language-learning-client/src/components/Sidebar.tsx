import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/contexts/UserContext";
import { DeckContext } from "@/contexts/DeckContext";
import { useSidebar } from "@/contexts/SidebarContext";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { 
    Languages, 
    Library, 
    Settings, 
    LogOut, 
    Info,
    ChevronRight,
    Compass,
    LogIn,
    ChevronLeft
} from "lucide-react";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { LoginPage } from "./UsersComponents/LoginPage";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";

interface SidebarProps {
    onStartTour?: () => void;
}

export const Sidebar = ({ onStartTour }: SidebarProps) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, setUser } = useContext(UserContext);
    const { decks } = useContext(DeckContext);
    const { isCollapsed, toggleSidebar } = useSidebar();
    const [recentDecks, setRecentDecks] = useState<any[]>([]);

    useEffect(() => {
        // Get recent decks (limit to 3-5 most recent)
        if (decks && decks.length > 0) {
            // Sort by most recent (you might want to add a createdAt field)
            const sorted = [...decks];
            setRecentDecks(sorted.slice(0, 5));
        }
    }, [decks]);

    const handleLogout = async () => {
        try {
            await axios.post('/logout');
            setUser(null);
            localStorage.clear();
            window.location.reload();
        } catch (error) {
            console.error('Error logging out: ', error);
        }
    };

    const handleStartTour = () => {
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('tour', 'true');
        navigate(currentUrl.pathname + currentUrl.search);
        
        if (onStartTour) {
            onStartTour();
        }
    };

    const isActive = (path: string) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    const navItems = [
        { path: '/', label: 'Translate', icon: Languages },
        ...(user ? [
            { path: '/view-all-decks', label: 'All Decks', icon: Library },
            { path: '/vocabulary', label: 'All saved terms', icon: Compass },
        ] : []),
    ];

    return (
        <div className={`hidden md:flex h-screen bg-blue-50 flex-col fixed left-0 top-0 z-40 transition-all duration-300 ${
            isCollapsed ? 'w-16' : 'w-60'
        }`}>
            {/* Toggle Button */}
            <div className="flex justify-end p-2 border-b border-blue-100">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleSidebar}
                                className="h-8 w-8 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                            >
                                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                            {isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            {/* User Profile Section */}
            <div className={`border-b border-blue-100 transition-all duration-300 ${isCollapsed ? 'p-2' : 'p-6'}`}>
                {user ? (
                    <div className={`flex flex-col items-center gap-3 ${isCollapsed ? 'gap-2' : ''}`}>
                        <Avatar className={`border-2 border-blue-200 ${isCollapsed ? 'w-12 h-12' : 'w-16 h-16'}`}>
                            <AvatarImage 
                                src={user.avatarUrl || "https://github.com/shadcn.png"} 
                                alt={user.name || user.username} 
                            />
                        </Avatar>
                        {!isCollapsed && (
                            <div className="text-center">
                                <p className="font-semibold text-gray-800">{user.name || user.username}</p>
                                <p className="text-sm text-gray-600">{user.username || 'user'}</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className={`flex flex-col items-center gap-3 ${isCollapsed ? 'gap-2' : ''}`}>
                        <Avatar className={`border-2 border-blue-200 ${isCollapsed ? 'w-12 h-12' : 'w-16 h-16'}`}>
                            <AvatarImage src="https://github.com/shadcn.png" alt="Guest" />
                        </Avatar>
                        {!isCollapsed && (
                            <div className="text-center">
                                <p className="font-semibold text-gray-800">Guest</p>
                                <p className="text-sm text-gray-600">Not logged in</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Main Navigation */}
            <nav className={`flex-1 py-6 space-y-2 overflow-y-auto transition-all duration-300 ${isCollapsed ? 'px-2' : 'px-4'}`}>
                <TooltipProvider>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        const linkContent = (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center rounded-lg transition-colors ${
                                    isCollapsed 
                                        ? 'justify-center px-2 py-3' 
                                        : 'gap-3 px-4 py-3'
                                } ${
                                    active
                                        ? 'bg-blue-100 text-blue-700 font-medium'
                                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                                }`}
                            >
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                {!isCollapsed && <span>{item.label}</span>}
                            </Link>
                        );

                        if (isCollapsed) {
                            return (
                                <Tooltip key={item.path}>
                                    <TooltipTrigger asChild>
                                        {linkContent}
                                    </TooltipTrigger>
                                    <TooltipContent side="right">
                                        {item.label}
                                    </TooltipContent>
                                </Tooltip>
                            );
                        }

                        return linkContent;
                    })}
                </TooltipProvider>

                {/* My Decks Section */}
                {user && recentDecks.length > 0 && !isCollapsed && (
                    <div className="mt-8">
                        <div className="flex items-center justify-between px-4 mb-3">
                            <h3 className="text-sm font-semibold text-gray-700">My Decks</h3>
                            <Link 
                                to="/view-all-decks" 
                                className="text-xs text-blue-600 hover:text-blue-700"
                            >
                                See all
                            </Link>
                        </div>
                        <div className="space-y-1">
                            {recentDecks.map((deck) => (
                                <Link
                                    key={deck._id}
                                    to={`/view-decks/${deck._id}`}
                                    className="flex items-center justify-between px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors group"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate">
                                            {deck.deckName}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {deck.cards?.length || 0} cards
                                        </p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 flex-shrink-0" />
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </nav>

            {/* Bottom Navigation */}
            <div className={`border-t border-blue-100 space-y-1 transition-all duration-300 ${isCollapsed ? 'p-2' : 'p-4'}`}>
                <TooltipProvider>
                    {isCollapsed ? (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    onClick={handleStartTour}
                                    className="w-full justify-center text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                                >
                                    <Info className="w-5 h-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">Take tour</TooltipContent>
                        </Tooltip>
                    ) : (
                        <Button
                            variant="ghost"
                            onClick={handleStartTour}
                            className="w-full justify-start text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                        >
                            <Info className="w-5 h-5 mr-3" />
                            Take tour
                        </Button>
                    )}
                    
                    {isCollapsed ? (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link
                                    to="/settings"
                                    className={`flex items-center justify-center px-2 py-3 rounded-lg transition-colors ${
                                        isActive('/settings')
                                            ? 'bg-blue-100 text-blue-700 font-medium'
                                            : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                                    }`}
                                >
                                    <Settings className="w-5 h-5" />
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right">Settings</TooltipContent>
                        </Tooltip>
                    ) : (
                        <Link
                            to="/settings"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                isActive('/settings')
                                    ? 'bg-blue-100 text-blue-700 font-medium'
                                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                            }`}
                        >
                            <Settings className="w-5 h-5" />
                            <span>Settings</span>
                        </Link>
                    )}
                    
                    {user ? (
                        isCollapsed ? (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        onClick={handleLogout}
                                        className="w-full justify-center text-gray-700 hover:bg-blue-50 hover:text-red-600"
                                    >
                                        <LogOut className="w-5 h-5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="right">Logout</TooltipContent>
                            </Tooltip>
                        ) : (
                            <Button
                                variant="ghost"
                                onClick={handleLogout}
                                className="w-full justify-start text-gray-700 hover:bg-blue-50 hover:text-red-600"
                            >
                                <LogOut className="w-5 h-5 mr-3" />
                                Logout
                            </Button>
                        )
                    ) : (
                        isCollapsed ? (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                className="w-full justify-center text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                                            >
                                                <LogIn className="w-5 h-5" />
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-[555px] max-h-[570px] overflow-y-auto">
                                            <DialogHeader>
                                                <DialogTitle className="text-4xl flex items-center justify-center mt-8">Log In</DialogTitle>
                                            </DialogHeader>
                                            <LoginPage />
                                        </DialogContent>
                                    </Dialog>
                                </TooltipTrigger>
                                <TooltipContent side="right">Log In</TooltipContent>
                            </Tooltip>
                        ) : (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                                    >
                                        <LogIn className="w-5 h-5 mr-3" />
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
                        )
                    )}
                </TooltipProvider>
            </div>
        </div>
    );
};

