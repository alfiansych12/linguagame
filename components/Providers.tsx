'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

import { LinguaAlert } from './ui/LinguaAlert';
import { SystemNotifications } from './ui/SystemNotifications';

import { UserPulseTracker } from './utils/UserPulseTracker';

export default function Providers({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            <UserPulseTracker />
            {children}
            <LinguaAlert />
            <SystemNotifications />
        </SessionProvider>
    );
}
