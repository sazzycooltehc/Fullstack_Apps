'use client';

import React from 'react';
import IncidentLogin from './IncidentLogin';
import loginRouter from '@/utils/loginrouter';

const LoginWithRouter = loginRouter(IncidentLogin);

export default function LoginPage() {
  return <LoginWithRouter />;
}
