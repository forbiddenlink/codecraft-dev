// File: /src/store/Providers.tsx
'use client';
import { Provider } from 'react-redux';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { store } from './store';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NuqsAdapter>
      <Provider store={store}>{children}</Provider>
    </NuqsAdapter>
  );
}

export default Providers;
