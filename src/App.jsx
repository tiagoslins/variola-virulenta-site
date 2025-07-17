import React, { useState, useEffect, createContext, useContext, useRef, useCallback } from 'react';
import { HashRouter, Routes, Route, Link, NavLink, useNavigate, useParams, useLocation, Outlet, Navigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

// --- INÍCIO: CONFIGURAÇÃO E VERIFICAÇÃO DO SUPABASE ---
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
let supabase;
let configError = null;

// Verificação crucial para evitar a página em branco.
if (!supabaseUrl || !supabaseKey) {
    configError = {
        title: "Erro Crítico de Configuração",
        message: "As variáveis de ambiente do Supabase não foram encontradas.",
        details: `Verifique se tem um ficheiro .env na raiz do seu projeto ou se as variáveis de ambiente estão configuradas no Netlify. O conteúdo esperado é:\n\nVITE_SUPABASE_URL=https://SUA_URL_DO_PROJETO.supabase.co\nVITE_SUPABASE_KEY=SUA_CHAVE_PUBLICA_ANON`,
        action: "Depois de configurar, reinicie o servidor de desenvolvimento ou faça um novo deploy."
    };
} else {
    try {
        supabase = createClient(supabaseUrl, supabaseKey);
    } catch (error) {
        configError = {
            title: "Erro ao Inicializar o Supabase",
            message: "Ocorreu um erro ao tentar conectar-se ao Supabase, verifique se a URL e a Chave estão corretas.",
            details: error.message,
            action: "Corrija as variáveis de ambiente e faça um novo deploy."
        };
    }
}

// ############################################################################
// 0. COMPONENTE DE ERRO E ERROR BOUNDARY
// ############################################################################

const ErrorDisplay = ({ error }) => (
    <div style={{ fontFamily: 'monospace', padding: '2rem', backgroundColor: '#1a202c', color: '#e53e3e', minHeight: '100vh' }}>
        <h1>{error.title}</h1>
        <p>{error.message}</p>
        <pre style={{ backgroundColor: '#2d3748', padding: '1rem', marginTop: '1rem', borderRadius: '8px', color: 'white', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {error.details}
        </pre>
        <p style={{ marginTop: '1rem', color: '#90cdf4' }}>{error.action}</p>
    </div>
);

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error: error };
    }
    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return <ErrorDisplay error={{ title: "Erro Inesperado na Aplicação", message: "Algo quebrou durante a renderização.", details: this.state.error.toString(), action: "Verifique a consola do programador (F12) para mais detalhes e reporte o erro." }} />;
        }
        return this.props.children;
    }
}


// ############################################################################
// 1. CONTEXTOS GLOBAIS (Autenticação e Player de Áudio)
// ############################################################################

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!supabase) { setLoading(false); return; } // Não faz nada se o supabase não foi inicializado
        const fetchUserSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', session.user.id).single();
                setUser({ ...session.user, ...profile });
            }
            setLoading(false);
        };
        fetchUserSession();
        const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
            const currentUser = session?.user;
            if (currentUser) {
                const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', currentUser.id).single();
                setUser({ ...currentUser, ...profile });
            } else {
                setUser(null);
            }
            setLoading(false);
        });
        return () => authListener?.subscription.unsubscribe();
    }, []);

    return <AuthContext.Provider value={{ user, loading, signOut: () => supabase.auth.signOut() }}>{children}</AuthContext.Provider>;
};

const PlayerContext = createContext(null);

export const PlayerProvider = ({ children }) => {
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const playTrack = (track) => { setCurrentTrack(track); setIsPlaying(true); };
    const playPause = () => { if (currentTrack) setIsPlaying(!isPlaying); };
    const onTrackEnd = () => setIsPlaying(false);
    return <PlayerContext.Provider value={{ currentTrack, isPlaying, playTrack, playPause, onTrackEnd }}>{children}</PlayerContext.Provider>;
};

// ############################################################################
// 2. HOOKS PERSONALIZADOS
// ############################################################################

export const useAuth = () => useContext(AuthContext);
export const usePlayer = () => useContext(PlayerContext);

// ############################################################################
// 3. COMPONENTES REUTILIZÁVEIS
// ############################################################################

