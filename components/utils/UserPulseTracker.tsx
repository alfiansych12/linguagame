'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { updateUserPulse } from '@/app/actions/userActions';

export function UserPulseTracker() {
    const { data: session } = useSession();

    useEffect(() => {
        if (!session?.user) return;

        // Pulse immediately on mount
        updateUserPulse();

        // Pulse every 1 minute
        const interval = setInterval(() => {
            updateUserPulse();
        }, 1 * 60 * 1000);

        return () => clearInterval(interval);
    }, [session]);

    return null;
}
