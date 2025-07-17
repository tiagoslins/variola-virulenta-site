import React, { useState, useEffect, createContext, useContext, useRef, useCallback } from 'react';
import { HashRouter, Routes, Route, Link, NavLink, useNavigate, useParams, useLocation, Outlet } from 'react-router-dom';

// Importação do Supabase
import { createClient } from '@supabase/supabase-js';

// --- INÍCIO: CONFIGURAÇÃO SEGURA DO SUPABASE ---
// NOTA: Estas variáveis devem ser configuradas no seu serviço de hospedagem (Netlify, Vercel, etc.)
// como "Environment Variables". Não as coloque diretamente no código em produção.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
// --- FIM DA CONFIGURAÇÃO ---

export const supabase = createClient(supabaseUrl, supabaseKey);

// ############################################################################
// 1. CONTEXTOS GLOBAIS (Autenticação e Player de Áudio)
// ############################################################################

// --- Contexto de Autenticação ---
const AuthContext = createContext(null);

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

    const value = { user, loading, signOut: () => supabase.auth.signOut() };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// --- Contexto do Player de Áudio ---
const PlayerContext = createContext(null);

export const PlayerProvider = ({ children }) => {
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const playTrack = (track) => {
        setCurrentTrack(track);
        setIsPlaying(true);
    };
    const playPause = () => {
        if (currentTrack) setIsPlaying(!isPlaying);
    };
    const onTrackEnd = () => setIsPlaying(false);

    const value = { currentTrack, isPlaying, playTrack, playPause, onTrackEnd };

    return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};

// ############################################################################
// 2. HOOKS PERSONALIZADOS (para facilitar o acesso aos contextos)
// ############################################################################

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

export const usePlayer = () => {
    const context = useContext(PlayerContext);
    if (context === undefined) throw new Error('usePlayer must be used within a PlayerProvider');
    return context;
};


// ############################################################################
// 3. COMPONENTES REUTILIZÁVEIS
// ############################################################################

// --- Header ---
const Header = () => {
    const { user } = useAuth();
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        const trimmedQuery = query.trim();
        if (trimmedQuery) {
            navigate(`/search/${trimmedQuery}`);
            setQuery('');
        }
    };
    
    const activeLinkStyle = { color: '#48bb78', borderBottom: '2px solid #48bb78' };

    return (
        <header className="bg-black border-b-2 border-green-500 sticky top-0 z-50">
            <nav className="container mx-auto px-6 py-4 flex justify-between items-center gap-4">
                <Link to="/" className="text-2xl font-black text-white tracking-tighter">Variola Virulenta</Link>
                <div className="hidden lg:flex items-center space-x-6">
                    <NavLink to="/" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="text-gray-300 hover:text-white font-medium py-2">Início</NavLink>
                    <NavLink to="/articles" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="text-gray-300 hover:text-white font-medium py-2">Artigos</NavLink>
                    <NavLink to="/episodes" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="text-gray-300 hover:text-white font-medium py-2">Episódios</NavLink>
                    <NavLink to="/glossary" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="text-gray-300 hover:text-white font-medium py-2">Glossário</NavLink>
                    <NavLink to="/team" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="text-gray-300 hover:text-white font-medium py-2">Quem Somos</NavLink>
                </div>
                <div className="flex items-center gap-4">
                    <form onSubmit={handleSearch} className="relative hidden md:block">
                        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar..." className="bg-gray-800 border border-gray-700 text-white rounded-md py-1 px-3 w-40 md:w-48 focus:ring-2 focus:ring-green-500 focus:outline-none text-sm" />
                    </form>
                    {user ? (
                        <Link to="/dashboard" className="bg-green-500 text-black py-1 px-3 rounded-md font-bold hover:bg-green-400 transition-colors text-sm whitespace-nowrap">Painel</Link>
                    ) : (
                        <Link to="/login" className="border border-gray-600 text-gray-300 py-1 px-3 rounded-md font-bold hover:bg-green-500 hover:text-black transition-colors text-sm whitespace-nowrap">Login</Link>
                    )}
                </div>
            </nav>
        </header>
    );
};

