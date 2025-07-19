import React, { useState, useEffect, useRef } from 'react';

// Importação do Supabase
import { createClient } from '@supabase/supabase-js';

// --- INÍCIO: CONFIGURAÇÃO SEGURA DO SUPABASE ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
// --- FIM DA CONFIGURAÇÃO ---

const supabase = createClient(supabaseUrl, supabaseKey);

// --- COMPONENTES ---

const Header = ({ user }) => {
    const [query, setQuery] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (query.trim()) {
            window.location.hash = `#/search/${query.trim()}`;
            setQuery('');
        }
    };

    return (
        <header className="bg-black border-b-2 border-green-500">
            <nav className="container mx-auto px-6 py-4 flex justify-between items-center gap-4">
                <a href="#/" className="text-2xl font-black text-white tracking-tighter">Variola Virulenta</a>
                <div className="hidden lg:flex items-center space-x-6">
                    <a href="#/" className="text-gray-300 hover:text-white font-medium">Início</a>
                    <a href="#/articles" className="text-gray-300 hover:text-white font-medium">Artigos</a>
                    <a href="#/episodes" className="text-gray-300 hover:text-white font-medium">Episódios</a>
                    <a href="#/glossary" className="text-gray-300 hover:text-white font-medium">Glossário</a>
                    <a href="#/team" className="text-gray-300 hover:text-white font-medium">Quem Somos</a>
                </div>
                <div className="flex items-center gap-4">
                    <form onSubmit={handleSearch} className="relative hidden md:block">
                        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar..." className="bg-gray-800 border border-gray-700 text-white rounded-md py-1 px-3 w-40 md:w-48 focus:ring-2 focus:ring-green-500 focus:outline-none text-sm" />
                    </form>
                    {user ? (
                        <a href="#/dashboard" className="bg-green-500 text-black py-1 px-3 rounded-md font-bold hover:bg-green-400 transition-colors text-sm whitespace-nowrap">Painel</a>
                    ) : (
                        <a href="#/login" className="border border-gray-600 text-gray-300 py-1 px-3 rounded-md font-bold hover:bg-green-500 hover:text-black transition-colors text-sm whitespace-nowrap">Login</a>
                    )}
                </div>
            </nav>
        </header>
    );
};

const Footer = () => (
    <footer className="bg-black text-gray-500 pb-24 pt-8">
        <div className="container mx-auto px-6 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Variola Virulenta. Conteúdo crítico para tempos urgentes.</p>
        </div>
    </footer>
);

const SupportBanner = () => (
    <div className="bg-green-500 text-black p-2 fixed bottom-0 left-0 w-full z-40 text-center font-bold text-sm">
        <a href="https://apoia.se/variolavirulenta" target="_blank" rel="noopener noreferrer" className="hover:underline">
            Gostou do nosso trabalho? Apoie-nos no Apoia.se e ajude a manter o jornalismo independente.
        </a>
    </div>
);

const PersistentAudioPlayer = ({ track, isPlaying, onPlayPause, onEnded }) => {
    const audioRef = useRef(null);

    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.play().catch(e => console.error("Erro ao tocar áudio:", e));
            } else {
                audioRef.current.pause();
            }
        }
    }, [isPlaying, track]);
    
    if (!track) return null;

    return (
        <div className="fixed bottom-10 left-0 w-full bg-black border-t-2 border-green-500 z-50 p-2 shadow-lg">
            <div className="container mx-auto flex items-center justify-between text-white">
                <div className="flex items-center">
                    <button onClick={onPlayPause} className="text-green-500 text-4xl mr-4">
                        {isPlaying ? '❚❚' : '►'}
                    </button>
                    <div>
                        <p className="font-bold">{track.title}</p>
                        <p className="text-sm text-gray-400">Variola Virulenta</p>
                    </div>
                </div>
                <audio ref={audioRef} src={track.audioSrc} onEnded={onEnded} className="hidden"></audio>
            </div>
        </div>
    );
};


// --- PÁGINAS ---

