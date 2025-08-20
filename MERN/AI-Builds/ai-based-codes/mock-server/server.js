const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3001;

// --- CORS Configuration ---
const corsOptions = {
  origin: '*', // Allow all origins for development
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());


const MOCK_DELAY = 500; // ms

const mockData = {
  tech: {
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
    articles: (category, topic) => [...Array(6)].map((_, i) => ({
      id: `${category}-${topic}-${i + 1}`,
      title: `Exploring ${topic} in ${category} - Part ${i + 1}`,
      imageUrl: `https://picsum.photos/seed/${category}${topic}${i}/400/250`,
      snippet: 'Discover the latest trends and techniques. This article delves deep into the core concepts and provides practical examples for implementation.',
      category,
      topic,
    })),
  },
  health: {
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
     articles: (category, topic) => [...Array(5)].map((_, i) => ({
      id: `${category}-${topic}-${i + 1}`,
      title: `Improving Your Life with ${topic} - Tip ${i + 1}`,
      imageUrl: `https://picsum.photos/seed/${category}${topic}${i}/400/250`,
      snippet: 'A comprehensive guide to understanding the benefits and practices within this area of health and wellness.',
      category,
      topic,
    })),
  },
  finance: {
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
    articles: (category, topic) => [...Array(4)].map((_, i) => ({
      id: `${category}-${topic}-${i + 1}`,
      title: `Mastering ${topic} in ${category}`,
      imageUrl: `https://picsum.photos/seed/${category}${topic}${i}/400/250`,
      snippet: 'Unlock financial freedom with our expert insights and strategies on this important financial topic.',
      category,
      topic,
    })),
  },
};

// --- API Endpoints ---

// POST /api/login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  setTimeout(() => {
    if (username === 'user' && password === 'password') {
      res.json({ id: '1', name: 'User' });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  }, MOCK_DELAY);
});

// GET /api/dropdown1-options/:flow
app.get('/api/dropdown1-options/:flow', (req, res) => {
    const { flow } = req.params;
    setTimeout(() => {
        if (mockData[flow]) {
            res.json(mockData[flow].categories);
        } else {
            res.status(404).json({ message: 'Flow not found' });
        }
    }, MOCK_DELAY);
});

// GET /api/dropdown2-options/:flow/:category
app.get('/api/dropdown2-options/:flow/:category', (req, res) => {
    const { flow, category } = req.params;
    setTimeout(() => {
        const flowData = mockData[flow];
        if (flowData) {
            const topics = flowData.topics[category] || [];
            res.json(topics);
        } else {
            res.status(404).json({ message: 'Flow or category not found' });
        }
    }, MOCK_DELAY);
});

// GET /api/articles/:flow/:category/:topic
app.get('/api/articles/:flow/:category/:topic', (req, res) => {
    const { flow, category, topic } = req.params;
     setTimeout(() => {
        if (mockData[flow] && mockData[flow].articles) {
            res.json(mockData[flow].articles(category, topic));
        } else {
            res.status(404).json({ message: 'Flow not found' });
        }
    }, MOCK_DELAY + 200);
});

app.listen(port, () => {
  console.log(`Mock API server available at http://localhost:${port}`);
});