// --- Footer ---
const Footer = () => (
    <footer className="bg-black text-gray-500 pb-24 pt-8 border-t-2 border-gray-900">
        <div className="container mx-auto px-6 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Variola Virulenta. Conteúdo crítico para tempos urgentes.</p>
            <p className="mt-1">Horário de Brasília: {new Date().toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</p>
        </div>
    </footer>
);

// --- Support Banner ---
const SupportBanner = () => (
    <div className="bg-green-500 text-black p-2 fixed bottom-0 left-0 w-full z-40 text-center font-bold text-sm">
        <a href="https://apoia.se/variolavirulenta" target="_blank" rel="noopener noreferrer" className="hover:underline">
            Gostou do nosso trabalho? Apoie-nos no Apoia.se e ajude a manter o jornalismo independente.
        </a>
    </div>
);

// --- Persistent Audio Player ---
const PersistentAudioPlayer = () => {
    const { currentTrack, isPlaying, playPause, onTrackEnd } = usePlayer();
    const audioRef = useRef(null);

    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) audioRef.current.play().catch(e => console.error("Erro ao tocar áudio:", e));
            else audioRef.current.pause();
        }
    }, [isPlaying, currentTrack]);

    if (!currentTrack) return null;

    return (
        <div className="fixed bottom-10 left-0 w-full bg-black border-t-2 border-green-500 z-40 p-2 shadow-lg">
            <div className="container mx-auto flex items-center justify-between text-white">
                <div className="flex items-center gap-4">
                    <button onClick={playPause} className="text-green-500 text-4xl">{isPlaying ? '❚❚' : '►'}</button>
                    <div>
                        <p className="font-bold">{currentTrack.title}</p>
                        <p className="text-sm text-gray-400">{currentTrack.artist || 'Variola Virulenta'}</p>
                    </div>
                </div>
                <audio ref={audioRef} src={currentTrack.audioSrc} onEnded={onTrackEnd} className="hidden" autoPlay={isPlaying} />
            </div>
        </div>
    );
};

// --- Article Card ---
const ArticleCard = ({ article }) => {
    const authorName = article.profiles?.full_name || article.author_name || 'Autor Desconhecido';
    return (
        <Link to={`/article/${article.id}`} className="bg-black flex flex-col overflow-hidden group cursor-pointer">
            {article.coverImage && <img src={article.coverImage} alt={`Capa de ${article.title}`} className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105" onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/600x400/1a202c/4a5568?text=Imagem+Indisponível'; }} />}
            <div className="p-1 pt-3 flex flex-col flex-grow">
                {article.tags?.[0] && <p className="text-green-500 font-bold text-xs uppercase">{article.tags[0]}</p>}
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-green-400 transition-colors">{article.title}</h3>
                <p className="text-gray-500 text-sm mt-auto">Por {authorName}</p>
            </div>
        </Link>
    );
};

// --- Modal ---
const Modal = ({ isOpen, onClose, onConfirm, title, children, confirmText = 'Confirmar', cancelText = 'Cancelar' }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-md border border-gray-700" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-white mb-4">{title}</h2>
                <div className="text-gray-300 mb-6">{children}</div>
                <div className="flex justify-end gap-4">
                    <button onClick={onClose} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-500 transition-colors">{cancelText}</button>
                    <button onClick={onConfirm} className="bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-500 transition-colors">{confirmText}</button>
                </div>
            </div>
        </div>
    );
};

// --- Protected Route ---
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) return <div className="text-center py-10 text-white">Verificando autenticação...</div>;
    if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
    return children;
};

// --- Main Layout ---
const MainLayout = () => {
    const location = useLocation();
    useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);
    return (
        <div className="bg-black min-h-screen font-sans flex flex-col">
            <Header />
            <main className="flex-grow"><Outlet /></main>
            <PersistentAudioPlayer />
            <SupportBanner />
            <Footer />
        </div>
    );
};


// ############################################################################
// 4. PÁGINAS DO SITE
// ############################################################################