const Header = () => {
    const { user } = useAuth();
    const [query, setQuery] = useState('');
    const navigate = useNavigate();
    const handleSearch = (e) => { e.preventDefault(); const trimmed = query.trim(); if (trimmed) { navigate(`/search/${trimmed}`); setQuery(''); } };
    const activeLinkStyle = { color: '#48bb78', borderBottom: '2px solid #48bb78' };
    return <header className="bg-black border-b-2 border-green-500 sticky top-0 z-50"><nav className="container mx-auto px-6 py-4 flex justify-between items-center gap-4"><Link to="/" className="text-2xl font-black text-white tracking-tighter">Variola Virulenta</Link><div className="hidden lg:flex items-center space-x-6"><NavLink to="/" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="text-gray-300 hover:text-white font-medium py-2">Início</NavLink><NavLink to="/articles" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="text-gray-300 hover:text-white font-medium py-2">Artigos</NavLink><NavLink to="/episodes" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="text-gray-300 hover:text-white font-medium py-2">Episódios</NavLink><NavLink to="/glossary" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="text-gray-300 hover:text-white font-medium py-2">Glossário</NavLink><NavLink to="/team" style={({ isActive }) => isActive ? activeLinkStyle : undefined} className="text-gray-300 hover:text-white font-medium py-2">Quem Somos</NavLink></div><div className="flex items-center gap-4"><form onSubmit={handleSearch} className="relative hidden md:block"><input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar..." className="bg-gray-800 border border-gray-700 text-white rounded-md py-1 px-3 w-40 md:w-48 focus:ring-2 focus:ring-green-500 focus:outline-none text-sm" /></form>{user ? <Link to="/dashboard" className="bg-green-500 text-black py-1 px-3 rounded-md font-bold hover:bg-green-400 transition-colors text-sm whitespace-nowrap">Painel</Link> : <Link to="/login" className="border border-gray-600 text-gray-300 py-1 px-3 rounded-md font-bold hover:bg-green-500 hover:text-black transition-colors text-sm whitespace-nowrap">Login</Link>}</div></nav></header>;
};
const Footer = () => <footer className="bg-black text-gray-500 pb-24 pt-8 border-t-2 border-gray-900"><div className="container mx-auto px-6 text-center text-sm"><p>&copy; {new Date().getFullYear()} Variola Virulenta. Conteúdo crítico para tempos urgentes.</p><p className="mt-1">Horário de Brasília: {new Date().toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</p></div></footer>;
const SupportBanner = () => <div className="bg-green-500 text-black p-2 fixed bottom-0 left-0 w-full z-40 text-center font-bold text-sm"><a href="https://apoia.se/variolavirulenta" target="_blank" rel="noopener noreferrer" className="hover:underline">Gostou do nosso trabalho? Apoie-nos no Apoia.se e ajude a manter o jornalismo independente.</a></div>;
const PersistentAudioPlayer = () => {
    const { currentTrack, isPlaying, playPause, onTrackEnd } = usePlayer();
    const audioRef = useRef(null);
    useEffect(() => { if (audioRef.current) { if (isPlaying) audioRef.current.play().catch(console.error); else audioRef.current.pause(); } }, [isPlaying, currentTrack]);
    if (!currentTrack) return null;
    return <div className="fixed bottom-10 left-0 w-full bg-black border-t-2 border-green-500 z-40 p-2 shadow-lg"><div className="container mx-auto flex items-center justify-between text-white"><div className="flex items-center gap-4"><button onClick={playPause} className="text-green-500 text-4xl">{isPlaying ? '❚❚' : '►'}</button><div><p className="font-bold">{currentTrack.title}</p><p className="text-sm text-gray-400">{currentTrack.artist || 'Variola Virulenta'}</p></div></div><audio ref={audioRef} src={currentTrack.audioSrc} onEnded={onTrackEnd} className="hidden" autoPlay={isPlaying} /></div></div>;
};
const ArticleCard = ({ article }) => {
    const authorName = article.profiles?.full_name || article.author_name || 'Autor Desconhecido';
    return <Link to={`/article/${article.id}`} className="bg-black flex flex-col overflow-hidden group cursor-pointer">{article.coverImage && <img src={article.coverImage} alt={`Capa de ${article.title}`} className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105" onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/600x400/1a202c/4a5568?text=Imagem+Indisponível'; }} />}<div className="p-1 pt-3 flex flex-col flex-grow">{article.tags?.[0] && <p className="text-green-500 font-bold text-xs uppercase">{article.tags[0]}</p>}<h3 className="text-lg font-bold text-white mb-2 group-hover:text-green-400 transition-colors">{article.title}</h3><p className="text-gray-500 text-sm mt-auto">Por {authorName}</p></div></Link>;
};
const Modal = ({ isOpen, onClose, onConfirm, title, children, confirmText = 'Confirmar', cancelText = 'Cancelar' }) => {
    if (!isOpen) return null;
    return <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}><div className="bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-md border border-gray-700" onClick={(e) => e.stopPropagation()}><h2 className="text-xl font-bold text-white mb-4">{title}</h2><div className="text-gray-300 mb-6">{children}</div><div className="flex justify-end gap-4"><button onClick={onClose} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-500">{cancelText}</button><button onClick={onConfirm} className="bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-500">{confirmText}</button></div></div></div>;
};
const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="text-center py-10 text-white">Verificando autenticação...</div>;
    if (!user) return <Navigate to="/login" state={{ from: useLocation() }} replace />;
    return children;
};
const MainLayout = () => {
    const { pathname } = useLocation();
    useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
    return <div className="bg-black min-h-screen font-sans flex flex-col"><Header /><main className="flex-grow"><Outlet /></main><PersistentAudioPlayer /><SupportBanner /><Footer /></div>;
};

// ############################################################################
// 4. PÁGINAS DO SITE
// ############################################################################

