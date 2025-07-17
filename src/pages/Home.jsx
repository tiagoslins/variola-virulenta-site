import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../api/supabase';
import ArticleCard from '../components/ArticleCard';

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
            
            if (articlesResult.error) console.error('Erro ao buscar artigos:', articlesResult.error); else setArticles(articlesResult.data || []);
            if (bannerResult.error) console.error('Erro ao buscar banner:', bannerResult.error); else setBannerUrl(bannerResult.data?.value || 'https://placehold.co/1200x400/000000/48bb78?text=Variola+Virulenta');

            setIsLoading(false);
        };
        fetchHomePageData();
    }, []);

    if (isLoading) {
        return <div className="text-center py-10 text-white">Carregando...</div>;
    }
    
    const featuredArticle = articles[0];
    const secondaryArticles = articles.slice(1, 3);
    const moreArticles = articles.slice(3);

    return (
        <>
            <section className="bg-black text-white text-center pt-8">
                <div className="container mx-auto px-6">
                    <img src={bannerUrl} alt="Banner do Podcast Variola Virulenta" className="w-full h-auto object-cover" />
                </div>
            </section>
            <section className="bg-black text-white text-center py-12">
                 <div className="container mx-auto px-6">
                     <h1 className="text-5xl font-extrabold mb-4 text-green-400 tracking-tight">Pensamento Crítico para Transformar a Realidade</h1>
                     <p className="text-xl text-gray-300 max-w-3xl mx-auto">Debates sobre política, economia e história para além do senso comum.</p>
                 </div>
            </section>
            
            {articles.length === 0 ? (
                <div className="text-center py-10 text-white">Nenhum artigo publicado ainda.</div>
            ) : (
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
                    <section className="py-16">
                        <h2 className="text-2xl font-extrabold text-white mb-6 border-b-2 border-gray-800 pb-2">Mais Artigos</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {moreArticles.map(article => (
                                <ArticleCard key={article.id} article={article} />
                            ))}
                        </div>
                    </section>
                </div>
            )}
        </>
    );
};

export default HomePage;
