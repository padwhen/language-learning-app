import { Link } from "react-router-dom"
import { DockCardLarge } from "../components/AllDeckPagesComponents/DockCardLarge"
import { useContext, useState} from "react";
import { UserContext } from "../contexts/UserContext";
import { DeckContext } from "../contexts/DeckContext";
import { sortAndFilterDecks } from "../utils/sortAndFilterDecks";
import { SortableSelect } from "@/components/AllDeckPagesComponents/SortableSelect";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

export const AllDecks = () => {
    const { user } = useContext(UserContext);
    const { decks, refreshDecks } = useContext(DeckContext)

    const [sortBy, setSortBy] = useState('Most cards')
    const { allLanguages, displayedDecks } = sortAndFilterDecks(decks, sortBy, false)

    // Dialog state
    const [open, setOpen] = useState(false);
    // Form state
    const [name, setName] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [language, setLanguage] = useState<string>('');
    const [description, setDescription] = useState('');
    const [visibility, setVisibility] = useState<'public' | 'private'>('public');
    const { toast } = useToast();

    // Tag input logic
    const handleTagInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTagInput(event.target.value);
    };
    const handleTagInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (["Enter", ",", " "].includes(event.key) && tagInput.trim()) {
            event.preventDefault();
            if (!tags.includes(tagInput.trim())) {
                setTags([...tags, tagInput.trim()]);
            }
            setTagInput('');
        } else if (event.key === "Backspace" && !tagInput && tags.length > 0) {
            setTags(tags.slice(0, -1));
        }
    };
    const handleRemoveTag = (tag: string) => {
        setTags(tags.filter(t => t !== tag));
    };

    const handleAddDeck = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await axios.post('/decks', {
                deckName: name,
                deckTags: [language, ...tags].filter(Boolean),
                description,
                visibility
            });
            refreshDecks();
            setOpen(false);
            toast({
                title: `${name} just added to your account!`,
                description: `Now you can add flashcards into it.`
            });
            setName('');
            setTags([]);
            setTagInput('');
            setLanguage('');
            setDescription('');
            setVisibility('public');
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to create deck', variant: 'destructive' });
        }
    };

    // Live preview deck object
    const previewDeck = {
        _id: 'preview',
        deckName: name || 'Deck Name',
        deckTags: [language, ...tags].filter(Boolean),
        cards: [],
        deckPercentage: '0',
        description,
    };

    return (
        <div className="pt-4 md:pt-[30px] px-4 md:px-5 md:mx-32">
            <div className="flex sm:flex-row items-center justify-center mb-6 text-2xl md:text-4xl font-bold">
                <h1 className="bg-gradient-to-r from-fuchsia-600 to-pink-600 text-transparent bg-clip-text">
                    @{user?.name || user?.username}
                </h1>
                <h1 className="text-gray-900 ml-2">all decks</h1>
            </div>
            {displayedDecks.length > 0 && (
                <div className="w-full max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-6">
                        <div className="w-full sm:w-auto ml-auto flex gap-2 items-center">
                            <SortableSelect sortBy={sortBy} setSortBy={setSortBy} allLanguages={allLanguages} />
                            <Dialog open={open} onOpenChange={setOpen}>
                                <DialogTrigger asChild className="text-lg mt-1 border rounded-md px-4">
                                    <Button variant="default">New Deck</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Create a New Deck</DialogTitle>
                                        <DialogDescription>Fill in the details below to create a new deck.</DialogDescription>
                                    </DialogHeader>
                                    <form className="grid gap-4 py-4" onSubmit={handleAddDeck}>
                                        <div className="flex flex-col gap-2">
                                            <Label htmlFor="deck-name">Name *</Label>
                                            <Input id="deck-name" value={name} onChange={e => setName(e.target.value)} required placeholder="Name of the new deck" />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <Label htmlFor="deck-language">Language (optional)</Label>
                                            <Select value={language} onValueChange={setLanguage}>
                                                <SelectTrigger id="deck-language">
                                                    <SelectValue placeholder="Select language" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Finnish">🇫🇮 Finnish</SelectItem>
                                                    <SelectItem value="Vietnamese">🇻🇳 Vietnamese</SelectItem>
                                                    <SelectItem value="Korean">🇰🇷 Korean</SelectItem>
                                                    <SelectItem value="Chinese">🇨🇳 Chinese</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <Label htmlFor="deck-tags">Tags</Label>
                                            <Input
                                                id="deck-tags"
                                                value={tagInput}
                                                onChange={handleTagInputChange}
                                                onKeyDown={handleTagInputKeyDown}
                                                placeholder="Type a tag and press Enter"
                                                autoComplete="off"
                                            />
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {tags.map((tag, _idx) => (
                                                    <Badge key={tag} className="flex items-center gap-1 px-2 py-1 text-xs">
                                                        {tag}
                                                        <button type="button" className="ml-1" onClick={() => handleRemoveTag(tag)}>
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                            <span className="text-xs text-muted-foreground">Press Enter, comma, or space to add a tag.</span>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <Label htmlFor="deck-description">Description (optional)</Label>
                                            <Textarea id="deck-description" value={description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)} placeholder="Describe this deck..." />
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <Label htmlFor="deck-visibility">Visibility</Label>
                                            <Select value={visibility} onValueChange={v => setVisibility(v as 'public' | 'private')}>
                                                <SelectTrigger id="deck-visibility">
                                                    <SelectValue placeholder="Select visibility" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="public">Public</SelectItem>
                                                    <SelectItem value="private">Private</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button type="button" variant="outline">Cancel</Button>
                                            </DialogClose>
                                            <Button type="submit">Create Deck</Button>
                                        </DialogFooter>
                                    </form>
                                    {/* Live Preview */}
                                    <div className="mt-6">
                                        <div className="text-sm text-muted-foreground mb-2">Live Preview</div>
                                        <div className="max-w-md mx-auto">
                                            <DockCardLarge deck={previewDeck} />
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-5 justify-center items-stretch">
                    {displayedDecks.map((deck: any) => (
                        <Link key={deck._id} to={`/view-decks/${deck._id}`} className="flex">
                            <DockCardLarge deck={deck} />
                        </Link>
                    ))}
                    </div>
                </div>                
            )}
        </div>
    )
}
