'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

import { LinguaAlert } from './ui/LinguaAlert';

export default function Providers({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            {children}
            <LinguaAlert />
        </SessionProvider>
    );
}