// --- HomePage ---
const HomePage = () => {
    const [articles, setArticles] = useState([]);
    const [bannerUrl, setBannerUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHomePageData = async () => {
            setIsLoading(true);
            const articlesPromise = supabase.from('articles').select('*, profiles(full_name)').order('createdAt', { ascending: false }).limit(6);
            const bannerPromise = supabase.from('site_settings').select('value').eq('key', 'main_banner_url').single();

            const [articlesResult, bannerResult] = await Promise.all([articlesPromise, bannerPromise]);
            
            if (articlesResult.error) console.error('Erro:', articlesResult.error); else setArticles(articlesResult.data || []);
            if (bannerResult.error) console.error('Erro:', bannerResult.error); else setBannerUrl(bannerResult.data?.value || 'https://placehold.co/1200x400/000000/48bb78?text=Variola+Virulenta');

            setIsLoading(false);
        };
        fetchHomePageData();
    }, []);

    if (isLoading) return <div className="text-center py-10 text-white">Carregando...</div>;
    
    const featuredArticle = articles[0];
    const secondaryArticles = articles.slice(1, 3);
    const moreArticles = articles.slice(3);

    return (
        <>
            <section className="bg-black text-white text-center pt-8"><div className="container mx-auto px-6"><img src={bannerUrl} alt="Banner do Podcast" className="w-full h-auto object-cover" /></div></section>
            <section className="bg-black text-white text-center py-12"><div className="container mx-auto px-6"><h1 className="text-5xl font-extrabold mb-4 text-green-400 tracking-tight">Pensamento Crítico para Transformar a Realidade</h1><p className="text-xl text-gray-300 max-w-3xl mx-auto">Debates sobre política, economia e história para além do senso comum.</p></div></section>
            
            {articles.length === 0 ? <div className="text-center py-10 text-white">Nenhum artigo publicado ainda.</div> : (
                <div className="container mx-auto px-6 py-8">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {featuredArticle && (
                            <div className="lg:col-span-2">
                                <Link to={`/article/${featuredArticle.id}`} className="cursor-pointer group">
                                    {featuredArticle.coverImage && <img src={featuredArticle.coverImage} alt="" className="w-full h-auto object-cover mb-4"/>}
                                    <p className="text-green-500 font-bold text-sm uppercase">{featuredArticle.tags?.[0]}</p>
                                    <h1 className="text-3xl md:text-5xl font-extrabold text-white my-2 group-hover:text-green-400 transition-colors">{featuredArticle.title}</h1>
                                    <p className="text-gray-400 font-serif text-lg">{featuredArticle.content.substring(0, 150)}...</p>
                                    <p className="text-gray-500 text-sm mt-2">Por {featuredArticle.profiles?.full_name || featuredArticle.author_name || 'Autor Desconhecido'}</p>
                                </Link>
                            </div>
                        )}
                        <div className="space-y-8">
                            {secondaryArticles.map(article => (
                                 <Link key={article.id} to={`/article/${article.id}`} className="cursor-pointer group">
                                     {article.coverImage && <img src={article.coverImage} alt="" className="w-full h-40 object-cover mb-2"/>}
                                     <p className="text-green-500 font-bold text-sm uppercase">{article.tags?.[0]}</p>
                                     <h2 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors">{article.title}</h2>
                                     <p className="text-gray-500 text-sm mt-1">Por {article.profiles?.full_name || article.author_name || 'Autor Desconhecido'}</p>
                                 </Link>
                            ))}
                        </div>
                    </div>
                    <section className="py-16"><h2 className="text-2xl font-extrabold text-white mb-6 border-b-2 border-gray-800 pb-2">Mais Artigos</h2><div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">{moreArticles.map(article => <ArticleCard key={article.id} article={article} />)}</div></section>
                </div>
            )}
        </>
    );
};

// --- ArticlesPage ---
const ArticlesPage = () => {
    const [articles, setArticles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAllArticles = async () => {
            const { data, error } = await supabase.from('articles').select('*, profiles(full_name)').order('createdAt', { ascending: false });
            if (error) console.error('Erro:', error); else setArticles(data);
            setIsLoading(false);
        };
        fetchAllArticles();
    }, []);

    if (isLoading) return <div className="text-center py-10 text-white">Carregando artigos...</div>;
    return <section className="py-16 container mx-auto px-6"><h2 className="text-2xl font-extrabold text-white mb-6 border-b-2 border-gray-800 pb-2">Todos os Artigos</h2><div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">{articles.map(article => <ArticleCard key={article.id} article={article} />)}</div></section>;
};

