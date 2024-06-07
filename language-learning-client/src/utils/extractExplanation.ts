export const extractExplanation = (explanation: string): { text: string, link: string } => {
    const regex = /^(.+)\s(https?:\/\/[^\s]+)/;
    const match = explanation.match(regex)
    if (match) {
        return {
            text: match[1].trim(),
            link: match[2].trim()
        }
    } else {
        return {
            text: explanation.trim(),
            link: ''
        }
    }
}