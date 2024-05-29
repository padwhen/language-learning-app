export const hasToken = (): boolean => {
    const cookieString = document.cookie;
    const cookies = cookieString.split(';').map(cookie => cookie.trim());
    for (const cookie of cookies) {
        if (cookie.startsWith('token=')) {
            const tokenValue = cookie.substring('token='.length);
            return tokenValue !== '';
        }
    }
    return false;
};
