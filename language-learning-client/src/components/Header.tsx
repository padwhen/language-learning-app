import { Link, useLocation } from "react-router-dom";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator } from "./ui/breadcrumb";

export const Header = () => {
    const location = useLocation();

    const isViewDecksPage = location.pathname.startsWith('/view-decks');
    const isLearnPage = location.pathname.startsWith('/learn-decks');
    const isEditPage = location.pathname.startsWith('/edit-deck');
    const deckId = location.pathname.split('/')[2];
    const isSettingPage = location.pathname.startsWith('/settings');

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
                                    {isSettingPage ? (
                                        <Link to={'/settings'}>
                                            <h2 className={`text-lg text-black ${location.pathname === '/settings' ? 'border-b-2 border-blue-500' : ''}`}>Settings</h2>
                                        </Link>  
                                    ) : (
                                        <Link to={'/view-all-decks'}>
                                            <h2 className={`text-lg text-black ${location.pathname === '/view-all-decks' ? 'border-b-2 border-blue-500' : ''}`}>Your decks</h2>
                                        </Link>   
                                    )}
                          
                                </BreadcrumbItem>
                                {(isViewDecksPage || isLearnPage || isEditPage) && (
                                    <>
                                        <BreadcrumbSeparator />
                                        <BreadcrumbItem>
                                            <Link to={`/view-decks/${deckId}`} className="ml-1">
                                                <h2 className={`text-lg ${isViewDecksPage ? 'border-b-2 border-blue-500' : ''}`}>Deck Details</h2>
                                            </Link>
                                        </BreadcrumbItem>
                                    </>
                                )}
                                {isLearnPage && (
                                    <>
                                        <BreadcrumbSeparator />
                                        <BreadcrumbItem>
                                            <Link to={`${location.pathname}`} className="ml-1">
                                                <h2 className={`text-lg ${isLearnPage ? 'border-b-2 border-blue-500' : ''}`}>Deck Learning</h2>
                                            </Link>
                                        </BreadcrumbItem>
                                    </>
                                )}
                                {isEditPage && (
                                    <>
                                        <BreadcrumbSeparator />
                                        <BreadcrumbItem>
                                            <Link to={`${location.pathname}`} className="ml-1">
                                                <h2 className={`text-lg ${isEditPage ? 'border-b-2 border-blue-500' : ''}`}>Edit deck</h2>
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
