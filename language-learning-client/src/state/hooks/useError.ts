import { useState } from "react";

export const useError = () => {
    const [error, setError] = useState('')
    
    const handleError = (message: any) => {
        setError(message)
        setTimeout(() => {
            setError('')
        }, 5000)
    }
    return { error, handleError }
}