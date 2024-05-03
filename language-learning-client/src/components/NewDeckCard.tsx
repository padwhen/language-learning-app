import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChangeEvent, useState } from "react"
import { BadgeComponent } from "./Badge"

export const NewDeckCard: React.FC<{setOpenNewDeck: (arg: boolean) => void;}> = ({setOpenNewDeck}) => {
  const [tags, setTags] = useState<string[]>([])
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  const handleTagsChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newTags = event.target.value.split(' ').filter(tag => tag.trim() !== '');
    const language = selectedLanguage ? selectedLanguage : ''; 
    const array = [language, ...newTags];
    setTags(array);
  };
  

  const handleLanguageSelect = (language: string) => {
    const normalizedLanguage = language.toLowerCase()
    setSelectedLanguage(normalizedLanguage)
    setTags((prevTags) => [...prevTags, normalizedLanguage])
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>New Deck</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid grid-cols-1 gap-y-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Name of the new deck" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="languages">Languages</Label>
              <Select onValueChange={(value) => handleLanguageSelect(value)}>
                <SelectTrigger id="languages">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="Finnish">Finnish 🇫🇮</SelectItem>
                  <SelectItem value="Vietnamese">Vietnamese 🇻🇳</SelectItem>
                  <SelectItem value="Korean">Korean 🇰🇷</SelectItem>
                  <SelectItem value="Chinese">Chinese 🇨🇳</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="tags">Tags</Label>
              <Input id="tags" className="h-[64px]" placeholder="Add tags by spaces" onChange={handleTagsChange} />
            </div>
            <div className="flex flex-wrap gap-1">
              {tags && tags.map((tag, index) => (
                <BadgeComponent key={index} word={tag} />
              ))}
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => setOpenNewDeck(false)}>Cancel</Button>
          <Button onClick={() => setOpenNewDeck(false)}>Add Deck</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
