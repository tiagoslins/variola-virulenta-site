import React, { useState, useEffect } from 'react';

const EpisodesPage = () => {
    const [episodes, setEpisodes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEpisodes = async () => {
            try {
                // This assumes you have a Netlify/Vercel function at this endpoint
                const response = await fetch('/.netlify/functions/spotify');
                if (!response.ok) throw new Error(`A resposta da rede não foi OK (${response.status}).`);
                
                const data = await response.json();
                if (data.error) throw new Error(data.error);
                
                setEpisodes(data);
            } catch (err) {
                setError(`Não foi possível carregar os episódios. Verifique a função do servidor. Detalhes: ${err.message}`);
            } finally {
                setIsLoading(false);
            }
        };
        fetchEpisodes();
    }, []);

    if (isLoading) {
        return <div className="text-center py-20 text-white">A carregar episódios do Spotify...</div>;
    }

    if (error) {
        return <div className="container mx-auto px-6 py-20 text-center text-red-400 bg-red-900/50 rounded-lg">{error}</div>;
    }

    const featuredEpisode = episodes[0];
    const episodeList = episodes.slice(1);

    return (
        <div className="bg-black py-12">
            <div className="container mx-auto px-6">
                <h1 className="text-4xl font-extrabold text-white mb-10 border-b-2 border-gray-800 pb-4">Episódios</h1>
                
                {featuredEpisode && (
                    <div className="mb-12 bg-gray-900 p-8 rounded-lg border border-gray-800">
                        <h2 className="text-green-500 font-bold uppercase mb-4">Último Lançamento</h2>
                        <div className="flex flex-col md:flex-row gap-8">
                            <img src={featuredEpisode.images[0]?.url} alt={featuredEpisode.name} className="w-full md:w-1/3 h-auto object-cover rounded-md" />
                            <div className="flex flex-col flex-grow">
                                <h3 className="text-3xl font-bold text-white mb-4">{featuredEpisode.name}</h3>
                                <div className="mt-auto">
                                    <iframe
                                        style={{ borderRadius: '12px' }}
                                        src={`https://open.spotify.com/embed/episode/${featuredEpisode.id}?utm_source=generator&theme=0`}
                                        width="100%"
                                        height="152"
                                        frameBorder="0"
                                        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                        loading="lazy"
                                    ></iframe>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <h2 className="text-2xl font-extrabold text-white mb-6 border-b-2 border-gray-800 pb-2">Anteriores</h2>
                <div className="space-y-4 max-w-4xl mx-auto">
                    {episodeList.map(ep => (
                        <a 
                            key={ep.id} 
                            href={ep.external_urls.spotify} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-gray-900 p-4 rounded-lg border border-gray-800 flex items-center gap-4 hover:border-green-500 transition-colors"
                        >
                            <img src={ep.images[2]?.url || ep.images[0]?.url} alt={ep.name} className="w-16 h-16 rounded-md flex-shrink-0" />
                            <div>
                                <h4 className="font-bold text-white">{ep.name}</h4>
                                <p className="text-sm text-gray-500">{new Date(ep.release_date).toLocaleDateString('pt-BR')}</p>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default EpisodesPage;
