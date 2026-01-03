'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Icon, Button } from '@/components/ui/UIComponents';
import { useRouter } from 'next/navigation';

export default function TermsOfService() {
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
                    <h1 className="text-3xl md:text-5xl font-black tracking-tighter italic uppercase">Terms of Service</h1>
                </div>

                <div className="space-y-8 text-slate-600 dark:text-slate-400 leading-relaxed text-sm md:text-base">
                    <section className="space-y-4">
                        <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">1. Acceptance of Terms</h2>
                        <p>
                            By accessing and using LinguaGame, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">2. Use of Services</h2>
                        <p>
                            LinguaGame provides educational gaming experiences. You agree to use the service only for lawful purposes and in accordance with these Terms.
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>You must not use the service to harass, abuse, or harm others.</li>
                            <li>You are responsible for maintaining the confidentiality of your account information.</li>
                            <li>Cheating or exploiting game mechanics is prohibited.</li>
                        </ul>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">3. User Content</h2>
                        <p>
                            You retain ownership of any content you submit to the service (e.g., profile names). By submitting content, you grant LinguaGame a license to use, display, and distribute such content in connection with the service.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">4. Intellectual Property</h2>
                        <p>
                            All content included in LinguaGame, such as text, graphics, logos, and code, is the property of LinguaGame or its licensors and is protected by copyright laws.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">5. Termination</h2>
                        <p>
                            We reserve the right to terminate or suspend your account at our sole discretion, without notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties, or for any other reason.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">6. Changes to Terms</h2>
                        <p>
                            We reserve the right to modify these specific terms at any time. We will provide notice of significant changes by updating the date at the bottom of this page.
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
