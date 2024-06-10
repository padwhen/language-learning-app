import { useState } from "react";

export const useHandleButtonClick = () => {
    const [chosenOptions, setChosenOptions] = useState<any[]>([]);

    const handleButtonClick = (items: any, setItems: any, index: number, chosenOption: string, selectedSuggestion: string) => {
        setItems(items.map((item: any, idx: number) => 
            idx === index ? { ...item, chosen: true } : item
        ))
        if (selectedSuggestion !== 'original') {
            setChosenOptions((prevOptions: any) => [
                ...prevOptions.filter((option: any) => option._id !== items[index]._id),
                {
                    _id: items[index]._id,
                    userLangCard: items[index].userLangCard, 
                    chosenOption
                }
            ])
        }
    }
    return { chosenOptions, handleButtonClick }
}