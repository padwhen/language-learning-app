import { Link, useLocation } from "react-router-dom";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator } from "./ui/breadcrumb";

export const MainNav = () => {
    const location = useLocation();

    const isPage = (path: string): boolean => location.pathname.startsWith(path)
    const deckId = location.pathname.split('/')[2];
    const getLinkClassName = (path: string): string => `text-base md:text-lg ${location.pathname === path ? 'border-b-2 border-blue-500' : ''}`

    return (
        <div data-testid="main-nav" className="hidden md:flex flex-wrap items-center gap-6 md:gap-12">
            <Link to={'/'}>
                <h1 className="text-xl md:text-2xl text-blue-500">Frassitsanakirja</h1>
            </Link>
            <div className="flex flex-wrap items-center gap-4 md:gap-12 mt-2 md:mt-[5px]">
                <Link to={'/'}>
                    <h2 className="text-base md:text-lg">Translate</h2>
                </Link>
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            {isPage('/settings') ? (
                                <Link to={'/settings'}>
                                    <h2 className={`text-base md:text-lg text-black ${location.pathname === '/settings' ? 'border-b-2 border-blue-500' : ''}`}>Settings</h2>
                                </Link>  
                            ) : (
                                <Link to={'/view-all-decks'}>
                                    <h2 className={`text-base md:text-lg text-black ${location.pathname === '/view-all-decks' ? 'border-b-2 border-blue-500' : ''}`}>Your decks</h2>
                                </Link>   
                            )}
                        </BreadcrumbItem>
                        {(isPage('/view-decks') || isPage('/learn-decks') || isPage('/edit-deck')) && (
                            <>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <Link to={`/view-decks/${deckId}`} className="ml-1">
                                        <h2 className={getLinkClassName(`/view-decks/${deckId}`)}>Deck Details</h2>
                                    </Link>
                                </BreadcrumbItem>
                            </>
                        )}
                        {isPage('/learn-decks') && (
                            <>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <Link to={`${location.pathname}`} className="ml-1">
                                    <h2 className={`text-base md:text-lg ${isPage('/learn-decks') ? 'border-b-2 border-blue-500' : ''}`}>Deck Learning</h2>                                            </Link>
                                </BreadcrumbItem>
                            </>
                        )}
                        {isPage('/edit-deck') && (
                            <>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <Link to={`${location.pathname}`} className="ml-1">
                                        <h2 className={`text-base md:text-lg ${isPage('/edit-deck') ? 'border-b-2 border-blue-500' : ''}`}>Edit deck</h2>
                                    </Link>
                                </BreadcrumbItem>
                            </>
                        )}
                    </BreadcrumbList>                        
                </Breadcrumb>
            </div>
        </div>
    );
};