import React from 'react';
import type { Article } from '../types';

interface ArticleCardProps {
  article: Article;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  return (
    <div className="bg-card-bg rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
      <img className="w-full h-48 object-cover" src={article.imageUrl} alt={article.title} />
      <div className="p-6">
        <h3 className="text-xl font-bold text-text-main mb-2 truncate">{article.title}</h3>
        <p className="text-text-light text-sm mb-4 line-clamp-3">{article.snippet}</p>
        <div className="flex space-x-2">
            <span className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-0.5 rounded-full">{article.category}</span>
            <span className="bg-secondary/10 text-secondary text-xs font-semibold px-2.5 py-0.5 rounded-full">{article.topic}</span>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
