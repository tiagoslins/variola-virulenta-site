import React, { useRef, useEffect } from 'react';
import { usePlayer } from '../hooks/usePlayer'; // Assumes usePlayer hook exists in src/hooks/

/**
 * A persistent audio player that is controlled by a global context.
 * @returns {JSX.Element|null} The rendered PersistentAudioPlayer or null if no track is active.
 */
const PersistentAudioPlayer = () => {
    const { currentTrack, isPlaying, playPause, onTrackEnd } = usePlayer();
    const audioRef = useRef(null);

    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.play().catch(e => console.error("Erro ao tocar áudio:", e));
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying, currentTrack]);

    if (!currentTrack) {
        return null;
    }

    return (
        <div className="fixed bottom-10 left-0 w-full bg-black border-t-2 border-green-500 z-40 p-2 shadow-lg">
            <div className="container mx-auto flex items-center justify-between text-white">
                <div className="flex items-center gap-4">
                    <button onClick={playPause} className="text-green-500 text-4xl">
                        {isPlaying ? '❚❚' : '►'}
                    </button>
                    <div>
                        <p className="font-bold">{currentTrack.title}</p>
                        <p className="text-sm text-gray-400">{currentTrack.artist || 'Variola Virulenta'}</p>
                    </div>
                </div>
                <audio 
                    ref={audioRef} 
                    src={currentTrack.audioSrc} 
                    onEnded={onTrackEnd} 
                    className="hidden" 
                    autoPlay={isPlaying}
                />
            </div>
        </div>
    );
};

export default PersistentAudioPlayer;
