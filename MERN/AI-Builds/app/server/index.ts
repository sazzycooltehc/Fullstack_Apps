import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3001;

// Enable CORS for all routes to allow client to communicate with the server
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// API route that the React client will call
app.get('/api/message', (req: Request, res: Response) => {
  res.json({ message: 'Hello from the Node.js server! 👋' });
});

// Login endpoint
app.post('/api/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  // In a real app, you'd validate against a database.
  // Here, we'll use hardcoded credentials for demonstration.
  if (username === 'admin' && password === 'password') {
    res.json({
      success: true,
      message: 'Login successful!',
      // In a real app, you'd generate a real JWT.
      token: 'dummy-jwt-token-for-admin',
      user: {
        username: 'admin',
        name: 'Super User'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid username or password.',
    });
  }
});

app.listen(port, () => {
  console.log(`Node.js server is listening on port ${port}`);
});