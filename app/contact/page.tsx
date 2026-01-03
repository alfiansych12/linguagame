'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Icon, Button, Card } from '@/components/ui/UIComponents';
import { useRouter } from 'next/navigation';
import { PageLayout } from '@/components/layout/PageLayout';

export default function ContactPage() {
    const router = useRouter();

    return (
        <PageLayout activeTab="home">
            <div className="min-h-screen p-4 md:p-8 lg:p-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl mx-auto space-y-8"
                >
                    {/* Header */}
                    <div className="text-center space-y-4 pt-8 mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-500 mb-4 border border-emerald-500/20">
                            <Icon name="support_agent" size={16} filled />
                            <span className="text-[10px] font-black uppercase tracking-widest">Support Center</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic uppercase text-slate-900 dark:text-white">
                            Hubungi <span className="text-primary">Tim Kami</span>
                        </h1>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                            Punya pertanyaan, kritik, atau saran? Jangan ragu untuk menghubungi kami. Kami siap membantu bro 24/7 (kalau gak ketiduran).
                        </p>
                    </div>

                    <div className="grid gap-6">
                        {/* Email Card */}
                        <Card className="p-6 md:p-8 flex items-start gap-6 border-2 border-slate-100 dark:border-slate-800 hover:border-primary/50 transition-colors group cursor-pointer">
                            <div className="size-14 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                <Icon name="mail" size={28} filled />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-black uppercase italic text-slate-900 dark:text-white">Email Support</h3>
                                <p className="text-xs text-slate-500 leading-relaxed mb-2">
                                    Untuk pertanyaan umum, kerjasama, dan laporan bug yang mendetail.
                                </p>
                                <a href="mailto:support@linguagame.id" className="text-sm font-bold text-primary hover:underline">
                                    support@linguagame.id
                                </a>
                            </div>
                        </Card>

                        {/* WhatsApp Card */}
                        <Card className="p-6 md:p-8 flex items-start gap-6 border-2 border-slate-100 dark:border-slate-800 hover:border-emerald-500/50 transition-colors group cursor-pointer">
                            <div className="size-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                <Icon name="chat" size={28} filled />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-black uppercase italic text-slate-900 dark:text-white">WhatsApp Community</h3>
                                <p className="text-xs text-slate-500 leading-relaxed mb-2">
                                    Gabung grup komunitas untuk diskusi cepat dan mabar bareng user lain.
                                </p>
                                <a href="#" className="text-sm font-bold text-emerald-500 hover:underline">
                                    Join Community Group
                                </a>
                            </div>
                        </Card>

                        {/* Social Media Card */}
                        <Card className="p-6 md:p-8 flex items-start gap-6 border-2 border-slate-100 dark:border-slate-800 hover:border-purple-500/50 transition-colors group cursor-pointer">
                            <div className="size-14 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                <Icon name="public" size={28} filled />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-black uppercase italic text-slate-900 dark:text-white">Social Media</h3>
                                <p className="text-xs text-slate-500 leading-relaxed mb-2">
                                    Ikuti update terbaru dan tips belajar harian di sosial media kami.
                                </p>
                                <div className="flex gap-4">
                                    <a href="#" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Instagram</a>
                                    <a href="#" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">Twitter (X)</a>
                                    <a href="#" className="text-sm font-bold text-slate-400 hover:text-white transition-colors">TikTok</a>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div className="text-center pt-8 text-xs text-slate-400">
                        <p>Kantor Operasional (Virtual Office):</p>
                        <p className="font-bold text-slate-300 mt-1">Cyber 2 Tower, Jl. H. R. Rasuna Said, Jakarta Selatan, 12950</p>
                        <p className="mt-4 italic opacity-50">Note: Kunjungan fisik hanya dengan perjanjian.</p>
                    </div>

                </motion.div>
            </div>
        </PageLayout>
    );
}