const HomePage = () => {
    const [articles, setArticles] = useState([]);
    const [bannerUrl, setBannerUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const fetchHomePageData = async () => {
            const articlesPromise = supabase.from('articles').select('*, profiles(full_name)').order('createdAt', { ascending: false }).limit(6);
            const bannerPromise = supabase.from('site_settings').select('value').eq('key', 'main_banner_url').single();
            const [articlesResult, bannerResult] = await Promise.all([articlesPromise, bannerPromise]);
            if (articlesResult.data) setArticles(articlesResult.data);
            if (bannerResult.data) setBannerUrl(bannerResult.data.value); else setBannerUrl('https://placehold.co/1200x400/000000/48bb78?text=Variola+Virulenta');
            setIsLoading(false);
        };
        fetchHomePageData();
    }, []);
    if (isLoading) return <div className="text-center py-10 text-white">Carregando...</div>;
    const [featured, ...rest] = articles;
    const secondary = rest.slice(0, 2);
    const more = rest.slice(2);
    return <>
        <section className="bg-black text-white text-center pt-8"><div className="container mx-auto px-6"><img src={bannerUrl} alt="Banner do Podcast" className="w-full h-auto object-cover" /></div></section>
        <section className="bg-black text-white text-center py-12"><div className="container mx-auto px-6"><h1 className="text-5xl font-extrabold mb-4 text-green-400 tracking-tight">Pensamento Crítico para Transformar a Realidade</h1><p className="text-xl text-gray-300 max-w-3xl mx-auto">Debates sobre política, economia e história para além do senso comum.</p></div></section>
        {articles.length === 0 ? <div className="text-center py-10 text-white">Nenhum artigo publicado.</div> : <div className="container mx-auto px-6 py-8"><div className="grid lg:grid-cols-3 gap-8">{featured && <div className="lg:col-span-2"><Link to={`/article/${featured.id}`} className="cursor-pointer group">{featured.coverImage && <img src={featured.coverImage} alt="" className="w-full h-auto object-cover mb-4"/>}<p className="text-green-500 font-bold text-sm uppercase">{featured.tags?.[0]}</p><h1 className="text-3xl md:text-5xl font-extrabold text-white my-2 group-hover:text-green-400">{featured.title}</h1><p className="text-gray-400 font-serif text-lg">{featured.content.substring(0, 150)}...</p><p className="text-gray-500 text-sm mt-2">Por {featured.profiles?.full_name || featured.author_name || 'N/A'}</p></Link></div>}<div className="space-y-8">{secondary.map(article => <Link key={article.id} to={`/article/${article.id}`} className="cursor-pointer group">{article.coverImage && <img src={article.coverImage} alt="" className="w-full h-40 object-cover mb-2"/>}<p className="text-green-500 font-bold text-sm uppercase">{article.tags?.[0]}</p><h2 className="text-xl font-bold text-white group-hover:text-green-400">{article.title}</h2><p className="text-gray-500 text-sm mt-1">Por {article.profiles?.full_name || article.author_name || 'N/A'}</p></Link>)}</div></div><section className="py-16"><h2 className="text-2xl font-extrabold text-white mb-6 border-b-2 border-gray-800 pb-2">Mais Artigos</h2><div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">{more.map(article => <ArticleCard key={article.id} article={article} />)}</div></section></div>}
    </>;
};
const ArticlesPage = () => {
    const [articles, setArticles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => { supabase.from('articles').select('*, profiles(full_name)').order('createdAt', { ascending: false }).then(({ data }) => { setArticles(data || []); setIsLoading(false); }); }, []);
    if (isLoading) return <div className="text-center py-10 text-white">Carregando artigos...</div>;
    return <section className="py-16 container mx-auto px-6"><h2 className="text-2xl font-extrabold text-white mb-6 border-b-2 border-gray-800 pb-2">Todos os Artigos</h2><div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">{articles.map(article => <ArticleCard key={article.id} article={article} />)}</div></section>;
};
const SingleArticlePage = () => {
    const { id } = useParams();
    const [article, setArticle] = useState(null);
    useEffect(() => { supabase.from('articles').select('*, profiles(full_name)').eq('id', id).single().then(({ data }) => setArticle(data)); }, [id]);
    if (!article) return <div className="text-center py-10 text-white">Carregando...</div>;
    const formattedDate = new Date(article.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    const authorName = article.profiles?.full_name || article.author_name || 'Autor Desconhecido';
    return <div className="bg-black text-white py-12"><div className="container mx-auto px-6 max-w-4xl"><Link to="/articles" className="text-green-500 font-bold hover:underline mb-8 inline-block">&larr; Voltar</Link><div className="flex flex-wrap gap-2 mb-4">{article.tags?.map(tag => <Link to={`/tag/${tag}`} key={tag} className="bg-gray-800 text-green-400 text-xs font-bold px-2 py-1 rounded-full hover:bg-green-500 hover:text-black">{tag}</Link>)}</div><h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight" style={{fontFamily: 'serif'}}>{article.title}</h1><div className="text-gray-500 font-semibold mb-8"><span>Por {authorName}</span><span className="mx-2">|</span><span>{formattedDate}</span></div>{article.coverImage && <img src={article.coverImage} alt={`Capa de ${article.title}`} className="w-full h-auto object-cover mb-8"/>}<div className="prose prose-lg prose-invert max-w-none font-serif text-gray-300 leading-relaxed whitespace-pre-line">{article.content}</div></div></div>;
};
const EpisodesPage = () => {
    const [episodes, setEpisodes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        fetch('/.netlify/functions/spotify').then(res => { if (!res.ok) throw new Error(`Erro na rede: ${res.status}`); return res.json(); }).then(data => { if (data.error) throw new Error(data.error); setEpisodes(data); }).catch(err => setError(`Falha ao carregar episódios: ${err.message}`)).finally(() => setIsLoading(false));
    }, []);
    if (isLoading) return <div className="text-center py-20 text-white">A carregar episódios...</div>;
    if (error) return <div className="container mx-auto px-6 py-20 text-center text-red-400 bg-red-900/50 rounded-lg">{error}</div>;
    const [featured, ...rest] = episodes;
    return <div className="bg-black py-12"><div className="container mx-auto px-6"><h1 className="text-4xl font-extrabold text-white mb-10 border-b-2 border-gray-800 pb-4">Episódios</h1>{featured && <div className="mb-12 bg-gray-900 p-8 rounded-lg border border-gray-800"><h2 className="text-green-500 font-bold uppercase mb-4">Último Lançamento</h2><div className="flex flex-col md:flex-row gap-8"><img src={featured.images[0]?.url} alt={featured.name} className="w-full md:w-1/3 h-auto object-cover rounded-md" /><div className="flex flex-col flex-grow"><h3 className="text-3xl font-bold text-white mb-4">{featured.name}</h3><div className="mt-auto"><iframe style={{ borderRadius: '12px' }} src={`https://open.spotify.com/embed/episode/${featured.id}?utm_source=generator&theme=0`} width="100%" height="152" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe></div></div></div></div>}<h2 className="text-2xl font-extrabold text-white mb-6 border-b-2 border-gray-800 pb-2">Anteriores</h2><div className="space-y-4 max-w-4xl mx-auto">{rest.map(ep => <a key={ep.id} href={ep.external_urls.spotify} target="_blank" rel="noopener noreferrer" className="bg-gray-900 p-4 rounded-lg border border-gray-800 flex items-center gap-4 hover:border-green-500"><img src={ep.images[2]?.url || ep.images[0]?.url} alt={ep.name} className="w-16 h-16 rounded-md flex-shrink-0" /><div><h4 className="font-bold text-white">{ep.name}</h4><p className="text-sm text-gray-500">{new Date(ep.release_date).toLocaleDateString('pt-BR')}</p></div></a>)}</div></div></div>;
};
const GlossaryPage = () => {
    const [terms, setTerms] = useState([]);
    useEffect(() => { supabase.from('glossary').select('*').order('term', { ascending: true }).then(({ data }) => setTerms(data || [])); }, []);
    return <div className="bg-black py-12"><div className="container mx-auto px-6 max-w-4xl"><h1 className="text-4xl font-extrabold text-white mb-10 border-b-2 border-gray-800 pb-4">Glossário</h1><div className="space-y-6">{terms.map(item => <div key={item.id} className="bg-gray-900 p-6 rounded-lg border border-gray-800"><h3 className="text-2xl font-bold text-white">{item.term}</h3><p className="text-gray-400 mt-2 font-serif">{item.definition}</p></div>)}</div></div></div>;
};
const TeamPage = () => {
    const [members, setMembers] = useState([]);
    useEffect(() => { supabase.from('team_members').select('*').order('display_order', { ascending: true }).then(({ data }) => setMembers(data || [])); }, []);
    return <div className="bg-black py-12"><div className="container mx-auto px-6"><h1 className="text-4xl font-extrabold text-white mb-10 border-b-2 border-gray-800 pb-4">Quem Somos</h1><div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 text-center">{members.map(member => <div key={member.id} className="p-6"><img src={member.photo} alt={member.name} className="w-32 h-32 rounded-full mx-auto mb-4 object-cover" /><h3 className="text-xl font-bold text-white">{member.name}</h3><p className="text-gray-400 mb-4">{member.role}</p><Link to={`/bio/${member.id}`} className="font-bold text-green-500 hover:underline">Conheça +</Link></div>)}</div></div></div>;
};
const BioPage = () => {
    const { id } = useParams();
    const [member, setMember] = useState(null);
    useEffect(() => { supabase.from('team_members').select('*').eq('id', id).single().then(({ data }) => setMember(data)); }, [id]);
    if (!member) return <div className="text-center py-10 text-white">Carregando...</div>;
    return <div className="bg-black py-12 min-h-[70vh]"><div className="container mx-auto px-6 max-w-4xl"><Link to="/team" className="text-green-500 font-bold hover:underline mb-8 inline-block">&larr; Voltar</Link><div className="flex flex-col md:flex-row items-center md:items-start gap-10"><img src={member.photo} alt={member.name} className="w-48 h-48 rounded-full flex-shrink-0 object-cover" /><div><h1 className="text-4xl font-extrabold text-white">{member.name}</h1><p className="text-xl text-gray-400 font-semibold mb-4">{member.role}</p><p className="text-gray-300 leading-relaxed font-serif">{member.bio}</p></div></div></div></div>;
};
const GenericArticleListPage = ({ title, fetcher }) => {
    const [articles, setArticles] = useState([]);
    useEffect(() => { fetcher().then(({ data }) => setArticles(data || [])); }, [fetcher]);
    return <div className="bg-black py-12 min-h-[70vh]"><div className="container mx-auto px-6"><h1 className="text-3xl font-extrabold text-white mb-10 border-b-2 border-gray-800 pb-4">{title}</h1>{articles.length > 0 ? <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">{articles.map(article => <ArticleCard key={article.id} article={article} />)}</div> : <p className="text-gray-400">Nenhum resultado.</p>}</div></div>;
};
const TagPage = () => {
    const { tag } = useParams();
    const fetcher = useCallback(() => supabase.from('articles').select('*, profiles(full_name)').contains('tags', [tag]).order('createdAt', { ascending: false }), [tag]);
    return <GenericArticleListPage title={`Tag: #${tag}`} fetcher={fetcher} />;
};
const SearchPage = () => {
    const { query } = useParams();
    const fetcher = useCallback(() => supabase.from('articles').select('*, profiles(full_name)').textSearch('title', `'${query}'`, { type: 'websearch' }).order('createdAt', { ascending: false }), [query]);
    return <GenericArticleListPage title={`Busca por: "${query}"`} fetcher={fetcher} />;
};
const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const from = useLocation().state?.from?.pathname || "/dashboard";
    const handleLogin = async (e) => { e.preventDefault(); setIsLoading(true); const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) setError(error.message); else navigate(from, { replace: true }); setIsLoading(false); };
    return <div className="flex items-center justify-center py-12 px-4 bg-black min-h-[70vh]"><div className="w-full max-w-md bg-gray-900 p-8 rounded-lg shadow-lg border border-gray-800"><h2 className="text-2xl font-bold text-center text-white mb-6">Área de Membros</h2><form onSubmit={handleLogin}><div className="mb-4"><label className="block text-gray-300 mb-2">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md" required /></div><div className="mb-6"><label className="block text-gray-300 mb-2">Senha</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md" required /></div>{error && <p className="text-red-500 text-center mb-4">{error}</p>}<button type="submit" disabled={isLoading} className="w-full bg-green-500 text-black font-bold py-2 rounded-md hover:bg-green-400 disabled:bg-gray-500">{isLoading ? 'A entrar...' : 'Entrar'}</button></form></div></div>;
};
const NotFoundPage = () => <div className="bg-black text-white flex items-center justify-center text-center py-20 min-h-[70vh]"><div className="container mx-auto px-6"><h1 className="text-6xl font-extrabold text-green-500">404</h1><p className="text-2xl mt-4 mb-8">Página Não Encontrada</p><Link to="/" className="mt-8 inline-block bg-green-500 text-black font-bold py-3 px-6 rounded-md hover:bg-green-400">Voltar para a Página Inicial</Link></div></div>;

