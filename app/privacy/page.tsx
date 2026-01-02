'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Icon, Button } from '@/components/ui/UIComponents';
import { useRouter } from 'next/navigation';

export default function PrivacyPolicy() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0a0f] text-slate-900 dark:text-white p-6 md:p-20 font-sans">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto space-y-12"
            >
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => router.back()} className="rounded-full size-12 p-0 flex items-center justify-center border border-slate-200 dark:border-slate-800">
                        <Icon name="arrow_back" />
                    </Button>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tighter italic uppercase">Privacy Policy</h1>
                </div>

                <div className="space-y-8 text-slate-600 dark:text-slate-400 leading-relaxed text-sm md:text-base">
                    <section className="space-y-4">
                        <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">1. Information We Collect</h2>
                        <p>
                            At LinguaGame, we prioritize your privacy. We collect minimal information required to provide our educational services, including your nickname, email, and game progress data.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">2. Google AdSense & Cookies</h2>
                        <p>
                            We use Google AdSense to serve advertisements on our platform. Google may use cookies and web beacons to collect data about your visits to this and other websites in order to provide relevant advertisements about goods and services of interest to you.
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Google's use of advertising cookies enables it and its partners to serve ads based on your visit to our sites and/or other sites on the Internet.</li>
                            <li>Users may opt out of personalized advertising by visiting Ads Settings or your browser's cookie settings.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">3. Third-Party Services</h2>
                        <p>
                            We integrate with Midtrans for secure payment processing. Your payment information is handled directly by Midtrans and is never stored on our servers.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">4. Data Protection</h2>
                        <p>
                            We implement security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">5. Contact Us</h2>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us via our official support channels.
                        </p>
                    </section>
                </div>

                <div className="pt-12 border-t border-slate-200 dark:border-slate-800">
                    <p className="text-xs text-slate-500 font-bold">Last Updated: January 2, 2026</p>
                </div>
            </motion.div>
        </div>
    );
}
