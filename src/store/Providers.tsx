// File: /src/store/Providers.tsx
'use client';
import { Provider } from 'react-redux';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { store } from './store';

export function Providers({ children }: { children: React.ReactNode }) {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    (window as Window & { __CC_STORE__?: typeof store }).__CC_STORE__ = store;
  }

  return (
    <NuqsAdapter>
      <Provider store={store}>{children}</Provider>
    </NuqsAdapter>
  );
}

export default Providers;
