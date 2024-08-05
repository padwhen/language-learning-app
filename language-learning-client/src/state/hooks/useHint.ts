import { useState } from "react"

export const useHint = () => {
    const [hint, setHint] = useState<string>("")

    const generateHint = (word: string) => {
        if (!word) return
        if (word.length < 2) {
            setHint(word)
        } else {
            const hintArray = word.split('').map((char: string, index: number) => {
                if (index === 0 || index === word.length - 1) {
                    return char
                }
                return " _ "
            })
            setHint(hintArray.join(''))
        }
    }

    return { hint, generateHint }
}