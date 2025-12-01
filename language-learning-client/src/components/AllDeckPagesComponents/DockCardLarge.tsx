import React, { useState } from "react";
import { calculateCompletePercentage } from "@/utils/calculatePercentage";
import { Play, MoreVertical, Eye, Pencil, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { DeckContext } from "@/contexts/DeckContext";
import { useContext } from "react";

export const DockCardLarge: React.FC<{
    deck: {
        _id: string;
        deckName: string;
        deckPercentage: string;
        deckTags: string[];
        cards: any[];
    };
}> = ({ deck }) => {
    const { deckName, deckTags, cards, _id } = deck;
    const navigate = useNavigate();
    const { toast } = useToast();
    const { refreshDecks } = useContext(DeckContext);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState("");
    const [deleting, setDeleting] = useState(false);

    const percentage = calculateCompletePercentage(cards);
    const numTerms = cards.length;
    const termText = numTerms === 1 ? "term" : "terms";
    
    // Get language tag (first tag is usually language)
    const languageTag = deckTags[0] || "";
    const otherTags = deckTags.slice(1);

    const handlePlay = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(`/learn-decks/${_id}`);
    };

    const handleDeleteDeck = async () => {
        setDeleting(true);
        try {
            await axios.delete(`/decks/${_id}`);
            toast({ 
                title: "Deck deleted", 
                description: `"${deckName}" has been deleted.` 
            });
            setDeleteDialogOpen(false);
            setDeleteConfirm("");
            refreshDecks();
        } catch (error) {
            toast({ 
                title: "Error", 
                description: "Failed to delete deck", 
                variant: "destructive" 
            });
        } finally {
            setDeleting(false);
        }
    };
    

    return (
        <Link 
            to={`/view-decks/${deck._id}`}
            data-testid="deck-card-container"
            className="block w-full bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-300"
        >
            <div className="p-5 flex flex-col h-full">
                {/* Deck Name */}
                <h2 className="text-lg font-semibold text-gray-900 mb-4 line-clamp-2">
                    {deckName}
                </h2>
                
                {/* Progress Section */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">{percentage}% completed</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                            className={`h-full transition-all duration-300 ${Number(percentage) === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                </div>
                
                {/* Terms and Language */}
                <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-medium text-blue-600">
                        {numTerms} {termText}
                    </span>
                    {languageTag && (
                        <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-md border border-blue-200 uppercase tracking-wide">
                            {languageTag}
                        </span>
                    )}
                </div>
                
                {/* Tags */}
                {otherTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                        {otherTags.map((tag, index) => (
                            <span 
                                key={index} 
                                className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-200"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 mt-auto pt-3 border-t border-gray-100">
                    <button
                        onClick={handlePlay}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        aria-label="Start learning"
                        title="Start learning"
                    >
                        <Play className="w-5 h-5" />
                    </button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                }}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-colors"
                                aria-label="More options"
                            >
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem asChild>
                                <Link 
                                    to={`/view-decks/${_id}`}
                                    className="flex items-center gap-2 cursor-pointer"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Eye className="w-4 h-4" />
                                    View Details
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link 
                                    to={`/edit-deck/${_id}`}
                                    className="flex items-center gap-2 cursor-pointer"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Pencil className="w-4 h-4" />
                                    Edit Deck
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setDeleteDialogOpen(true);
                                }}
                                className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Deck
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                
                {/* Delete Confirmation Dialog */}
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Deck</AlertDialogTitle>
                            <AlertDialogDescription>
                                {cards && cards.length > 0 ? (
                                    <>
                                        Are you sure you want to delete "{deckName}"? This will permanently delete the deck and all {numTerms} {termText} in it.
                                        <div className="mt-4">
                                            <p className="text-sm font-medium mb-2">Type "DELETE" to confirm:</p>
                                            <input
                                                type="text"
                                                value={deleteConfirm}
                                                onChange={(e) => setDeleteConfirm(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                                placeholder="DELETE"
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>This deck has no flashcards. It will be deleted permanently.</>
                                )}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteDeck();
                                }}
                                disabled={deleting || (cards && cards.length > 0 && deleteConfirm !== "DELETE")}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                {deleting ? "Deleting..." : "Delete Deck"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </Link>
    );
};