// --- SingleArticlePage ---
const SingleArticlePage = () => {
    const { id } = useParams();
    const [article, setArticle] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchArticle = async () => {
            const { data, error } = await supabase.from('articles').select('*, profiles(full_name)').eq('id', id).single();
            if (error) console.error('Erro:', error); else setArticle(data);
            setIsLoading(false);
        };
        fetchArticle();
    }, [id]);

    if (isLoading) return <div className="text-center py-10 text-white">Carregando artigo...</div>;
    if (!article) return <div className="text-center py-20 text-white">Artigo não encontrado.</div>;

    const formattedDate = new Date(article.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    const authorName = article.profiles?.full_name || article.author_name || 'Autor Desconhecido';

    return (
        <div className="bg-black text-white py-12"><div className="container mx-auto px-6 max-w-4xl">
            <Link to="/articles" className="text-green-500 font-bold hover:underline mb-8 inline-block">&larr; Voltar para Artigos</Link>
            <div className="flex flex-wrap gap-2 mb-4">{article.tags.map(tag => <Link to={`/tag/${tag}`} key={tag} className="bg-gray-800 text-green-400 text-xs font-bold px-2 py-1 rounded-full hover:bg-green-500 hover:text-black">{tag}</Link>)}</div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight" style={{fontFamily: 'serif'}}>{article.title}</h1>
            <div className="text-gray-500 font-semibold mb-8"><span>Por {authorName}</span><span className="mx-2">|</span><span>{formattedDate}</span></div>
            {article.coverImage && <img src={article.coverImage} alt={`Capa de ${article.title}`} className="w-full h-auto object-cover mb-8"/>}
            <div className="prose prose-lg prose-invert max-w-none font-serif text-gray-300 leading-relaxed whitespace-pre-line">{article.content}</div>
        </div></div>
    );
};

// --- EpisodesPage ---
const EpisodesPage = () => {
    const [episodes, setEpisodes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEpisodes = async () => {
            try {
                // NOTA: Esta função deve existir no seu provedor de hospedagem (ex: Netlify Functions)
                const response = await fetch('/.netlify/functions/spotify');
                if (!response.ok) throw new Error(`A resposta da rede não foi OK (${response.status})`);
                const data = await response.json();
                if (data.error) throw new Error(data.error);
                setEpisodes(data);
            } catch (err) {
                setError(`Não foi possível carregar os episódios. Verifique a função do servidor. Detalhes: ${err.message}`);
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchEpisodes();
    }, []);

    if (isLoading) return <div className="text-center py-20 text-white">A carregar episódios do Spotify...</div>;
    if (error) return <div className="container mx-auto px-6 py-20 text-center text-red-400 bg-red-900/50 rounded-lg">{error}</div>;

    const featuredEpisode = episodes[0];
    const episodeList = episodes.slice(1);

    return (
        <div className="bg-black py-12"><div className="container mx-auto px-6">
            <h1 className="text-4xl font-extrabold text-white mb-10 border-b-2 border-gray-800 pb-4">Episódios</h1>
            {featuredEpisode && <div className="mb-12 bg-gray-900 p-8 rounded-lg border border-gray-800"><h2 className="text-green-500 font-bold uppercase mb-4">Último Lançamento</h2><div className="flex flex-col md:flex-row gap-8"><img src={featuredEpisode.images[0]?.url} alt={featuredEpisode.name} className="w-full md:w-1/3 h-auto object-cover rounded-md" /><div className="flex flex-col flex-grow"><h3 className="text-3xl font-bold text-white mb-4">{featuredEpisode.name}</h3><div className="mt-auto"><iframe style={{ borderRadius: '12px' }} src={`https://open.spotify.com/embed/episode/${featuredEpisode.id}?utm_source=generator&theme=0`} width="100%" height="152" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe></div></div></div></div>}
            <h2 className="text-2xl font-extrabold text-white mb-6 border-b-2 border-gray-800 pb-2">Anteriores</h2>
            <div className="space-y-4 max-w-4xl mx-auto">{episodeList.map(ep => <a key={ep.id} href={ep.external_urls.spotify} target="_blank" rel="noopener noreferrer" className="bg-gray-900 p-4 rounded-lg border border-gray-800 flex items-center gap-4 hover:border-green-500 transition-colors"><img src={ep.images[2]?.url || ep.images[0]?.url} alt={ep.name} className="w-16 h-16 rounded-md flex-shrink-0" /><div><h4 className="font-bold text-white">{ep.name}</h4><p className="text-sm text-gray-500">{new Date(ep.release_date).toLocaleDateString('pt-BR')}</p></div></a>)}</div>
        </div></div>
    );
};

// --- GlossaryPage ---
const GlossaryPage = () => {
    const [terms, setTerms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const fetchGlossary = async () => {
            const { data } = await supabase.from('glossary').select('*').order('term', { ascending: true });
            setTerms(data || []);
            setIsLoading(false);
        };
        fetchGlossary();
    }, []);
    if (isLoading) return <div className="text-center py-10 text-white">Carregando glossário...</div>;
    return (
        <div className="bg-black py-12"><div className="container mx-auto px-6 max-w-4xl">
            <h1 className="text-4xl font-extrabold text-white mb-10 border-b-2 border-gray-800 pb-4">Glossário de Termos</h1>
            <div className="space-y-6">{terms.map(item => <div key={item.id} className="bg-gray-900 p-6 rounded-lg border border-gray-800"><h3 className="text-2xl font-bold text-white">{item.term}</h3><p className="text-gray-400 mt-2 leading-relaxed font-serif">{item.definition}</p></div>)}</div>
        </div></div>
    );
};

