import { useState, useEffect } from "react";
import axios from "axios";
import { LoginHistoryResponse, XpHistoryResponse } from "../SettingsTypes";

export const useSettingsData = (userId?: string) => {
  const [loginHistory, setLoginHistory] = useState<LoginHistoryResponse | null>(null);
  const [xpHistory, setXpHistory] = useState<XpHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const [loginRes, xpRes] = await Promise.all([
          axios.get('/login-history'),
          axios.get('/xp-history')
        ]);
        setLoginHistory(loginRes.data);
        setXpHistory(xpRes.data);
      } catch (err) {
        // Error handling can be expanded as needed
        console.error('Failed to fetch settings data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  return { loginHistory, xpHistory, loading };
}; 