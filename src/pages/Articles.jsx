import React, { useState, useEffect } from 'react';
import { supabase } from '../api/supabase';
import ArticleCard from '../components/ArticleCard';

const ArticlesPage = () => {
    const [articles, setArticles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAllArticles = async () => {
            setIsLoading(true);
            const { data, error } = await supabase.from('articles').select('*, profiles(full_name)').order('createdAt', { ascending: false });
            if (error) console.error('Erro ao buscar todos os artigos:', error); else setArticles(data);
            setIsLoading(false);
        };
        fetchAllArticles();
    }, []);

    if (isLoading) {
        return <div className="text-center py-10 text-white">Carregando artigos...</div>;
    }
    
    return (
        <section className="py-16 container mx-auto px-6">
            <h2 className="text-2xl font-extrabold text-white mb-6 border-b-2 border-gray-800 pb-2">Todos os Artigos</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map(article => (
                    <ArticleCard key={article.id} article={article} />
                ))}
            </div>
        </section>
    );
};

export default ArticlesPage;
