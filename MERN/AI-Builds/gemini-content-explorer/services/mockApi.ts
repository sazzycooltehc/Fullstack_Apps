
import type { User, DropdownOption, Article } from '../types';
import { Flow } from '../types';

const MOCK_DELAY = 500; // ms

const mockData = {
  [Flow.Tech]: {
    categories: [
      { value: 'frontend', label: 'Frontend' },
      { value: 'backend', label: 'Backend' },
      { value: 'ai', label: 'Artificial Intelligence' },
    ],
    topics: {
      frontend: [
        { value: 'react', label: 'React' },
        { value: 'vue', label: 'Vue.js' },
        { value: 'tailwind', label: 'Tailwind CSS' },
      ],
      backend: [
        { value: 'nodejs', label: 'Node.js' },
        { value: 'python', label: 'Python' },
        { value: 'go', label: 'Go' },
      ],
      ai: [
        { value: 'gemini', label: 'Gemini API' },
        { value: 'langchain', label: 'LangChain' },
        { value: 'pytorch', label: 'PyTorch' },
      ],
    },
    articles: (category: string, topic: string) => [...Array(6)].map((_, i) => ({
      id: `${category}-${topic}-${i + 1}`,
      title: `Exploring ${topic} in ${category} - Part ${i + 1}`,
      imageUrl: `https://picsum.photos/seed/${category}${topic}${i}/400/250`,
      snippet: 'Discover the latest trends and techniques. This article delves deep into the core concepts and provides practical examples for implementation.',
      category,
      topic,
    })),
  },
  [Flow.Health]: {
    categories: [
      { value: 'nutrition', label: 'Nutrition' },
      { value: 'fitness', label: 'Fitness' },
      { value: 'mental_health', label: 'Mental Health' },
    ],
    topics: {
      nutrition: [
        { value: 'diets', label: 'Diets' },
        { value: 'supplements', label: 'Supplements' },
      ],
      fitness: [
        { value: 'cardio', label: 'Cardio' },
        { value: 'strength', label: 'Strength Training' },
      ],
      mental_health: [
        { value: 'meditation', label: 'Meditation' },
        { value: 'therapy', label: 'Therapy' },
      ],
    },
     articles: (category: string, topic: string) => [...Array(5)].map((_, i) => ({
      id: `${category}-${topic}-${i + 1}`,
      title: `Improving Your Life with ${topic} - Tip ${i + 1}`,
      imageUrl: `https://picsum.photos/seed/${category}${topic}${i}/400/250`,
      snippet: 'A comprehensive guide to understanding the benefits and practices within this area of health and wellness.',
      category,
      topic,
    })),
  },
  [Flow.Finance]: {
    categories: [
        { value: 'investing', label: 'Investing' },
        { value: 'budgeting', label: 'Budgeting' },
        { value: 'crypto', label: 'Cryptocurrency' },
    ],
    topics: {
        investing: [
            { value: 'stocks', label: 'Stocks' },
            { value: 'bonds', label: 'Bonds' },
        ],
        budgeting: [
            { value: 'personal', label: 'Personal Finance' },
            { value: 'business', label: 'Small Business' },
        ],
        crypto: [
            { value: 'bitcoin', label: 'Bitcoin' },
            { value: 'ethereum', label: 'Ethereum' },
        ],
    },
    articles: (category: string, topic: string) => [...Array(4)].map((_, i) => ({
      id: `${category}-${topic}-${i + 1}`,
      title: `Mastering ${topic} in ${category}`,
      imageUrl: `https://picsum.photos/seed/${category}${topic}${i}/400/250`,
      snippet: 'Unlock financial freedom with our expert insights and strategies on this important financial topic.',
      category,
      topic,
    })),
  },
};

export const loginApi = (user: string, pass: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (user === 'user' && pass === 'password') {
        resolve({ id: '1', name: 'User' });
      } else {
        reject(new Error('Invalid username or password'));
      }
    }, MOCK_DELAY);
  });
};

export const getDropdown1Options = (flow: Flow): Promise<DropdownOption[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockData[flow].categories);
    }, MOCK_DELAY);
  });
};

export const getDropdown2Options = (flow: Flow, category: string): Promise<DropdownOption[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const topics = (mockData[flow].topics as Record<string, DropdownOption[]>)[category] || [];
      resolve(topics);
    }, MOCK_DELAY);
  });
};

export const getArticles = (flow: Flow, category: string, topic: string): Promise<Article[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
        if (!category || !topic) {
            resolve([]);
            return;
        }
      resolve(mockData[flow].articles(category, topic));
    }, MOCK_DELAY + 200);
  });
};
