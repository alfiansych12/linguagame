'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Icon, Button, Card } from '@/components/ui/UIComponents';
import { useRouter } from 'next/navigation';
import { PageLayout } from '@/components/layout/PageLayout';

export default function AboutPage() {
    const router = useRouter();

    const features = [
        {
            icon: 'psychology',
            title: 'Metode Gamifikasi',
            desc: 'Kami menggabungkan prinsip psikologi game dengan kurikulum bahasa untuk menciptakan motivasi belajar yang berkelanjutan.'
        },
        {
            icon: 'bolt',
            title: 'Interaksi Cepat',
            desc: 'Mode Speed Blitz melatih otak untuk berpikir dalam bahasa Inggris secara instan tanpa menerjemahkan.'
        },
        {
            icon: 'group',
            title: 'Komunitas Global',
            desc: 'Belajar bukan lagi aktivitas soliter. Bersaing, berkolaborasi, dan berkembang bersama ribuan pengguna lain.'
        }
    ];

    return (
        <PageLayout activeTab="home">
            <div className="min-h-screen p-4 md:p-8 lg:p-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto space-y-12 md:space-y-20"
                >
                    {/* Header */}
                    <div className="text-center space-y-6 pt-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4 border border-primary/20">
                            <Icon name="bolt" size={16} filled />
                            <span className="text-[10px] font-black uppercase tracking-widest">Our Mission</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter italic uppercase text-slate-900 dark:text-white leading-[0.9]">
                            Revolusi Cara <br /><span className="text-primary">Belajar Bahasa.</span>
                        </h1>
                        <p className="text-sm md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
                            Kami percaya pendidikan tidak harus membosankan. LinguaGame lahir dari frustrasi melihat metode belajar konvensional yang kaku. Kami hadir untuk mengubah "belajar" menjadi "bermain".
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                        {[
                            { label: 'Users', value: '10K+' },
                            { label: 'Missions', value: '500+' },
                            { label: 'Reviews', value: '4.9/5' },
                            { label: 'Countries', value: 'ID' }
                        ].map((stat, i) => (
                            <div key={i} className="text-center p-6 bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                                <h3 className="text-3xl font-black text-slate-900 dark:text-white italic mb-1">{stat.value}</h3>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Story Section */}
                    <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
                        <div className="space-y-6 order-2 md:order-1">
                            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">
                                Dari Kamar Tidur ke <span className="text-primary">Ribuan User</span>
                            </h2>
                            <div className="space-y-4 text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                                <p>
                                    LinguaGame dimulai sebagai proyek iseng di akhir pekan. Tujuannya sederhana: membuat alat bantu hafal vocab yang tidak bikin ngantuk.
                                </p>
                                <p>
                                    Setelah rilis versi alpha, respons yang kami terima di luar dugaan. Ribuan user mendaftar dalam minggu pertama. Ini membuktikan satu hal: semua orang ingin belajar, tapi tidak semua orang suka cara mereka diajar.
                                </p>
                                <p>
                                    Kini, LinguaGame terus berkembang dengan fitur-fitur canggih seperti AI Tutor dan Real-time PVP, namun visi kami tetap sama: <strong>Make Learning addictive.</strong>
                                </p>
                            </div>
                        </div>
                        <div className="order-1 md:order-2">
                            <div className="aspect-square rounded-[2.5rem] bg-gradient-to-br from-primary to-purple-600 p-1 rotate-3 hover:rotate-0 transition-all duration-500 shadow-2xl">
                                <div className="w-full h-full bg-slate-900 rounded-[2.4rem] relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-slate-900/20 z-10 group-hover:bg-transparent transition-colors duration-500"></div>
                                    <img
                                        src="/kamar.jpg"
                                        alt="Studio Awal LinguaGame"
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid md:grid-cols-3 gap-6">
                        {features.map((feat, i) => (
                            <Card key={i} className="p-6 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30">
                                <div className="size-12 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-primary mb-4">
                                    <Icon name={feat.icon} size={24} filled />
                                </div>
                                <h3 className="text-lg font-black uppercase italic text-slate-900 dark:text-white mb-2">{feat.title}</h3>
                                <p className="text-xs text-slate-500 leading-relaxed">{feat.desc}</p>
                            </Card>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="text-center pt-10 pb-20">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic mb-6">Siap bergabung dengan revolusi?</h2>
                        <Button
                            onClick={() => router.push('/')}
                            className="bg-primary text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest shadow-xl shadow-primary/30 hover:scale-105 transition-all"
                        >
                            Mulai Belajar Gratis
                        </Button>
                    </div>

                </motion.div>
            </div>
        </PageLayout>
    );
}
