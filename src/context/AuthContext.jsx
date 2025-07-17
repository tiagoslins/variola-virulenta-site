import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../api/supabase';

export const AuthContext = createContext(null);

/**
 * Provides authentication state (user, loading) to its children components.
 * It handles session fetching and listens for authentication state changes.
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', session.user.id).single();
                setUser({ ...session.user, ...profile });
            }
            setLoading(false);
        };

        fetchUserSession();

        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                const currentUser = session?.user;
                if (currentUser) {
                    const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', currentUser.id).single();
                    setUser({ ...currentUser, ...profile });
                } else {
                    setUser(null);
                }
                setLoading(false);
            }
        );

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const value = {
        user,
        loading,
        signOut: () => supabase.auth.signOut(),
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
