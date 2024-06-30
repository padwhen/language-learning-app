export const parseImportData = (data: string, termSep: string, cardSep: string) => {
    const cardSeparator = cardSep === 'newline' ? '\n' : ';'
    const termSeparator = termSep === 'tab' ? '\t' : ','

    return data.split(cardSeparator)
        .map(card => card.trim().split(termSeparator))
        .filter(card => card.length === 2)
        .map(([term, definition]) => ({ term: term.trim(), definition: definition.trim()}))
}