// ############################################################################
// 5. PÁGINAS DO PAINEL DE CONTROLO (DASHBOARD)
// ############################################################################

const DashboardPage = () => {
    const [currentView, setCurrentView] = useState('articles');
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const handleLogout = async () => { await signOut(); navigate('/'); };
    if (!user) return null;
    const isAdmin = user.role === 'super_admin' || user.role === 'admin';
    return <div className="bg-black text-white py-12 min-h-[80vh]"><div className="container mx-auto px-6"><div className="flex flex-wrap justify-between items-center mb-8 gap-4"><h1 className="text-3xl font-extrabold">Painel de Controle</h1><button onClick={handleLogout} className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 font-bold">Sair</button></div><div className="flex gap-4 border-b-2 border-gray-800 mb-8 overflow-x-auto pb-px"><button onClick={() => setCurrentView('articles')} className={`py-2 px-4 font-bold whitespace-nowrap ${currentView === 'articles' ? 'border-b-2 border-green-500' : 'text-gray-500'}`}>Artigos</button>{isAdmin && <><button onClick={() => setCurrentView('team')} className={`py-2 px-4 font-bold whitespace-nowrap ${currentView === 'team' ? 'border-b-2 border-green-500' : 'text-gray-500'}`}>Equipe</button><button onClick={() => setCurrentView('glossary')} className={`py-2 px-4 font-bold whitespace-nowrap ${currentView === 'glossary' ? 'border-b-2 border-green-500' : 'text-gray-500'}`}>Glossário</button><button onClick={() => setCurrentView('settings')} className={`py-2 px-4 font-bold whitespace-nowrap ${currentView === 'settings' ? 'border-b-2 border-green-500' : 'text-gray-500'}`}>Configurações</button><button onClick={() => setCurrentView('users')} className={`py-2 px-4 font-bold whitespace-nowrap ${currentView === 'users' ? 'border-b-2 border-green-500' : 'text-gray-500'}`}>Usuários</button></> }</div>{currentView === 'articles' && <ArticleManager user={user} />}{currentView === 'team' && isAdmin && <TeamManager />}{currentView === 'glossary' && isAdmin && <GlossaryManager />}{currentView === 'settings' && isAdmin && <SiteSettingsManager />}{currentView === 'users' && isAdmin && <UserManager user={user} />}</div></div>;
};