const HomePage = () => {
    const [articles, setArticles] = useState([]);
    const [latestEpisode, setLatestEpisode] = useState(null);
    const [bannerUrl, setBannerUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHomePageData = async () => {
            setIsLoading(true);
            setError(null);
            
            try {
                const articlesPromise = fetch('/.netlify/functions/medium-feed').then(res => res.json());
                const spotifyPromise = fetch('/.netlify/functions/spotify').then(res => res.json());
                const bannerPromise = supabase.from('site_settings').select('value').eq('key', 'main_banner_url').single();

                const [articlesResult, spotifyResult, bannerResult] = await Promise.all([articlesPromise, spotifyPromise, bannerPromise]);
                
                if (Array.isArray(articlesResult)) {
                    setArticles(articlesResult);
                } else {
                    throw new Error(articlesResult.error || "Formato de artigos inesperado do Medium.");
                }

                if (Array.isArray(spotifyResult) && spotifyResult.length > 0) {
                    setLatestEpisode(spotifyResult[0]);
                } else {
                     console.error("Erro ao buscar episódios do Spotify:", spotifyResult.error || "Formato inesperado");
                }
                
                if (bannerResult.error) console.error('Erro ao buscar banner:', bannerResult.error); else setBannerUrl(bannerResult.data?.value || '/images/variola_banner.jpg.jpg');

            } catch (err) {
                console.error("Falha ao carregar dados da página inicial:", err);
                setError(`Não foi possível carregar o conteúdo. Verifique as configurações das funções do Netlify. Detalhes: ${err.message}`);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHomePageData();
    }, []);

    if (isLoading) {
        return <div className="text-center py-10 text-white">Carregando...</div>;
    }

    if (error) {
        return <div className="container mx-auto px-6 py-10 text-center text-red-400 bg-red-900/50 rounded-lg">{error}</div>;
    }
    
    const featuredArticle = articles[0];
    const moreArticles = articles.slice(1, 5);

    return (
        <>
            <section className="bg-black text-white text-center pt-8">
                <div className="container mx-auto px-6">
                    <img 
                        src={bannerUrl} 
                        alt="Banner do Podcast Variola Virulenta" 
                        className="w-full h-auto object-cover"
                    />
                </div>
            </section>
            <section className="bg-black text-white text-center py-12">
                 <div className="container mx-auto px-6">
                    <h1 className="text-5xl font-extrabold mb-4 text-green-400 tracking-tight">Pensamento Crítico para Transformar a Realidade</h1>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto">Debates sobre política, economia e história para além do senso comum.</p>
                </div>
            </section>
            
            <div className="container mx-auto px-6 py-8 grid lg:grid-cols-2 gap-12">
                {latestEpisode && (
                    <div className="bg-gray-900 p-8 rounded-lg border border-gray-800">
                        <h2 className="text-green-500 font-bold uppercase mb-4">Último Episódio</h2>
                        <div className="flex flex-col gap-4">
                            <h3 className="text-3xl font-bold text-white">{latestEpisode.name}</h3>
                            <iframe
                                style={{ borderRadius: '12px' }}
                                src={`https://open.spotify.com/embed/episode/${latestEpisode.id}?utm_source=generator&theme=0`}
                                width="100%"
                                height="152"
                                frameBorder="0"
                                allowFullScreen=""
                                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                loading="lazy"
                            ></iframe>
                        </div>
                    </div>
                )}

                {featuredArticle && (
                    <div className="bg-gray-900 p-8 rounded-lg border border-gray-800 cursor-pointer group" onClick={() => window.open(featuredArticle.link, '_blank')}>
                        <h2 className="text-green-500 font-bold uppercase mb-4">Último Artigo</h2>
                        {featuredArticle.thumbnail && <img src={featuredArticle.thumbnail} alt="" className="w-full h-48 object-cover mb-4"/>}
                        <h3 className="text-3xl font-bold text-white my-2 group-hover:text-green-400 transition-colors">{featuredArticle.title}</h3>
                        <p className="text-gray-500 text-sm mt-2">Por {featuredArticle.author}</p>
                    </div>
                )}
            </div>

            <ArticlesSection title="Mais Artigos" articles={moreArticles} />
        </>
    );
};

const ArticlesPage = () => {
    const [articles, setArticles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAllArticles = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/.netlify/functions/medium-feed');
                const data = await response.json();
                if (data.error) throw new Error(data.error);
                setArticles(data);
            } catch (err) {
                setError(`Não foi possível carregar os artigos. Verifique a sua URL do feed RSS no ficheiro da função 'medium-feed.js'. Detalhes: ${err.message}`);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllArticles();
    }, []);

    if (isLoading) {
        return <div className="text-center py-10 text-white">Carregando artigos...</div>;
    }

    if (error) {
        return <div className="container mx-auto px-6 py-20 text-center text-red-400 bg-red-900/50 rounded-lg">{error}</div>;
    }
    
    return <ArticlesSection title="Todos os Artigos" articles={articles} />;
};