// --- TeamPage ---
const TeamPage = () => {
    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const fetchTeam = async () => {
            const { data } = await supabase.from('team_members').select('*').order('display_order', { ascending: true });
            setMembers(data || []);
            setIsLoading(false);
        };
        fetchTeam();
    }, []);
    if (isLoading) return <div className="text-center py-10 text-white">Carregando equipa...</div>;
    return (
        <div className="bg-black py-12"><div className="container mx-auto px-6">
            <h1 className="text-4xl font-extrabold text-white mb-10 border-b-2 border-gray-800 pb-4">Quem Somos</h1>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 text-center">{members.map(member => <div key={member.id} className="p-6"><img src={member.photo} alt={member.name} className="w-32 h-32 rounded-full mx-auto mb-4 object-cover" /><h3 className="text-xl font-bold text-white">{member.name}</h3><p className="text-gray-400 mb-4">{member.role}</p><Link to={`/bio/${member.id}`} className="font-bold text-green-500 hover:underline">Conheça +</Link></div>)}</div>
        </div></div>
    );
};

// --- BioPage ---
const BioPage = () => {
    const { id } = useParams();
    const [member, setMember] = useState(null);
    useEffect(() => {
        const fetchMember = async () => {
            const { data } = await supabase.from('team_members').select('*').eq('id', id).single();
            setMember(data);
        };
        fetchMember();
    }, [id]);
    if (!member) return <div className="text-center py-10 text-white">Carregando...</div>;
    return (
        <div className="bg-black py-12 min-h-[70vh]"><div className="container mx-auto px-6 max-w-4xl">
            <Link to="/team" className="text-green-500 font-bold hover:underline mb-8 inline-block">&larr; Voltar para a equipe</Link>
            <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
                <img src={member.photo} alt={member.name} className="w-48 h-48 rounded-full flex-shrink-0 object-cover" />
                <div><h1 className="text-4xl font-extrabold text-white">{member.name}</h1><p className="text-xl text-gray-400 font-semibold mb-4">{member.role}</p><p className="text-gray-300 leading-relaxed font-serif">{member.bio}</p></div>
            </div>
        </div></div>
    );
};

// --- TagPage & SearchPage ---
const GenericArticleListPage = ({ title, fetchFunction }) => {
    const [articles, setArticles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const fetchData = async () => {
            const { data } = await fetchFunction();
            setArticles(data || []);
            setIsLoading(false);
        };
        fetchData();
    }, [fetchFunction]);

    if (isLoading) return <div className="text-center py-10 text-white">Carregando artigos...</div>;
    return (
        <div className="bg-black py-12 min-h-[70vh]"><div className="container mx-auto px-6">
            <h1 className="text-3xl font-extrabold text-white mb-10 border-b-2 border-gray-800 pb-4">{title}</h1>
            {articles.length > 0 ? <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">{articles.map(article => <ArticleCard key={article.id} article={article} />)}</div> : <p className="text-gray-400">Nenhum resultado encontrado.</p>}
        </div></div>
    );
};

const TagPage = () => {
    const { tag } = useParams();
    const fetchFunction = useCallback(() => supabase.from('articles').select('*, profiles(full_name)').contains('tags', [tag]).order('createdAt', { ascending: false }), [tag]);
    return <GenericArticleListPage title={`Artigos com a tag: #${tag}`} fetchFunction={fetchFunction} />;
};

