import { useContext } from 'react';
import { PlayerContext } from '../context/PlayerContext';

/**
 * A custom hook to easily access the player context.
 * @returns {object} The player context value.
 */
export const usePlayer = () => {
    const context = useContext(PlayerContext);
    if (context === undefined) {
        throw new Error('usePlayer must be used within a PlayerProvider');
    }
    return context;
};
