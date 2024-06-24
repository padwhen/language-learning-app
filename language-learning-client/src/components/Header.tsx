import { Link, useLocation } from "react-router-dom";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator } from "./ui/breadcrumb";

export const Header = () => {
    const location = useLocation();

    const isPage = (path: string): boolean => location.pathname.startsWith(path)
    const deckId = location.pathname.split('/')[2];
    const getLinkClassName = (path: string): string => `text-lg ${location.pathname === path ? 'border-b-2 border-blue-500' : ''}`

    return (
        <div className="pt-6">
            <div className="container flex justify-between items-center">
                <div className="flex items-center gap-12">
                    <Link to={'/'}>
                        <h1 className="text-2xl text-blue-500">Language Learning App</h1>
                    </Link>
                    <div className="flex items-center gap-12 mt-[5px]">
                        <Link to={'/'}>
                            <h2 className="text-lg">Translate</h2>
                        </Link>
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    {isPage('/settings') ? (
                                        <Link to={'/settings'}>
                                            <h2 className={`text-lg text-black ${location.pathname === '/settings' ? 'border-b-2 border-blue-500' : ''}`}>Settings</h2>
                                        </Link>  
                                    ) : (
                                        <Link to={'/view-all-decks'}>
                                            <h2 className={`text-lg text-black ${location.pathname === '/view-all-decks' ? 'border-b-2 border-blue-500' : ''}`}>Your decks</h2>
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
                                            <h2 className={`text-lg ${isPage('/learn-decks') ? 'border-b-2 border-blue-500' : ''}`}>Deck Learning</h2>                                            </Link>
                                        </BreadcrumbItem>
                                    </>
                                )}
                                {isPage('/edit-deck') && (
                                    <>
                                        <BreadcrumbSeparator />
                                        <BreadcrumbItem>
                                            <Link to={`${location.pathname}`} className="ml-1">
                                                <h2 className={`text-lg ${isPage('/edit-deck') ? 'border-b-2 border-blue-500' : ''}`}>Edit deck</h2>
                                            </Link>
                                        </BreadcrumbItem>
                                    </>
                                )}
                            </BreadcrumbList>                        
                        </Breadcrumb>
                    </div>
                </div>
            </div>
        </div>
    );
};