const ArticlesSection = ({ title, articles }) => (
    <section className="py-16">
        <div className="container mx-auto px-6">
            <h2 className="text-2xl font-extrabold text-white mb-6 border-b-2 border-gray-800 pb-2">{title}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map(article => (
                    <ArticleCard key={article.guid} article={article} />
                ))}
            </div>
        </div>
    </section>
);

const ArticleCard = ({ article }) => (
    <div className="bg-black flex flex-col overflow-hidden cursor-pointer group" onClick={() => window.open(article.link, '_blank')}>
        {article.thumbnail && <img src={article.thumbnail} alt={`Capa do artigo ${article.title}`} className="w-full h-48 object-cover"/>}
        <div className="p-1 pt-3 flex flex-col flex-grow">
            <p className="text-green-500 font-bold text-xs uppercase">{article.categories?.[0]}</p>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-green-400 transition-colors">{article.title}</h3>
            <p className="text-gray-500 text-sm mt-auto">Por {article.author}</p>
        </div>
    </div>
);

const EpisodesPage = () => {
    const [episodes, setEpisodes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEpisodes = async () => {
            try {
                const response = await fetch('/.netlify/functions/spotify');
                const data = await response.json();

                if (data.error) throw new Error(data.error);
                if (!response.ok) throw new Error('A resposta da rede não foi OK.');
                
                setEpisodes(data);
            } catch (err) {
                setError(`Não foi possível carregar os episódios. Verifique se o ID do Podcast está correto no ficheiro da função e se as variáveis de ambiente no Netlify estão configuradas. Detalhes: ${err.message}`);
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
                                        allowFullScreen=""
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

const GlossaryPage = ({ glossaryTerms }) => {
    return (
        <div className="bg-black py-12">
            <div className="container mx-auto px-6 max-w-4xl">
                <h1 className="text-4xl font-extrabold text-white mb-10 border-b-2 border-gray-800 pb-4">Glossário de Termos</h1>
                <div className="space-y-6">
                    {glossaryTerms.map(item => (
                        <div key={item.id} className="bg-gray-900 p-6 rounded-lg border border-gray-800">
                            <h3 className="text-2xl font-bold text-white">{item.term}</h3>
                            <p className="text-gray-400 mt-2 leading-relaxed font-serif">{item.definition}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const TeamPage = ({ teamMembers }) => {
    return (
        <div className="bg-black py-12">
            <div className="container mx-auto px-6">
                <h1 className="text-4xl font-extrabold text-white mb-10 border-b-2 border-gray-800 pb-4">Quem Somos</h1>
                <div className="grid md:grid-cols-3 gap-10 text-center">
                    {teamMembers.map(member => (
                        <div key={member.id} className="p-6">
                            <img src={member.photo} alt={member.name} className="w-32 h-32 rounded-full mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white">{member.name}</h3>
                            <p className="text-gray-400 mb-4">{member.role}</p>
                            <a href={`#/bio/${member.id}`} className="font-bold text-green-500 hover:underline">
                                Conheça +
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const BioPage = ({ memberId }) => {
    const [member, setMember] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMember = async () => {
            setIsLoading(true);
            const { data, error } = await supabase.from('team_members').select('*').eq('id', memberId).single();
            if (error) console.error('Erro ao buscar membro:', error); else setMember(data);
            setIsLoading(false);
        };
        fetchMember();
    }, [memberId]);

    if (isLoading) {
        return <div className="text-center py-10 text-white">Carregando...</div>;
    }
    if (!member) {
        return <div className="text-center py-20 text-white">Membro não encontrado.</div>;
    }

    return (
        <div className="bg-black py-12 min-h-[70vh]">
            <div className="container mx-auto px-6 max-w-4xl">
                <a href="#/team" className="text-green-500 font-bold hover:underline mb-8">&larr; Voltar para a equipe</a>
                <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
                    <img src={member.photo} alt={member.name} className="w-48 h-48 rounded-full flex-shrink-0" />
                    <div>
                        <h1 className="text-4xl font-extrabold text-white">{member.name}</h1>
                        <p className="text-xl text-gray-400 font-semibold mb-4">{member.role}</p>
                        <p className="text-gray-300 leading-relaxed font-serif">{member.bio}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            window.location.hash = '#/dashboard';
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center py-12 px-4 bg-black min-h-[70vh]">
            <div className="w-full max-w-md bg-gray-900 p-8 rounded-lg shadow-lg border border-gray-800">
                <h2 className="text-2xl font-bold text-center text-white mb-6">Área de Membros</h2>
                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label className="block text-gray-300 mb-2">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" required />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-300 mb-2">Senha</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" required />
                    </div>
                    {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                    <button type="submit" disabled={isLoading} className="w-full bg-green-500 text-black font-bold py-2 rounded-md hover:bg-green-400 disabled:bg-gray-500">
                        {isLoading ? 'A entrar...' : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const DashboardPage = ({ user, glossaryTerms, fetchGlossary, teamMembers, fetchTeamMembers }) => {
    const [currentView, setCurrentView] = useState('team');
    
    const handleLogout = async () => {
        await supabase.auth.signOut();
    };
    
    return (
        <div className="bg-black text-white py-12 min-h-[80vh]">
            <div className="container mx-auto px-6">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-extrabold">Painel de Controle</h1>
                    <button onClick={handleLogout} className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 font-bold">Sair</button>
                </div>
                <div className="flex gap-4 border-b-2 border-gray-800 mb-8">
                    {(user.role === 'super_admin' || user.role === 'admin') && (
                        <>
                            <button onClick={() => setCurrentView('team')} className={`py-2 px-4 font-bold ${currentView === 'team' ? 'border-b-2 border-green-500 text-white' : 'text-gray-500'}`}>Gerenciar Equipe</button>
                            <button onClick={() => setCurrentView('glossary')} className={`py-2 px-4 font-bold ${currentView === 'glossary' ? 'border-b-2 border-green-500 text-white' : 'text-gray-500'}`}>Gerenciar Glossário</button>
                        </>
                    )}
                </div>
                
                {currentView === 'team' && <TeamManager teamMembers={teamMembers} fetchTeamMembers={fetchTeamMembers} />}
                {currentView === 'glossary' && <GlossaryManager glossaryTerms={glossaryTerms} fetchGlossary={fetchGlossary} />}
            </div>
        </div>
    );
};

const GlossaryManager = ({ glossaryTerms, fetchGlossary }) => {
    const [editingTerm, setEditingTerm] = useState(null);
    const [formState, setFormState] = useState({ term: '', definition: '' });
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (editingTerm) {
            setFormState({ term: editingTerm.term, definition: editingTerm.definition });
        } else {
            setFormState({ term: '', definition: '' });
        }
    }, [editingTerm]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormState(prevState => ({ ...prevState, [name]: value }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!formState.term || !formState.definition) {
            setMessage('Termo e definição são obrigatórios.');
            return;
        }

        if (editingTerm) {
            const { error } = await supabase.from('glossary').update(formState).eq('id', editingTerm.id);
            if (error) setMessage(`Erro: ${error.message}`); else setMessage('Termo atualizado!');
        } else {
            const { error } = await supabase.from('glossary').insert(formState);
            if (error) setMessage(`Erro: ${error.message}`); else setMessage('Termo adicionado!');
        }

        await fetchGlossary();
        setEditingTerm(null);
        setTimeout(() => setMessage(''), 3000);
    };

    const handleDelete = async (termId) => {
        if (window.confirm('Tem certeza?')) {
            await supabase.from('glossary').delete().eq('id', termId);
            await fetchGlossary();
        }
    };

    return (
        <>
            <div className="bg-gray-900 p-8 rounded-lg border border-gray-800 mb-12">
                <h2 className="text-2xl font-bold mb-6">{editingTerm ? 'Editando Termo' : 'Adicionar Novo Termo'}</h2>
                <form onSubmit={handleFormSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-300 mb-2">Termo</label>
                        <input name="term" value={formState.term} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md" />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-300 mb-2">Definição</label>
                        <textarea name="definition" value={formState.definition} onChange={handleFormChange} rows="5" className="w-full p-3 border border-gray-700 bg-gray-800 text-white rounded-md"></textarea>
                    </div>
                    {message && <p className="text-green-500 text-center my-4">{message}</p>}
                    <div className="flex items-center gap-4">
                        <button type="submit" className="bg-green-500 text-black font-bold py-2 px-6 rounded-md">{editingTerm ? 'Atualizar' : 'Adicionar'}</button>
                        {editingTerm && <button type="button" onClick={() => setEditingTerm(null)} className="bg-gray-600 text-white font-bold py-2 px-6 rounded-md">Cancelar</button>}
                    </div>
                </form>
            </div>
            <div className="bg-gray-900 p-8 rounded-lg border border-gray-800">
                <h2 className="text-2xl font-bold mb-6">Termos do Glossário</h2>
                <div className="space-y-4">
                    {glossaryTerms.map(term => (
                        <div key={term.id} className="flex justify-between items-center bg-black p-4 rounded-md border border-gray-700">
                            <p className="text-white font-bold">{term.term}</p>
                            <div className="flex gap-2">
                                <button onClick={() => setEditingTerm(term)} className="bg-blue-600 text-white text-xs font-bold py-1 px-3 rounded-md">Editar</button>
                                <button onClick={() => handleDelete(term.id)} className="bg-red-600 text-white text-xs font-bold py-1 px-3 rounded-md">Excluir</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

const TeamManager = ({ teamMembers, fetchTeamMembers }) => {
    const [editingMember, setEditingMember] = useState(null);
    const [formState, setFormState] = useState({ name: '', role: '', photo: '', bio: '', display_order: 99 });
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (editingMember) {
            setFormState(editingMember);
        } else {
            setFormState({ name: '', role: '', photo: '', bio: '', display_order: 99 });
        }
    }, [editingMember]);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormState(prevState => ({ ...prevState, [name]: value }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!formState.name || !formState.role) {
            setMessage('Nome e função são obrigatórios.');
            return;
        }

        if (editingMember) {
            const { error } = await supabase.from('team_members').update(formState).eq('id', editingMember.id);
            if (error) setMessage(`Erro: ${error.message}`); else setMessage('Membro atualizado!');
        } else {
            const { error } = await supabase.from('team_members').insert(formState);
            if (error) setMessage(`Erro: ${error.message}`); else setMessage('Membro adicionado!');
        }

        await fetchTeamMembers();
        setEditingMember(null);
        setTimeout(() => setMessage(''), 3000);
    };

    const handleDelete = async (memberId) => {
        if (window.confirm('Tem certeza?')) {
            await supabase.from('team_members').delete().eq('id', memberId);
            await fetchTeamMembers();
        }
    };

    return (
        <>
            <div className="bg-gray-900 p-8 rounded-lg border border-gray-800 mb-12">
                <h2 className="text-2xl font-bold mb-6">{editingMember ? 'Editando Membro da Equipe' : 'Adicionar Novo Membro'}</h2>
                <form onSubmit={handleFormSubmit}>
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-gray-300 mb-2">Nome</label>
                            <input name="name" value={formState.name} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md" />
                        </div>
                        <div>
                            <label className="block text-gray-300 mb-2">Função</label>
                            <input name="role" value={formState.role} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md" />
                        </div>
                        <div>
                            <label className="block text-gray-300 mb-2">URL da Foto</label>
                            <input name="photo" value={formState.photo} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md" />
                        </div>
                         <div>
                            <label className="block text-gray-300 mb-2">Ordem de Exibição</label>
                            <input type="number" name="display_order" value={formState.display_order} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md" />
                        </div>
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-300 mb-2">Biografia</label>
                        <textarea name="bio" value={formState.bio} onChange={handleFormChange} rows="5" className="w-full p-3 border border-gray-700 bg-gray-800 text-white rounded-md"></textarea>
                    </div>
                    {message && <p className="text-green-500 text-center my-4">{message}</p>}
                    <div className="flex items-center gap-4">
                        <button type="submit" className="bg-green-500 text-black font-bold py-2 px-6 rounded-md">{editingMember ? 'Atualizar' : 'Adicionar'}</button>
                        {editingMember && <button type="button" onClick={() => setEditingMember(null)} className="bg-gray-600 text-white font-bold py-2 px-6 rounded-md">Cancelar</button>}
                    </div>
                </form>
            </div>
            <div className="bg-gray-900 p-8 rounded-lg border border-gray-800">
                <h2 className="text-2xl font-bold mb-6">Membros da Equipe</h2>
                <div className="space-y-4">
                    {teamMembers.map(member => (
                        <div key={member.id} className="flex justify-between items-center bg-black p-4 rounded-md border border-gray-700">
                            <p className="text-white font-bold">{member.name}</p>
                            <div className="flex gap-2">
                                <button onClick={() => setEditingMember(member)} className="bg-blue-600 text-white text-xs font-bold py-1 px-3 rounded-md">Editar</button>
                                <button onClick={() => handleDelete(member.id)} className="bg-red-600 text-white text-xs font-bold py-1 px-3 rounded-md">Excluir</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

const UserManager = ({ user }) => {
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('writer');

    const handleInvite = async (e) => {
        e.preventDefault();
        setMessage('Funcionalidade de convite não implementada no cliente por segurança. Use uma Edge Function.');
    };
    
    return (
        <div className="bg-gray-900 p-8 rounded-lg border border-gray-800">
            <h2 className="text-2xl font-bold mb-6">Criar Novo Usuário</h2>
            <p className="text-sm text-yellow-400 mb-4 bg-yellow-900/50 p-3 rounded-md">
                <strong>Aviso de Segurança:</strong> A criação e exclusão de usuários não deve ser feita diretamente do navegador. Para um site em produção, esta lógica deve ser movida para uma <a href="https://supabase.com/docs/guides/functions" target="_blank" rel="noopener noreferrer" className="underline">Supabase Edge Function</a> para proteger suas chaves de administrador.
            </p>
            <form onSubmit={handleInvite}>
                <div className="grid md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-gray-300 mb-2">E-mail do Novo Usuário</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md" required />
                    </div>
                    <div>
                        <label className="block text-gray-300 mb-2">Senha Temporária</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md" required />
                    </div>
                    <div>
                        <label className="block text-gray-300 mb-2">Nível de Permissão</label>
                        <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md">
                            {user.role === 'super_admin' && <option value="admin">Admin</option>}
                            <option value="writer">Writer</option>
                        </select>
                    </div>
                </div>
                {message && <p className="text-green-500 text-center my-4">{message}</p>}
                <div className="mt-6">
                    <button type="submit" className="bg-green-500 text-black font-bold py-2 px-6 rounded-md">Convidar Usuário</button>
                </div>
            </form>
        </div>
    );
};


// --- COMPONENTE PRINCIPAL ---

export default function App() {
    const [page, setPage] = useState({ name: 'home', data: null });
    const [userProfile, setUserProfile] = useState(null);
    const [articles, setArticles] = useState([]);
    const [glossaryTerms, setGlossaryTerms] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [bannerUrl, setBannerUrl] = useState('');
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const fetchAllData = async () => {
        const glossaryPromise = supabase.from('glossary').select('*').order('term', { ascending: true });
        const teamPromise = supabase.from('team_members').select('*').order('display_order', { ascending: true });

        const [glossaryResult, teamResult] = await Promise.all([glossaryPromise, teamPromise]);
        
        if(glossaryResult.error) console.error('Erro ao buscar glossário:', glossaryResult.error); else setGlossaryTerms(glossaryResult.data);
        if(teamResult.error) console.error('Erro ao buscar membros da equipe:', teamResult.error); else setTeamMembers(teamResult.data);
    };

    useEffect(() => {
        const initializeApp = async () => {
            setIsLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const { data: profile, error: profileError } = await supabase.from('profiles').select('role, full_name').eq('id', session.user.id).single();
                if (profile) {
                    setUserProfile({ ...session.user, role: profile.role, full_name: profile.full_name });
                } else {
                    console.error("Perfil não encontrado para o usuário, atribuindo papel padrão 'writer'.", profileError);
                    setUserProfile({ ...session.user, role: 'writer', full_name: session.user.email });
                }
            }
            await fetchAllData();
            setIsLoading(false);
        };
        
        initializeApp();

        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                const user = session?.user ?? null;
                if (user) {
                    const { data: profile, error: profileError } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).single();
                    if (profile) {
                        setUserProfile({ ...user, role: profile.role, full_name: profile.full_name });
                    } else {
                        console.error("Perfil não encontrado para o usuário:", user.id, profileError);
                        setUserProfile({ ...user, role: 'writer', full_name: user.email });
                    }
                } else {
                    setUserProfile(null);
                }
                if (event === 'SIGNED_OUT') {
                    window.location.hash = '#/';
                }
            }
        );

        const handleHashChange = () => {
            const hash = window.location.hash.replace(/^#\/?|\/$/g, '').split('/');
            const pageName = hash[0] || 'home';
            const pageData = hash[1] || null;
            setPage({ name: pageName, data: pageData });
        };

        window.addEventListener('hashchange', handleHashChange);
        handleHashChange(); // Initial load

        return () => {
            authListener.subscription.unsubscribe();
            window.removeEventListener('hashchange', handleHashChange);
        };
    }, []);


    const handlePlay = (track) => {
        setCurrentTrack(track);
        setIsPlaying(true);
    };

    const handlePlayPause = () => {
        if (currentTrack) {
            setIsPlaying(!isPlaying);
        }
    };
    
    const handleSearch = (query) => {
        window.location.hash = `#/search/${query}`;
    };

    const renderPage = () => {
        if (isLoading) {
            return <div className="bg-black text-white h-screen flex items-center justify-center">Carregando...</div>;
        }
        
        switch (page.name) {
            case 'home': return <HomePage />;
            case 'articles': return <ArticlesPage />;
            case 'episodes': return <EpisodesPage onPlay={handlePlay} />;
            case 'glossary': return <GlossaryPage glossaryTerms={glossaryTerms} />;
            case 'team': return <TeamPage teamMembers={teamMembers} />;
            case 'bio': return <BioPage memberId={page.data} />;
            case 'tag': return <TagPage tag={page.data} />;
            case 'search': return <SearchPage query={page.data} />;
            case 'login': return <LoginPage />;
            case 'dashboard': return userProfile ? <DashboardPage user={userProfile} glossaryTerms={glossaryTerms} fetchGlossary={fetchAllData} teamMembers={teamMembers} fetchTeamMembers={fetchAllData} /> : <LoginPage />;
            default: return <HomePage />;
        }
    };

    return (
        <div className="bg-black min-h-screen font-sans">
            <Header onSearch={handleSearch} user={userProfile} />
            <main className="pb-12">
                {renderPage()}
            </main>
            <PersistentAudioPlayer track={currentTrack} isPlaying={isPlaying} onPlayPause={handlePlayPause} onEnded={() => setIsPlaying(false)} />
            <SupportBanner />
            <Footer />
        </div>
    );
}
