export interface XpEvent {
    xpAmount: number;
    eventType: string;
    eventDetails: string | null
    time: string
}

export interface XpHistoryDay {
    date: string;
    totalXp: number;
    events: XpEvent[]
}

export interface XpHistoryResponse {
    xpHistory: XpHistoryDay[]
    totalDays: number
    totalXpInPeriod: number
}

export interface LoginHistoryResponse {
    loginDates: { date: string }[]
    currentMonth: string;
    totalLoginDays: number;
    loginDatesArray: string[]
}