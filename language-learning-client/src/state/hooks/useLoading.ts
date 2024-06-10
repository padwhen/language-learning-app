import { useState, useEffect } from 'react';

export const useLoading = (delay: number = 10000) => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setLoading(false);
        }, delay);

        return () => clearTimeout(timeout);
    }, [delay]);

    return loading;
};
