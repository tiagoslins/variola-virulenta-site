import React from 'react';
import { Link } from 'react-router-dom';

/**
 * A reusable card component to display a preview of an article.
 * @param {object} props - The component props.
 * @param {object} props.article - The article object to display.
 * @returns {JSX.Element} The rendered ArticleCard component.
 */
const ArticleCard = ({ article }) => {
    // Determine the author's name. Prioritize the full_name from the linked profile.
    const authorName = article.profiles?.full_name || article.author_name || 'Autor Desconhecido';
    const articleLink = `/article/${article.id}`;

    return (
        <Link to={articleLink} className="bg-black flex flex-col overflow-hidden group cursor-pointer">
            {article.coverImage && (
                <img 
                    src={article.coverImage} 
                    alt={`Capa do artigo ${article.title}`} 
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/600x400/1a202c/4a5568?text=Imagem+Indisponível'; }}
                />
            )}
            <div className="p-1 pt-3 flex flex-col flex-grow">
                {article.tags?.[0] && (
                    <p className="text-green-500 font-bold text-xs uppercase">{article.tags[0]}</p>
                )}
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-green-400 transition-colors">
                    {article.title}
                </h3>
                <p className="text-gray-500 text-sm mt-auto">Por {authorName}</p>
            </div>
        </Link>
    );
};

export default ArticleCard;
