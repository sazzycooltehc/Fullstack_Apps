'use client'; // important for Next.js App Router

import { useRouter } from 'next/navigation';
import React from 'react';

export default function loginRouter<P>(
  WrappedComponent: React.ComponentType<P & { router: ReturnType<typeof useRouter> }>
) {
  return function Wrapper(props: P) {
    const router = useRouter();
    return <WrappedComponent {...props} router={router} />;
  };
}
