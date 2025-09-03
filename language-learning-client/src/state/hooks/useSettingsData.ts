import { LoginHistoryResponse, XpHistoryResponse } from "@/components/SettingsPage/SettingsTypes"
import { UserContext } from "@/contexts/UserContext"
import axios from "axios";
import { useContext, useEffect, useState } from "react"

export const useSettingsData = () => {
    const { user } = useContext(UserContext)
    const [loginHistory, setLoginHistory] = useState<LoginHistoryResponse | null>(null)
    const [xpHistory, setXpHistory] = useState<XpHistoryResponse | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            if (!user?._id) return;
            setLoading(true)
            try {
                const [loginRes, xpRes] = await Promise.all([
                    axios.get('/login-history'),
                    axios.get('/xp-history')
                ])
                setLoginHistory(loginRes.data)
                setXpHistory(xpRes.data)
            } catch (err) {
                return;
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [user?._id]) // Only depend on user ID, not the entire user object

    return { loginHistory, xpHistory, loading }
}