import React, { useState, useEffect, useCallback } from 'react';
import type { DropdownOption, Article } from '../types';
import { Flow } from '../types';
import { getDropdown1Options, getDropdown2Options, getArticles } from '../services/mockApi';
import Combobox from './Combobox';
import ArticleCard from './ArticleCard';

interface FlowPageProps {
  flowType: Flow;
  config: {
    title: string;
    categoryLabel: string;
    topicLabel: string;
  };
}

const FlowPage: React.FC<FlowPageProps> = ({ flowType, config }) => {
  const [d1Options, setD1Options] = useState<DropdownOption[]>([]);
  const [d1Selected, setD1Selected] = useState<DropdownOption | null>(null);

  const [d2Options, setD2Options] = useState<DropdownOption[]>([]);
  const [d2Selected, setD2Selected] = useState<DropdownOption | null>(null);

  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState({
    d1: true,
    d2: false,
    articles: false,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(prev => ({ ...prev, d1: true }));
    getDropdown1Options(flowType)
      .then(options => {
        setD1Options(options);
      })
      .catch(() => setError('Failed to load categories.'))
      .finally(() => setIsLoading(prev => ({ ...prev, d1: false })));
  }, [flowType]);

  useEffect(() => {
    if (d1Selected) {
      setIsLoading(prev => ({ ...prev, d2: true }));
      setD2Options([]);
      getDropdown2Options(flowType, d1Selected.value)
        .then(options => {
          setD2Options(options);
        })
        .catch(() => setError('Failed to load topics.'))
        .finally(() => setIsLoading(prev => ({ ...prev, d2: false })));
    } else {
      setD2Options([]);
    }
  }, [d1Selected, flowType]);

  const handleD1Change = (option: DropdownOption | null) => {
    setD1Selected(option);
    setD2Selected(null);
    setArticles([]);
  };

  const handleD2Change = (option: DropdownOption | null) => {
    setD2Selected(option);
    setArticles([]);
  };

  const handleSubmit = useCallback(() => {
    if (!d1Selected || !d2Selected) return;
    setIsLoading(prev => ({ ...prev, articles: true }));
    setArticles([]);
    setError(null);
    getArticles(flowType, d1Selected.value, d2Selected.value)
      .then(data => {
        setArticles(data);
      })
      .catch(() => setError('Failed to fetch articles.'))
      .finally(() => setIsLoading(prev => ({ ...prev, articles: false })));
  }, [d1Selected, d2Selected, flowType]);

  return (
    <div className="container mx-auto">
      <h1 className="text-4xl font-bold text-text-main mb-8">{config.title}</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Column: Filters */}
        <aside className="md:w-1/3 lg:w-1/4">
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-8">
            <div className="flex flex-col gap-6">
              <Combobox
                label={config.categoryLabel}
                options={d1Options}
                value={d1Selected}
                onChange={handleD1Change}
                loading={isLoading.d1}
                placeholder="Select a category..."
              />
              <Combobox
                label={config.topicLabel}
                options={d2Options}
                value={d2Selected}
                onChange={handleD2Change}
                loading={isLoading.d2}
                disabled={!d1Selected}
                placeholder="Select a topic..."
              />
              <div>
                <button
                  onClick={handleSubmit}
                  disabled={!d1Selected || !d2Selected || isLoading.articles}
                  className="w-full bg-secondary text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-600 transition-colors duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isLoading.articles ? 'Loading...' : 'Show Articles'}
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Column: Articles */}
        <div className="flex-1">
          {isLoading.articles && <div className="text-center p-10 font-semibold">Loading articles...</div>}
          {error && <div className="text-center p-10 text-red-500">{error}</div>}
          
          {!isLoading.articles && articles.length === 0 && d1Selected && d2Selected && (
            <div className="text-center p-10 bg-white rounded-lg shadow-md">
              <h3 className="text-xl font-semibold">No Articles Found</h3>
              <p className="text-text-light">No articles match your selected criteria. Try a different combination.</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {articles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowPage;
