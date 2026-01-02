'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAlertStore } from '@/store/alert-store';
import { useSound } from '@/hooks/use-sound';
import { useSession } from 'next-auth/react';

/**
 * Component to handle global system notifications triggered by URL parameters
 * Example: ?intruder=true trigger a mocking alert
 */
export function SystemNotifications() {
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    const { showAlert } = useAlertStore();
    const { playSound } = useSound();

    useEffect(() => {
        const intruder = searchParams.get('intruder');

        if (intruder === 'true') {
            // Remove the param immediately so it doesn't re-trigger on refresh
            const newParams = new URLSearchParams(searchParams.toString());
            newParams.delete('intruder');
            const newUrl = window.location.pathname + (newParams.toString() ? `?${newParams.toString()}` : '');
            window.history.replaceState(null, '', newUrl);

            // ONLY show alert if user IS NOT an admin
            if (!session?.user?.isAdmin) {
                // Play Intruder Sound with slight delay to bypass some browser blocks
                setTimeout(() => {
                    playSound('INTRUDER');
                }, 500);

                // Mocking intruder alert
                showAlert({
                    title: 'Cepu Alert! 🚨',
                    message: 'JANGAN CURANG! Selesaiin misi lo dari awal bro! Gak sopan main loncat-loncat. 💅 Admin is watching you...',
                    type: 'error',
                    confirmLabel: 'Ampun Admin 🙏'
                });
            }
        }
    }, [searchParams, showAlert, playSound, session]);

    return null;
}
