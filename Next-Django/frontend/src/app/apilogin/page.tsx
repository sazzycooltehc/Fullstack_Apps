// pages/login.tsx
'use client';

import { environments } from '@/utils/environments';
import { useState } from 'react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const res = await fetch( environments.development.apiUrl, {
      method: 'POST',
      credentials: 'include',  // Important for cookies
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok) {
      alert('Login successful');
      // Optionally redirect
    } else {
      alert(data.error);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" />
      <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}