const ArticleManager = ({ user }) => {
    const [articles, setArticles] = useState([]);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ title: '', content: '', tags: '', coverImage: '', author_name: '' });
    const [message, setMessage] = useState({ text: '', type: 'success' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modal, setModal] = useState({ isOpen: false, item: null });

    const fetchArticles = useCallback(async () => {
        const { data } = await supabase.from('articles').select('*').order('createdAt', { ascending: false });
        setArticles(data || []);
    }, []);

    useEffect(() => { fetchArticles(); }, [fetchArticles]);
    useEffect(() => {
        if (editing) setForm({ ...editing, tags: Array.isArray(editing.tags) ? editing.tags.join(', ') : '' });
        else setForm({ title: '', content: '', tags: '', coverImage: '', author_name: user.full_name || user.email });
    }, [editing, user]);
    
    const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const showMessage = (text, type = 'success') => { setMessage({ text, type }); setTimeout(() => setMessage({ text: '' }), 4000); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.content) { showMessage('Título e conteúdo são obrigatórios.', 'error'); return; }
        setIsSubmitting(true);
        const articleData = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
        const { error } = editing ? await supabase.from('articles').update(articleData).eq('id', editing.id) : await supabase.from('articles').insert({ ...articleData, user_id: user.id });
        if (error) showMessage(`Erro: ${error.message}`, 'error'); else { showMessage(editing ? 'Artigo atualizado!' : 'Artigo publicado!'); setEditing(null); }
        await fetchArticles();
        setIsSubmitting(false);
    };

    const confirmDelete = async () => {
        if (modal.item) {
            const { error } = await supabase.from('articles').delete().eq('id', modal.item.id);
            if (error) showMessage(`Erro: ${error.message}`, 'error'); else showMessage('Artigo excluído!');
            await fetchArticles();
        }
        setModal({ isOpen: false, item: null });
    };

    return <>
        <Modal isOpen={modal.isOpen} onClose={() => setModal({ isOpen: false, item: null })} onConfirm={confirmDelete} title="Confirmar Exclusão" confirmText="Excluir">Tem certeza que deseja excluir "<strong>{modal.item?.title}</strong>"?</Modal>
        <div className="bg-gray-900 p-8 rounded-lg border border-gray-800 mb-12"><h2 className="text-2xl font-bold mb-6">{editing ? 'Editando Artigo' : 'Novo Artigo'}</h2><form onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-6">
                <div><label className="block text-gray-300 mb-2">Título</label><input name="title" value={form.title} onChange={handleChange} className="w-full p-2 bg-gray-800 rounded-md"/></div>
                <div><label className="block text-gray-300 mb-2">Autor</label><input name="author_name" value={form.author_name} onChange={handleChange} className="w-full p-2 bg-gray-800 rounded-md"/></div>
                <div><label className="block text-gray-300 mb-2">URL da Imagem</label><input name="coverImage" value={form.coverImage} onChange={handleChange} className="w-full p-2 bg-gray-800 rounded-md"/></div>
                <div><label className="block text-gray-300 mb-2">Tags</label><input name="tags" value={form.tags} onChange={handleChange} className="w-full p-2 bg-gray-800 rounded-md"/></div>
            </div>
            <div className="mt-6"><label className="block text-gray-300 mb-2">Conteúdo</label><textarea name="content" value={form.content} onChange={handleChange} rows="15" className="w-full p-2 bg-gray-800 rounded-md font-mono text-sm"></textarea></div>
            {message.text && <p className={`text-center my-4 ${message.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>{message.text}</p>}
            <div className="flex items-center gap-4 mt-6"><button type="submit" disabled={isSubmitting} className="bg-green-500 text-black font-bold py-2 px-6 rounded-md disabled:bg-gray-500">{isSubmitting ? 'Salvando...' : (editing ? 'Atualizar' : 'Publicar')}</button>{editing && <button type="button" onClick={() => setEditing(null)} className="bg-gray-600 font-bold py-2 px-6 rounded-md">Cancelar</button>}</div>
        </form></div>
        <div className="bg-gray-900 p-8 rounded-lg border border-gray-800"><h2 className="text-2xl font-bold mb-6">Artigos Publicados</h2><div className="space-y-4">{articles.map(item => <div key={item.id} className="flex justify-between items-center bg-black p-4 rounded-md"><p className="flex-1 truncate pr-4">{item.title}</p><div className="flex gap-2"><button onClick={() => setEditing(item)} className="bg-blue-600 text-xs font-bold py-1 px-3 rounded-md">Editar</button><button onClick={() => setModal({ isOpen: true, item })} className="bg-red-600 text-xs font-bold py-1 px-3 rounded-md">Excluir</button></div></div>)}</div></div>
    </>;
};

const TeamManager = () => {
    const [members, setMembers] = useState([]);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', role: '', photo: '', bio: '', display_order: 99 });
    const [message, setMessage] = useState('');
    const [modal, setModal] = useState({ isOpen: false, item: null });

    const fetchItems = useCallback(async () => {
        const { data } = await supabase.from('team_members').select('*').order('display_order', { ascending: true });
        setMembers(data || []);
    }, []);

    useEffect(() => { fetchItems(); }, [fetchItems]);
    useEffect(() => {
        if (editing) setForm(editing);
        else setForm({ name: '', role: '', photo: '', bio: '', display_order: 99 });
    }, [editing]);

    const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.name === 'display_order' ? parseInt(e.target.value) || 99 : e.target.value }));
    const handleSubmit = async (e) => {
        e.preventDefault();
        const { error } = editing ? await supabase.from('team_members').update(form).eq('id', editing.id) : await supabase.from('team_members').insert(form);
        setMessage(error ? `Erro: ${error.message}`: (editing ? 'Membro atualizado!' : 'Membro adicionado!'));
        setEditing(null);
        await fetchItems();
        setTimeout(() => setMessage(''), 3000);
    };
    const confirmDelete = async () => {
        if (modal.item) {
            await supabase.from('team_members').delete().eq('id', modal.item.id);
            await fetchItems();
        }
        setModal({ isOpen: false, item: null });
    };

    return <>
        <Modal isOpen={modal.isOpen} onClose={() => setModal({ isOpen: false, item: null })} onConfirm={confirmDelete} title="Confirmar Exclusão">Excluir "<strong>{modal.item?.name}</strong>"?</Modal>
        <div className="bg-gray-900 p-8 rounded-lg border border-gray-800 mb-12"><h2 className="text-2xl font-bold mb-6">{editing ? 'Editando Membro' : 'Novo Membro'}</h2><form onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div><label className="block mb-2">Nome</label><input name="name" value={form.name} onChange={handleChange} className="w-full p-2 bg-gray-800 rounded-md" /></div>
                <div><label className="block mb-2">Função</label><input name="role" value={form.role} onChange={handleChange} className="w-full p-2 bg-gray-800 rounded-md" /></div>
                <div><label className="block mb-2">URL da Foto</label><input name="photo" value={form.photo} onChange={handleChange} className="w-full p-2 bg-gray-800 rounded-md" /></div>
                <div><label className="block mb-2">Ordem</label><input type="number" name="display_order" value={form.display_order} onChange={handleChange} className="w-full p-2 bg-gray-800 rounded-md" /></div>
            </div>
            <div className="mb-6"><label className="block mb-2">Bio</label><textarea name="bio" value={form.bio} onChange={handleChange} rows="5" className="w-full p-2 bg-gray-800 rounded-md"></textarea></div>
            {message && <p className="text-center my-4 text-green-500">{message}</p>}
            <div className="flex items-center gap-4"><button type="submit" className="bg-green-500 text-black font-bold py-2 px-6 rounded-md">{editing ? 'Atualizar' : 'Adicionar'}</button>{editing && <button type="button" onClick={() => setEditing(null)} className="bg-gray-600 font-bold py-2 px-6 rounded-md">Cancelar</button>}</div>
        </form></div>
        <div className="bg-gray-900 p-8 rounded-lg border border-gray-800"><h2 className="text-2xl font-bold mb-6">Membros da Equipe</h2><div className="space-y-4">{members.map(item => <div key={item.id} className="flex justify-between items-center bg-black p-4 rounded-md"><p>{item.name}</p><div className="flex gap-2"><button onClick={() => setEditing(item)} className="bg-blue-600 text-xs font-bold py-1 px-3 rounded-md">Editar</button><button onClick={() => setModal({ isOpen: true, item })} className="bg-red-600 text-xs font-bold py-1 px-3 rounded-md">Excluir</button></div></div>)}</div></div>
    </>;
};

const GlossaryManager = () => {
    const [terms, setTerms] = useState([]);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ term: '', definition: '' });
    const [message, setMessage] = useState('');
    const [modal, setModal] = useState({ isOpen: false, item: null });

    const fetchItems = useCallback(async () => {
        const { data } = await supabase.from('glossary').select('*').order('term', { ascending: true });
        setTerms(data || []);
    }, []);

    useEffect(() => { fetchItems(); }, [fetchItems]);
    useEffect(() => {
        if (editing) setForm(editing);
        else setForm({ term: '', definition: '' });
    }, [editing]);

    const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    const handleSubmit = async (e) => {
        e.preventDefault();
        const { error } = editing ? await supabase.from('glossary').update(form).eq('id', editing.id) : await supabase.from('glossary').insert(form);
        setMessage(error ? `Erro: ${error.message}` : (editing ? 'Termo atualizado!' : 'Termo adicionado!'));
        setEditing(null);
        await fetchItems();
        setTimeout(() => setMessage(''), 3000);
    };
    const confirmDelete = async () => {
        if (modal.item) {
            await supabase.from('glossary').delete().eq('id', modal.item.id);
            await fetchItems();
        }
        setModal({ isOpen: false, item: null });
    };

    return <>
        <Modal isOpen={modal.isOpen} onClose={() => setModal({ isOpen: false, item: null })} onConfirm={confirmDelete} title="Confirmar Exclusão">Excluir "<strong>{modal.item?.term}</strong>"?</Modal>
        <div className="bg-gray-900 p-8 rounded-lg border border-gray-800 mb-12"><h2 className="text-2xl font-bold mb-6">{editing ? 'Editando Termo' : 'Novo Termo'}</h2><form onSubmit={handleSubmit}>
            <div className="mb-4"><label className="block mb-2">Termo</label><input name="term" value={form.term} onChange={handleChange} className="w-full p-2 bg-gray-800 rounded-md" /></div>
            <div className="mb-6"><label className="block mb-2">Definição</label><textarea name="definition" value={form.definition} onChange={handleChange} rows="5" className="w-full p-2 bg-gray-800 rounded-md"></textarea></div>
            {message && <p className="text-center my-4 text-green-500">{message}</p>}
            <div className="flex items-center gap-4"><button type="submit" className="bg-green-500 text-black font-bold py-2 px-6 rounded-md">{editing ? 'Atualizar' : 'Adicionar'}</button>{editing && <button type="button" onClick={() => setEditing(null)} className="bg-gray-600 font-bold py-2 px-6 rounded-md">Cancelar</button>}</div>
        </form></div>
        <div className="bg-gray-900 p-8 rounded-lg border border-gray-800"><h2 className="text-2xl font-bold mb-6">Termos do Glossário</h2><div className="space-y-4">{terms.map(item => <div key={item.id} className="flex justify-between items-center bg-black p-4 rounded-md"><p>{item.term}</p><div className="flex gap-2"><button onClick={() => setEditing(item)} className="bg-blue-600 text-xs font-bold py-1 px-3 rounded-md">Editar</button><button onClick={() => setModal({ isOpen: true, item })} className="bg-red-600 text-xs font-bold py-1 px-3 rounded-md">Excluir</button></div></div>)}</div></div>
    </>;
};

const SiteSettingsManager = () => {
    const [settings, setSettings] = useState({});
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        supabase.from('site_settings').select('key, value').then(({ data }) => {
            const settingsMap = (data || []).reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
            setSettings(settingsMap);
        });
    }, []);

    const handleChange = (e) => setSettings(p => ({ ...p, [e.target.name]: e.target.value }));
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const upserts = Object.entries(settings).map(([key, value]) => supabase.from('site_settings').upsert({ key, value }, { onConflict: 'key' }));
        const results = await Promise.all(upserts);
        if (results.some(r => r.error)) setMessage('Erro ao salvar.'); else setMessage('Configurações salvas!');
        setIsSubmitting(false);
        setTimeout(() => setMessage(''), 3000);
    };

    return <div className="bg-gray-900 p-8 rounded-lg border border-gray-800"><h2 className="text-2xl font-bold mb-6">Configurações do Site</h2><form onSubmit={handleSubmit}>
        <div className="space-y-6"><div><label htmlFor="main_banner_url" className="block mb-2">URL do Banner Principal</label><input id="main_banner_url" name="main_banner_url" type="url" value={settings.main_banner_url || ''} onChange={handleChange} className="w-full p-2 bg-gray-800 rounded-md" /><p className="text-sm text-gray-500 mt-1">Banner da página inicial.</p></div></div>
        {message && <p className="text-center my-4 text-green-500">{message}</p>}
        <div className="mt-8"><button type="submit" disabled={isSubmitting} className="bg-green-500 text-black font-bold py-2 px-6 rounded-md disabled:bg-gray-500">{isSubmitting ? 'Salvando...' : 'Salvar'}</button></div>
    </form></div>;
};

const UserManager = ({ user }) => {
    const [message, setMessage] = useState('');
    const handleSubmit = (e) => { e.preventDefault(); setMessage('Funcionalidade deve ser implementada via Edge Function por segurança.'); setTimeout(() => setMessage(''), 5000); };
    return <div className="bg-gray-900 p-8 rounded-lg border border-gray-800"><h2 className="text-2xl font-bold mb-6">Gerenciar Usuários</h2><p className="text-sm text-yellow-400 mb-4 bg-yellow-900/50 p-3 rounded-md"><strong>Aviso:</strong> A criação de usuários requer a chave de `service_role` e não deve ser feita do navegador. Use uma <a href="https://supabase.com/docs/guides/functions" target="_blank" rel="noopener noreferrer" className="underline">Supabase Edge Function</a>.</p><form onSubmit={handleSubmit}><div className="grid md:grid-cols-3 gap-4"><div><label className="block mb-2">E-mail</label><input type="email" className="w-full p-2 bg-gray-800 rounded-md" required /></div><div><label className="block mb-2">Senha</label><input type="password" className="w-full p-2 bg-gray-800 rounded-md" required /></div><div><label className="block mb-2">Permissão</label><select className="w-full p-2 bg-gray-800 rounded-md">{user.role === 'super_admin' && <option value="admin">Admin</option>}<option value="writer">Writer</option></select></div></div>{message && <p className="text-yellow-400 text-center my-4">{message}</p>}<div className="mt-6"><button type="submit" className="bg-green-500 text-black font-bold py-2 px-6 rounded-md">Convidar</button></div></form></div>;
};

// ############################################################################
// 6. COMPONENTE PRINCIPAL DA APLICAÇÃO (App)
// ############################################################################

function App() {
    // Se houver um erro de configuração, renderiza apenas a mensagem de erro.
    if (configError) {
        return <ErrorDisplay error={configError} />;
    }

    return (
        <ErrorBoundary>
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
        </ErrorBoundary>
    );
}
