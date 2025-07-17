import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * A custom hook to easily access the authentication context.
 * @returns {object} The authentication context value (user, loading, signOut).
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
