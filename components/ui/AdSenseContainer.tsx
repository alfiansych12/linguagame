'use client';

import React, { useEffect } from 'react';
import { useUserStore } from '@/store/user-store';

interface AdSenseContainerProps {
    slot: string;
    format?: 'auto' | 'fluid' | 'rectangle';
    responsive?: 'true' | 'false';
    className?: string;
}

/**
 * TACTICAL ADSENSE CONTAINER
 * Only renders for FREE users.
 */
export const AdSenseContainer: React.FC<AdSenseContainerProps> = ({
    slot,
    format = 'auto',
    responsive = 'true',
    className = ""
}) => {
    const { isPro } = useUserStore();
    const pubId = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID;

    useEffect(() => {
        // Only run on client and if NOT PRO and Pub ID exists
        if (typeof window !== 'undefined' && !isPro && pubId) {
            try {
                // @ts-ignore
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            } catch (err) {
                console.error('AdSense push error:', err);
            }
        }
    }, [isPro, pubId]);

    // 1. Hide for PRO users
    if (isPro) return null;

    // 2. Warn if Pub ID is missing (for dev)
    if (!pubId) {
        return (
            <div className={`p-4 bg-slate-800/50 border border-dashed border-slate-700 rounded-xl text-center ${className}`}>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    ADSENSE_PUB_ID MISSING IN ENV
                </p>
            </div>
        );
    }

    // 3. Render Ad Unit
    return (
        <div className={`adsense-wrapper overflow-hidden min-h-[100px] flex items-center justify-center ${className}`}>
            <ins
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client={pubId}
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive={responsive}
            />
        </div>
    );
};
