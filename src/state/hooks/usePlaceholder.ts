import { useEffect, useState } from "react";

export const usePlaceholder = (termSeparator: string, cardSeparator: string) => {
    const [placeholder, setPlaceholder] = useState('')

    useEffect(() => {
        let termSep = '\t'
        if (termSeparator === 'comma') termSep = ','
        let cardSep = '\n'
        if (cardSeparator === 'semicolon') cardSep = ';'
        setPlaceholder(`Card1${termSep}Card2${cardSep}Card3${termSep}Card4`)
    }, [termSeparator, cardSeparator])

    return placeholder
}