const SearchPage = () => {
    const { query } = useParams();
    const fetchFunction = useCallback(() => supabase.from('articles').select('*, profiles(full_name)').textSearch('title', `'${query}'`).order('createdAt', { ascending: false }), [query]);
    return <GenericArticleListPage title={`Resultados da busca por: "${query}"`} fetchFunction={fetchFunction} />;
};

// --- LoginPage ---
const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/dashboard";

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setError(error.message);
        else navigate(from, { replace: true });
        setIsLoading(false);
    };

    return (
        <div className="flex items-center justify-center py-12 px-4 bg-black min-h-[70vh]"><div className="w-full max-w-md bg-gray-900 p-8 rounded-lg shadow-lg border border-gray-800">
            <h2 className="text-2xl font-bold text-center text-white mb-6">Área de Membros</h2>
            <form onSubmit={handleLogin}>
                <div className="mb-4"><label className="block text-gray-300 mb-2">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" required /></div>
                <div className="mb-6"><label className="block text-gray-300 mb-2">Senha</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" required /></div>
                {error && <p className="text-red-500 text-center mb-4">{error}</p>}
                <button type="submit" disabled={isLoading} className="w-full bg-green-500 text-black font-bold py-2 rounded-md hover:bg-green-400 disabled:bg-gray-500">{isLoading ? 'A entrar...' : 'Entrar'}</button>
            </form>
        </div></div>
    );
};

// --- NotFoundPage ---
const NotFoundPage = () => (
    <div className="bg-black text-white flex items-center justify-center text-center py-20 min-h-[70vh]"><div className="container mx-auto px-6">
        <h1 className="text-6xl font-extrabold text-green-500">404</h1><p className="text-2xl mt-4 mb-8">Página Não Encontrada</p>
        <p className="text-gray-400">A página que você está procurando não existe ou foi movida.</p>
        <Link to="/" className="mt-8 inline-block bg-green-500 text-black font-bold py-3 px-6 rounded-md hover:bg-green-400 transition-colors">Voltar para a Página Inicial</Link>
    </div></div>
);


// ############################################################################
// 5. PÁGINAS DO PAINEL DE CONTROLO (DASHBOARD)
// ############################################################################

// --- Dashboard (Main) ---
const DashboardPage = () => {
    const [currentView, setCurrentView] = useState('articles');
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    
    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };
    
    if (!user) return null; // ProtectedRoute handles this
    const isAdmin = user.role === 'super_admin' || user.role === 'admin';

    return (
        <div className="bg-black text-white py-12 min-h-[80vh]"><div className="container mx-auto px-6">
            <div className="flex flex-wrap justify-between items-center mb-8 gap-4"><h1 className="text-3xl font-extrabold">Painel de Controle</h1><button onClick={handleLogout} className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 font-bold">Sair</button></div>
            <div className="flex gap-4 border-b-2 border-gray-800 mb-8 overflow-x-auto pb-px">
                <button onClick={() => setCurrentView('articles')} className={`py-2 px-4 font-bold whitespace-nowrap ${currentView === 'articles' ? 'border-b-2 border-green-500 text-white' : 'text-gray-500'}`}>Gerenciar Artigos</button>
                {isAdmin && <>
                    <button onClick={() => setCurrentView('team')} className={`py-2 px-4 font-bold whitespace-nowrap ${currentView === 'team' ? 'border-b-2 border-green-500 text-white' : 'text-gray-500'}`}>Gerenciar Equipe</button>
                    <button onClick={() => setCurrentView('glossary')} className={`py-2 px-4 font-bold whitespace-nowrap ${currentView === 'glossary' ? 'border-b-2 border-green-500 text-white' : 'text-gray-500'}`}>Gerenciar Glossário</button>
                    <button onClick={() => setCurrentView('settings')} className={`py-2 px-4 font-bold whitespace-nowrap ${currentView === 'settings' ? 'border-b-2 border-green-500 text-white' : 'text-gray-500'}`}>Configurações</button>
                    <button onClick={() => setCurrentView('users')} className={`py-2 px-4 font-bold whitespace-nowrap ${currentView === 'users' ? 'border-b-2 border-green-500 text-white' : 'text-gray-500'}`}>Usuários</button>
                </>}
            </div>
            {currentView === 'articles' && <ArticleManager user={user} />}
            {currentView === 'team' && isAdmin && <TeamManager />}
            {currentView === 'glossary' && isAdmin && <GlossaryManager />}
            {currentView === 'settings' && isAdmin && <SiteSettingsManager />}
            {currentView === 'users' && isAdmin && <UserManager user={user} />}
        </div></div>
    );
};

