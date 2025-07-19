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

const HomePage = ({ articles, bannerUrl }) => {
    const featuredArticle = articles[0];
    const secondaryArticles = articles.slice(1, 3);
    const moreArticles = articles.slice(3);

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
            
            {(!articles || articles.length === 0) ? (
                <div className="text-center py-10 text-white">Nenhum artigo publicado ainda.</div>
            ) : (
                <div className="container mx-auto px-6 py-8">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {featuredArticle && (
                            <div className="lg:col-span-2">
                                <div className="cursor-pointer group" onClick={() => window.open(featuredArticle.link, '_blank')}>
                                    {featuredArticle.coverImage && <img src={featuredArticle.coverImage} alt="" className="w-full h-auto object-cover mb-4"/>}
                                    <p className="text-green-500 font-bold text-sm uppercase">{featuredArticle.categories?.[0]}</p>
                                    <h1 className="text-3xl md:text-5xl font-extrabold text-white my-2 group-hover:text-green-400 transition-colors">{featuredArticle.title}</h1>
                                    <p className="text-gray-500 text-sm mt-2">Por {featuredArticle.author}</p>
                                </div>
                            </div>
                        )}
                        <div className="space-y-8">
                            {secondaryArticles.map(article => (
                                 <div key={article.guid} className="cursor-pointer group" onClick={() => window.open(article.link, '_blank')}>
                                     {article.coverImage && <img src={article.coverImage} alt="" className="w-full h-40 object-cover mb-2"/>}
                                     <p className="text-green-500 font-bold text-sm uppercase">{article.categories?.[0]}</p>
                                     <h2 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors">{article.title}</h2>
                                     <p className="text-gray-500 text-sm mt-1">Por {article.author}</p>
                                 </div>
                            ))}
                        </div>
                    </div>
                    <ArticlesSection title="Mais Artigos" articles={moreArticles} />
                </div>
            )}
        </>
    );
};

const ArticlesPage = ({ articles }) => {
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
        {article.coverImage && <img src={article.coverImage} alt={`Capa do artigo ${article.title}`} className="w-full h-48 object-cover"/>}
        <div className="p-1 pt-3 flex flex-col flex-grow">
            <p className="text-green-500 font-bold text-xs uppercase">{article.categories?.[0]}</p>
            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-green-400 transition-colors">{article.title}</h3>
            <p className="text-gray-500 text-sm mt-auto">Por {article.author}</p>
        </div>
    </div>
);

const EpisodesPage = ({ onPlay }) => {
    const [episodes, setEpisodes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedEpisodeId, setSelectedEpisodeId] = useState(null);

    useEffect(() => {
        const fetchEpisodes = async () => {
            try {
                const response = await fetch('/.netlify/functions/spotify');
                const data = await response.json();

                if (data.error) throw new Error(data.error);
                if (!response.ok) throw new Error('A resposta da rede não foi OK.');
                
                setEpisodes(data);
                if (data.length > 0) {
                    setSelectedEpisodeId(data[0].id); // Abre o primeiro episódio por defeito
                }
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
                        <div key={ep.id} className="bg-gray-900 p-4 rounded-lg border border-gray-800">
                            <div 
                                className="flex items-center gap-4 cursor-pointer"
                                onClick={() => onPlay({ title: ep.name, audioSrc: ep.audio_preview_url })}
                            >
                                <img src={ep.images[2]?.url || ep.images[0]?.url} alt={ep.name} className="w-16 h-16 rounded-md flex-shrink-0" />
                                <div>
                                    <h4 className="font-bold text-white">{ep.name}</h4>
                                    <p className="text-sm text-gray-500">{new Date(ep.release_date).toLocaleDateString('pt-BR')}</p>
                                </div>
                            </div>
                        </div>
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
    // ... (código do GlossaryManager)
};

const TeamManager = ({ teamMembers, fetchTeamMembers }) => {
    // ... (código do TeamManager)
};


// --- COMPONENTE PRINCIPAL ---

export default function App() {
    const [page, setPage] = useState({ name: 'home', data: null });
    const [userProfile, setUserProfile] = useState(null);
    const [glossaryTerms, setGlossaryTerms] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
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
