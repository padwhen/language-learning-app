// src/components/SortableSelect.tsx
import React from 'react';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from './ui/select';

interface SortableSelectProps {
    sortBy: string;
    setSortBy: (value: string) => void;
    allLanguages: string[];
}

const SortableSelect: React.FC<SortableSelectProps> = ({ setSortBy, allLanguages }) => {
    return (
        <Select onValueChange={value => setSortBy(value)}>
            <SelectTrigger className="text-lg mt-1 border rounded-md bg-gray-200 text-gray-700 px-4" data-testid="sort-select-trigger">
                <SelectValue placeholder="Most cards" />
            </SelectTrigger>
            <SelectContent data-testid="sort-select-content">
                <SelectGroup>
                    <SelectItem value="Most cards">Most cards</SelectItem>
                    <SelectItem value="Most recent">Most recent</SelectItem>
                    <SelectItem value="Most old">Most old</SelectItem>
                    <SelectItem value="Top Progress">Top Progress</SelectItem>
                    <SelectItem value="Least Progress">Least Progress</SelectItem>
                </SelectGroup>
                <SelectGroup>
                    <SelectLabel>Language</SelectLabel>
                    {allLanguages.map(language => (
                        <SelectItem key={language} value={language}>
                            {language.charAt(0).toUpperCase() + language.slice(1)}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
};

export default SortableSelect;
