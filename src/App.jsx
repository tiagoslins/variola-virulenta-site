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
                                <div className="cursor-pointer group" onClick={() => window.location.hash = `#/article/${featuredArticle.id}`}>
                                    {featuredArticle.coverImage && <img src={featuredArticle.coverImage} alt="" className="w-full h-auto object-cover mb-4"/>}
                                    <p className="text-green-500 font-bold text-sm uppercase">{featuredArticle.tags?.[0]}</p>
                                    <h1 className="text-3xl md:text-5xl font-extrabold text-white my-2 group-hover:text-green-400 transition-colors">{featuredArticle.title}</h1>
                                    <p className="text-gray-400 font-serif text-lg">{featuredArticle.content.substring(0, 150)}...</p>
                                    <p className="text-gray-500 text-sm mt-2">Por {featuredArticle.author_name || 'Autor Desconhecido'}</p>
                                </div>
                            </div>
                        )}
                        <div className="space-y-8">
                            {secondaryArticles.map(article => (
                                 <div key={article.id} className="cursor-pointer group" onClick={() => window.location.hash = `#/article/${article.id}`}>
                                     {article.coverImage && <img src={article.coverImage} alt="" className="w-full h-40 object-cover mb-2"/>}
                                     <p className="text-green-500 font-bold text-sm uppercase">{article.tags?.[0]}</p>
                                     <h2 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors">{article.title}</h2>
                                     <p className="text-gray-500 text-sm mt-1">Por {article.author_name || 'Autor Desconhecido'}</p>
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

// ... (Restante do código, incluindo ArticlesPage, SingleArticlePage, etc., permanece o mesmo)

// --- COMPONENTE PRINCIPAL ---

export default function App() {
    const [page, setPage] = useState({ name: 'home', data: null });
    const [userProfile, setUserProfile] = useState(null);
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
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
            setIsLoading(false);
        };
        
        checkUser();

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
            case 'article': return <SingleArticlePage articleId={page.data} />;
            case 'episodes': return <EpisodesPage onPlay={handlePlay} />;
            case 'glossary': return <GlossaryPage />;
            case 'team': return <TeamPage />;
            case 'bio': return <BioPage memberId={page.data} />;
            case 'tag': return <TagPage tag={page.data} />;
            case 'search': return <SearchPage query={page.data} />;
            case 'login': return <LoginPage />;
            case 'dashboard': return userProfile ? <DashboardPage user={userProfile} /> : <LoginPage />;
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