// --- ArticleManager ---
const ArticleManager = ({ user }) => {
    const [articles, setArticles] = useState([]);
    const [editingArticle, setEditingArticle] = useState(null);
    const [formState, setFormState] = useState({ title: '', content: '', tags: '', coverImage: '', author_name: '' });
    const [message, setMessage] = useState({ text: '', type: 'success' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [articleToDelete, setArticleToDelete] = useState(null);

    const fetchArticles = useCallback(async () => {
        const { data, error } = await supabase.from('articles').select('*').order('createdAt', { ascending: false });
        if (error) console.error('Erro:', error); else setArticles(data || []);
    }, []);

    useEffect(() => { fetchArticles(); }, [fetchArticles]);
    useEffect(() => {
        if (editingArticle) setFormState({ title: editingArticle.title || '', content: editingArticle.content || '', tags: Array.isArray(editingArticle.tags) ? editingArticle.tags.join(', ') : '', coverImage: editingArticle.coverImage || '', author_name: editingArticle.author_name || '' });
        else setFormState({ title: '', content: '', tags: '', coverImage: '', author_name: user.full_name || user.email });
    }, [editingArticle, user]);
    
    const handleFormChange = (e) => setFormState(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const showMessage = (text, type = 'success') => { setMessage({ text, type }); setTimeout(() => setMessage({ text: '', type: 'success' }), 4000); };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!formState.title || !formState.content || !formState.author_name) { showMessage('Título, conteúdo e nome do autor são obrigatórios.', 'error'); return; }
        setIsSubmitting(true);
        const articleData = { title: formState.title, content: formState.content, tags: formState.tags.split(',').map(tag => tag.trim()).filter(Boolean), coverImage: formState.coverImage, author_name: formState.author_name };
        const { error } = editingArticle ? await supabase.from('articles').update(articleData).eq('id', editingArticle.id) : await supabase.from('articles').insert({ ...articleData, user_id: user.id });
        if (error) showMessage(`Erro: ${error.message}`, 'error'); else { showMessage(editingArticle ? 'Artigo atualizado!' : 'Artigo publicado!'); setEditingArticle(null); }
        await fetchArticles();
        setIsSubmitting(false);
    };

    const openDeleteModal = (article) => { setArticleToDelete(article); setIsModalOpen(true); };
    const confirmDelete = async () => {
        if (articleToDelete) {
            const { error } = await supabase.from('articles').delete().eq('id', articleToDelete.id);
            if (error) showMessage(`Erro: ${error.message}`, 'error'); else showMessage('Artigo excluído!');
            await fetchArticles();
            setArticleToDelete(null);
        }
        setIsModalOpen(false);
    };
    const messageColor = message.type === 'error' ? 'text-red-500' : 'text-green-500';

    return <>
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={confirmDelete} title="Confirmar Exclusão" confirmText="Excluir">Tem certeza que deseja excluir o artigo "<strong>{articleToDelete?.title}</strong>"?</Modal>
        <div className="bg-gray-900 p-8 rounded-lg border border-gray-800 mb-12"><h2 className="text-2xl font-bold mb-6">{editingArticle ? 'Editando Artigo' : 'Publicar Novo Artigo'}</h2><form onSubmit={handleFormSubmit}>
            <div className="grid md:grid-cols-2 gap-6">
                <div><label className="block text-gray-300 mb-2">Título</label><input name="title" value={formState.title} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md"/></div>
                <div><label className="block text-gray-300 mb-2">Nome do Autor</label><input name="author_name" value={formState.author_name} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md"/></div>
                <div><label className="block text-gray-300 mb-2">URL da Imagem de Capa</label><input name="coverImage" value={formState.coverImage} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md"/></div>
                <div><label className="block text-gray-300 mb-2">Tags (separadas por vírgula)</label><input name="tags" value={formState.tags} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md"/></div>
            </div>
            <div className="mt-6"><label className="block text-gray-300 mb-2">Conteúdo</label><textarea name="content" value={formState.content} onChange={handleFormChange} rows="15" className="w-full p-3 border border-gray-700 bg-gray-800 text-white rounded-md font-mono text-sm"></textarea></div>
            {message.text && <p className={`${messageColor} text-center my-4`}>{message.text}</p>}
            <div className="flex items-center gap-4 mt-6">
                <button type="submit" disabled={isSubmitting} className="bg-green-500 text-black font-bold py-3 px-8 rounded-md hover:bg-green-400 disabled:bg-gray-500">{isSubmitting ? 'Aguarde...' : (editingArticle ? 'Atualizar' : 'Publicar')}</button>
                {editingArticle && <button type="button" onClick={() => setEditingArticle(null)} className="bg-gray-600 text-white font-bold py-3 px-8 rounded-md hover:bg-gray-500">Cancelar</button>}
            </div>
        </form></div>
        <div className="bg-gray-900 p-8 rounded-lg border border-gray-800"><h2 className="text-2xl font-bold mb-6">Artigos Publicados</h2><div className="space-y-4">{articles.map(article => <div key={article.id} className="flex justify-between items-center bg-black p-4 rounded-md border border-gray-700"><p className="text-white flex-1 truncate pr-4">{article.title}</p><div className="flex gap-2 flex-shrink-0"><button onClick={() => setEditingArticle(article)} className="bg-blue-600 text-white text-xs font-bold py-1 px-3 rounded-md">Editar</button><button onClick={() => openDeleteModal(article)} className="bg-red-600 text-white text-xs font-bold py-1 px-3 rounded-md">Excluir</button></div></div>)}</div></div>
    </>;
};

// --- TeamManager, GlossaryManager, etc. ---
// (Estes componentes seguem um padrão similar ao ArticleManager, com formulários e listas)
const TeamManager = () => { /* ...código similar para gerir equipa... */ return <div className="bg-gray-900 p-8 rounded-lg border border-gray-800"><h2 className="text-2xl font-bold mb-6">Gerenciar Equipe</h2><p className="text-gray-400">Funcionalidade de gestão de equipe a ser implementada aqui.</p></div>; };
const GlossaryManager = () => { /* ...código similar para gerir glossário... */ return <div className="bg-gray-900 p-8 rounded-lg border border-gray-800"><h2 className="text-2xl font-bold mb-6">Gerenciar Glossário</h2><p className="text-gray-400">Funcionalidade de gestão de glossário a ser implementada aqui.</p></div>; };
const SiteSettingsManager = () => { /* ...código para gerir configurações... */ return <div className="bg-gray-900 p-8 rounded-lg border border-gray-800"><h2 className="text-2xl font-bold mb-6">Configurações do Site</h2><p className="text-gray-400">Funcionalidade de gestão de configurações a ser implementada aqui.</p></div>; };
const UserManager = ({ user }) => { /* ...código para gerir usuários... */ return <div className="bg-gray-900 p-8 rounded-lg border border-gray-800"><h2 className="text-2xl font-bold mb-6">Gerenciar Usuários</h2><p className="text-yellow-400 bg-yellow-900/50 p-3 rounded-md"><strong>Aviso:</strong> A criação de usuários deve ser feita por uma função segura no servidor.</p></div>; };


// ############################################################################
// 6. COMPONENTE PRINCIPAL DA APLICAÇÃO (App)
// ############################################################################

export default function App() {
    return (
        <AuthProvider>
            <PlayerProvider>
                <HashRouter>
                    <Routes>
                        <Route path="/" element={<MainLayout />}>
                            <Route index element={<HomePage />} />
                            <Route path="articles" element={<ArticlesPage />} />
                            <Route path="article/:id" element={<SingleArticlePage />} />
                            <Route path="episodes" element={<EpisodesPage />} />
                            <Route path="glossary" element={<GlossaryPage />} />
                            <Route path="team" element={<TeamPage />} />
                            <Route path="bio/:id" element={<BioPage />} />
                            <Route path="tag/:tag" element={<TagPage />} />
                            <Route path="search/:query" element={<SearchPage />} />
                            <Route path="login" element={<LoginPage />} />
                            <Route path="dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                            <Route path="*" element={<NotFoundPage />} />
                        </Route>
                    </Routes>
                </HashRouter>
            </PlayerProvider>
        </AuthProvider>
    );
}
