import React, { createContext, useState } from 'react';

export const PlayerContext = createContext(null);

/**
 * Provides a global state for the audio player, allowing any component
 * to control the currently playing track.
 */
export const PlayerProvider = ({ children }) => {
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const playTrack = (track) => {
        setCurrentTrack(track);
        setIsPlaying(true);
    };

    const playPause = () => {
        if (currentTrack) {
            setIsPlaying(!isPlaying);
        }
    };

    const onTrackEnd = () => {
        setIsPlaying(false);
        // Optional: could add logic to play the next track in a playlist
    };

    const value = {
        currentTrack,
        isPlaying,
        playTrack,
        playPause,
        onTrackEnd,
    };

    return (
        <PlayerContext.Provider value={value}>
            {children}
        </PlayerContext.Provider>
    );
};
