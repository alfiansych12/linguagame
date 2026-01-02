'use client';

import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, Icon, Button } from '@/components/ui/UIComponents';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function GrammarGuide() {
    const router = useRouter();

    const sections = [
        {
            title: 'Simple Present: Si Paling Rutinitas',
            icon: 'cycle',
            color: 'bg-emerald-500',
            description: 'Buat bahas hobi, fakta unik, atau jadwal mabar bro yang rutin.',
            content: (
                <div className="space-y-10">
                    {/* 1. VERBAL SENTENCE */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <Badge color="bg-emerald-600">1. Kalimat Verbal</Badge>
                            <p className="text-[10px] font-black uppercase text-slate-400">Pake Kata Kerja (Action)</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {/* POSITIVE */}
                            <div className="bg-white dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-100 dark:border-emerald-900/20 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="size-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[10px] font-black">+</div>
                                    <h4 className="font-black text-slate-900 dark:text-white text-sm uppercase italic">Positif (Pernyataan)</h4>
                                </div>
                                <div className="space-y-4">
                                    <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                                        <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase mb-2">Formula</p>
                                        <p className="text-lg font-black text-slate-900 dark:text-white italic leading-none">Subjek + Verb 1 (+ s/es)</p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <Example text="I / You / We / They eat" />
                                        <Example highlight="rose" text="She / He / It eats" />
                                    </div>
                                </div>
                            </div>

                            {/* NEGATIVE */}
                            <div className="bg-white dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-100 dark:border-rose-900/20 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="size-6 bg-rose-500 rounded-full flex items-center justify-center text-white text-[10px] font-black">-</div>
                                    <h4 className="font-black text-slate-900 dark:text-white text-sm uppercase italic">Negatif (Penolakan)</h4>
                                </div>
                                <div className="space-y-4">
                                    <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl border border-rose-100 dark:border-rose-900/30">
                                        <p className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase mb-2">Formula</p>
                                        <p className="text-lg font-black text-slate-900 dark:text-white italic leading-none">Subjek + <span className="text-rose-500">Do/Does + Not</span> + Verb 1 (Polos)</p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <Example text="I do not (don't) eat" />
                                        <Example highlight="rose" text="She does not (doesn't) eat" />
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-bold italic bg-rose-50 dark:bg-rose-950/10 px-3 py-2 rounded-lg border border-rose-100/50">
                                        🔥 Tips: Kalau udah ada <span className="text-rose-500">Does</span>, akhiran 's' di kata kerja wajib hilang!
                                    </p>
                                </div>
                            </div>

                            {/* QUESTION */}
                            <div className="bg-white dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-100 dark:border-blue-900/20 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="size-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px] font-black">?</div>
                                    <h4 className="font-black text-slate-900 dark:text-white text-sm uppercase italic">Interogatif (Tanya)</h4>
                                </div>
                                <div className="space-y-4">
                                    <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                                        <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase mb-2">Formula</p>
                                        <p className="text-lg font-black text-slate-900 dark:text-white italic leading-none"><span className="text-blue-500">Do/Does</span> + Subjek + Verb 1 (Polos)?</p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <Example text="Do you eat?" />
                                        <Example highlight="rose" text="Does he eat?" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SPELLING RULES */}
                        <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl overflow-hidden relative group">
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <Icon name="spellcheck" size={20} className="text-primary" />
                                    <h4 className="font-black text-sm uppercase italic tracking-wider text-primary">Aturan Tambahan "s/es"</h4>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase">Akhiran -ch, -sh, -s, -x, -o</p>
                                        <div className="text-xs font-bold text-slate-200">Watch ➡️ <span className="text-primary italic">Watches</span></div>
                                        <div className="text-xs font-bold text-slate-200">Go ➡️ <span className="text-primary italic">Goes</span></div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase">Akhiran Konsonan + Y</p>
                                        <div className="text-xs font-bold text-slate-200">Study ➡️ <span className="text-primary italic">Studies</span></div>
                                        <div className="text-xs font-bold text-slate-200">Cry ➡️ <span className="text-primary italic">Cries</span></div>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 size-32 bg-primary/10 rounded-full blur-3xl"></div>
                        </div>
                    </div>

                    {/* 2. NOMINAL SENTENCE */}
                    <div className="space-y-6 pt-10 border-t border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <Badge color="bg-blue-600">2. Kalimat Nominal</Badge>
                            <p className="text-[10px] font-black uppercase text-slate-400">Pake To Be (Am/Is/Are)</p>
                        </div>
                        <div className="bg-blue-50/50 dark:bg-blue-900/10 p-8 rounded-[2.5rem] border border-blue-100 dark:border-blue-900/20">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                                <div className="p-4 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                                    <div className="text-2xl font-black text-blue-600 mb-1">Am</div>
                                    <p className="text-[10px] font-black uppercase text-slate-400">Gunakan Untuk</p>
                                    <p className="text-xl font-black text-slate-900 dark:text-white italic">I</p>
                                </div>
                                <div className="p-4 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                                    <div className="text-2xl font-black text-rose-600 mb-1">Is</div>
                                    <p className="text-[10px] font-black uppercase text-slate-400">Gunakan Untuk</p>
                                    <p className="text-xl font-black text-slate-900 dark:text-white italic">She, He, It</p>
                                </div>
                                <div className="p-4 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                                    <div className="text-2xl font-black text-emerald-600 mb-1">Are</div>
                                    <p className="text-[10px] font-black uppercase text-slate-400">Gunakan Untuk</p>
                                    <p className="text-xl font-black text-slate-900 dark:text-white italic">You, We, They</p>
                                </div>
                            </div>
                            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <Example text="I am a student" />
                                <Example highlight="rose" text="He is cool" />
                                <Example highlight="blue" text="They are kind" />
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: 'Present Continuous: Lagi Beraksi!',
            icon: 'bolt',
            color: 'bg-purple-500',
            description: 'Buat aksi yang lagi dilakuin detik ini juga, no cap!',
            content: (
                <div className="space-y-10">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <Badge color="bg-purple-600">The Action Formula</Badge>
                            <p className="text-[10px] font-black uppercase text-slate-400">Sedang Berlangsung Sekarang</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {/* POSITIVE */}
                            <div className="bg-white dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-100 dark:border-purple-900/20 shadow-sm transition-all hover:shadow-md">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="size-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[10px] font-black">+</div>
                                    <h4 className="font-black text-slate-900 dark:text-white text-sm uppercase italic">Positif (Lagi Dilakuin)</h4>
                                </div>
                                <div className="space-y-4">
                                    <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 rounded-2xl border border-purple-100 dark:border-purple-900/30">
                                        <p className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase mb-2">Formula</p>
                                        <p className="text-lg font-black text-slate-900 dark:text-white italic leading-none">S + <span className="text-purple-500">Am/Is/Are</span> + Verb-ing</p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <Example text="I am playing game" />
                                        <Example highlight="rose" text="They are winning" />
                                    </div>
                                </div>
                            </div>

                            {/* NEGATIVE */}
                            <div className="bg-white dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-100 dark:border-rose-900/20 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="size-6 bg-rose-500 rounded-full flex items-center justify-center text-white text-[10px] font-black">-</div>
                                    <h4 className="font-black text-slate-900 dark:text-white text-sm uppercase italic">Negatif (Gak Lagi Dilakuin)</h4>
                                </div>
                                <div className="space-y-4">
                                    <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl border border-rose-100 dark:border-rose-900/30">
                                        <p className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase mb-2">Formula</p>
                                        <p className="text-lg font-black text-slate-900 dark:text-white italic leading-none">S + <span className="text-purple-500">Am/Is/Are</span> + <span className="text-rose-500">Not</span> + Verb-ing</p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <Example text="I am not studying" />
                                        <Example highlight="rose" text="She isn't eating" />
                                    </div>
                                </div>
                            </div>

                            {/* QUESTION */}
                            <div className="bg-white dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-100 dark:border-blue-900/20 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="size-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px] font-black">?</div>
                                    <h4 className="font-black text-slate-900 dark:text-white text-sm uppercase italic">Interogatif (Tanya)</h4>
                                </div>
                                <div className="space-y-4">
                                    <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                                        <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase mb-2">Formula</p>
                                        <p className="text-lg font-black text-slate-900 dark:text-white italic leading-none"><span className="text-purple-500">Am/Is/Are</span> + S + Verb-ing?</p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <Example text="Are you sleeping?" />
                                        <Example highlight="rose" text="Is he playing?" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-900 text-white rounded-3xl border-2 border-primary/20 relative overflow-hidden">
                            <div className="relative z-10 space-y-4">
                                <div className="flex items-center gap-2">
                                    <Icon name="history" size={20} className="text-primary" />
                                    <p className="text-[10px] font-black uppercase text-primary tracking-widest">Time Signals (Kode Waktu)</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {['Now', 'Right now', 'At the moment', 'Today', 'Tonight', 'Listen!', 'Look!'].map(time => (
                                        <span key={time} className="px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black text-slate-300 border border-white/5 uppercase italic">{time}</span>
                                    ))}
                                </div>
                            </div>
                            <Icon name="bolt" size={100} className="absolute -bottom-10 -right-10 opacity-5 text-white" filled />
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: 'Present Perfect: Udah Selesai, Slay!',
            icon: 'done_all',
            color: 'bg-blue-500',
            description: 'Buat aksi yang baru aja kelar atau hasilnya masih kerasa sampe sekarang.',
            content: (
                <div className="space-y-10">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <Badge color="bg-blue-600">The "Udah" Formula</Badge>
                            <p className="text-[10px] font-black uppercase text-slate-400">Aksi yang Terjadi</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {/* POSITIVE */}
                            <div className="bg-white dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-100 dark:border-blue-900/20 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="size-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[10px] font-black">+</div>
                                    <h4 className="font-black text-slate-900 dark:text-white text-sm uppercase italic">Positif (Sudah Dilakukan)</h4>
                                </div>
                                <div className="space-y-4">
                                    <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                                        <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase mb-2">Formula</p>
                                        <p className="text-lg font-black text-slate-900 dark:text-white italic leading-none">S + <span className="text-blue-500">Have/Has</span> + <span className="text-primary italic">Verb 3</span></p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Have (I,You,We,They)</p>
                                            <Example text="I have eaten" />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Has (She,He,It)</p>
                                            <Example highlight="rose" text="She has finished" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* NEGATIVE */}
                            <div className="bg-white dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-100 dark:border-rose-900/20 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="size-6 bg-rose-500 rounded-full flex items-center justify-center text-white text-[10px] font-black">-</div>
                                    <h4 className="font-black text-slate-900 dark:text-white text-sm uppercase italic">Negatif (Belum Dilakukan)</h4>
                                </div>
                                <div className="space-y-4">
                                    <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl border border-rose-100 dark:border-rose-900/30">
                                        <p className="text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase mb-2">Formula</p>
                                        <p className="text-lg font-black text-slate-900 dark:text-white italic leading-none">S + <span className="text-blue-500">Have/Has</span> + <span className="text-rose-500">Not</span> + <span className="text-primary italic">Verb 3</span></p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <Example text="I haven't eaten" />
                                        <Example highlight="rose" text="She hasn't left" />
                                    </div>
                                </div>
                            </div>

                            {/* QUESTION */}
                            <div className="bg-white dark:bg-slate-900/60 p-6 rounded-3xl border border-slate-100 dark:border-blue-900/20 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="size-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-[10px] font-black">?</div>
                                    <h4 className="font-black text-slate-900 dark:text-white text-sm uppercase italic">Interogatif (Tanya)</h4>
                                </div>
                                <div className="space-y-4">
                                    <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                                        <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase mb-2">Formula</p>
                                        <p className="text-lg font-black text-slate-900 dark:text-white italic leading-none"><span className="text-blue-500">Have/Has</span> + S + <span className="text-primary italic">Verb 3</span>?</p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <Example text="Have you eaten?" />
                                        <Example highlight="rose" text="Has she gone?" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-blue-50/50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-900/20">
                            <h4 className="font-black text-slate-900 dark:text-white text-[10px] uppercase italic mb-4 tracking-widest text-center">Spesial Marker</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[
                                    { label: 'Just', desc: 'Baru saja' },
                                    { label: 'Already', desc: 'Sudah' },
                                    { label: 'Yet', desc: 'Belum' },
                                    { label: 'Ever', desc: 'Pernah' }
                                ].map(item => (
                                    <div key={item.label} className="p-3 bg-white dark:bg-slate-800 rounded-2xl text-center shadow-sm border border-slate-100 dark:border-slate-700">
                                        <div className="text-xs font-black text-blue-600 uppercase">{item.label}</div>
                                        <div className="text-[10px] font-bold text-slate-400">{item.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: 'Tips Anti Gagal Grammar',
            icon: 'verified',
            color: 'bg-amber-500',
            description: 'Biar bro kamu gak malu-maluin pas ngomong inggris!',
            content: (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-5 bg-white dark:bg-slate-900/60 rounded-3xl border-2 border-amber-500/10 hover:border-amber-500/30 transition-all">
                        <div className="size-8 bg-amber-500 rounded-lg flex items-center justify-center text-white mb-3">
                            <Icon name="priority_high" size={20} filled />
                        </div>
                        <h4 className="font-black text-slate-900 dark:text-white text-sm uppercase italic mb-2 tracking-tight">Kapan Verb Tanpa S?</h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">Pas subjeknya banyak (We, They) atau ada "Don't" dan "Doesn't". Kerjanya balik polos lagi!</p>
                    </div>
                    <div className="p-5 bg-white dark:bg-slate-900/60 rounded-3xl border-2 border-primary/10 hover:border-primary/30 transition-all">
                        <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white mb-3">
                            <Icon name="history" size={20} filled />
                        </div>
                        <h4 className="font-black text-slate-900 dark:text-white text-sm uppercase italic mb-2 tracking-tight">Cek Waktu Bro!</h4>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">Kalau ngomongin fakta umum (Bumi itu bulat), pake Simple Present. Kalau lagi mabar sekarang, pake Continuous!</p>
                    </div>
                </div>
            )
        }
    ];

    return (
        <PageLayout activeTab="home">
            <div className="max-w-4xl mx-auto px-4 py-8 md:py-16">
                {/* Header Section */}
                <div className="mb-12 text-center space-y-4">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors font-black uppercase text-[10px] tracking-widest group mx-auto"
                    >
                        <Icon name="arrow_back" size={18} className="group-hover:-translate-x-1 transition-transform" />
                        Balik ke Jalur Utama
                    </button>

                    <div className="relative inline-block">
                        <div className="size-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/5">
                            <Icon name="history_edu" className="text-primary" size={48} filled />
                        </div>
                        <div className="absolute -top-1 -right-1 size-8 bg-purple-500 text-white rounded-full flex items-center justify-center animate-bounce-gentle shadow-lg shadow-purple-500/30">
                            <Icon name="grade" size={16} filled />
                        </div>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter leading-[0.85] mb-4">
                        Kitab <span className="text-primary">Tata Bahasa</span>
                    </h1>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px] md:text-xs max-w-lg mx-auto leading-relaxed">
                        Baca bentar, pinter selamanya. <span className="text-primary">Mastering the language</span> buat bro mabar yang lebih cerdas! 💅🛡️💎
                    </p>
                </div>

                {/* Methodology Content */}
                <div className="space-y-6 md:space-y-12 pb-10 md:pb-20">
                    {sections.map((section, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ delay: idx * 0.1, duration: 0.5 }}
                        >
                            <Card className="p-4 md:p-8 lg:p-12 border-2 border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative">
                                <div className="absolute -top-10 md:-top-20 -right-10 md:-right-20 size-40 md:size-60 bg-primary/5 rounded-full blur-[60px] md:blur-[80px] pointer-events-none"></div>

                                <div className="flex flex-col gap-6 md:gap-10 lg:gap-14">
                                    <div className="flex flex-col items-center md:items-start text-center md:text-left">
                                        <div className={`size-12 md:size-16 ${section.color} rounded-xl md:rounded-2xl flex items-center justify-center text-white mb-4 md:mb-6 shadow-lg shadow-current/20 scale-105 md:scale-110`}>
                                            <Icon name={section.icon} size={24} mdSize={32} filled />
                                        </div>
                                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mb-3 md:mb-4">
                                            {section.title}
                                        </h2>
                                        <div className="h-1 md:h-1.5 w-12 md:w-16 bg-primary/10 rounded-full mb-4 md:mb-6"></div>
                                        <p className="text-[10px] md:text-xs lg:text-sm text-slate-400 font-bold uppercase tracking-widest leading-relaxed max-w-xs md:max-w-md">
                                            {section.description}
                                        </p>
                                    </div>

                                    <div className="bg-slate-50/50 dark:bg-slate-900/30 p-3 md:p-6 lg:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 dark:border-slate-800/50 flex-1">
                                        {section.content}
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}

                    {/* CTA Footer */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="text-center pt-6 md:pt-10"
                    >
                        <Card className="p-8 md:p-12 lg:p-16 bg-slate-900 text-white rounded-[2.5rem] md:rounded-[4rem] shadow-2xl overflow-hidden relative group">
                            <div className="relative z-10 space-y-2">
                                <div className="size-12 md:size-16 bg-white/10 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6 backdrop-blur-md">
                                    <Icon name="rocket_launch" size={24} mdSize={32} filled className="text-white animate-pulse" />
                                </div>
                                <h3 className="text-2xl md:text-4xl lg:text-5xl font-black uppercase italic tracking-tighter mb-3 md:mb-4">Udah Siap Slay di Arena?</h3>
                                <p className="text-slate-400 font-black text-[8px] md:text-[10px] lg:text-xs uppercase tracking-[0.2em] md:tracking-[0.4em] mb-6 md:mb-10 leading-relaxed max-w-md mx-auto">Teori udah di tangan, sekarang buktiin skill tata bahasa kamu ke seluruh bro!</p>
                                <Button
                                    onClick={() => router.push('/')}
                                    variant="white"
                                    className="px-8 md:px-14 py-4 md:py-8 h-auto text-primary rounded-xl md:rounded-[2rem] font-black uppercase tracking-widest shadow-2xl shadow-white/10 active:scale-95 transition-all text-xs md:text-sm"
                                    icon="play_arrow"
                                >
                                    GAS MAIN SEKARANG!
                                </Button>
                            </div>
                            <div className="absolute top-0 right-0 size-64 md:size-96 bg-primary/20 rounded-full blur-[80px] md:blur-[120px] -mr-32 md:-mr-48 -mt-32 md:-mt-48 transition-all duration-700 group-hover:bg-primary/30"></div>
                            <div className="absolute bottom-0 left-0 size-48 md:size-80 bg-purple-500/10 rounded-full blur-[60px] md:blur-[100px] -ml-24 md:-ml-40 -mb-24 md:-mb-40"></div>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </PageLayout>
    );
}

const Badge = ({ children, color }: { children: React.ReactNode, color: string }) => (
    <span className={`${color} text-white px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-[0.1em] md:tracking-[0.15em] shadow-sm`}>
        {children}
    </span>
);

const Example = ({ text, highlight = 'blue' }: { text: string; highlight?: 'blue' | 'rose' }) => (
    <div className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl bg-slate-100 dark:bg-slate-800 border-l-3 md:border-l-4 ${highlight === 'blue' ? 'border-blue-500 text-blue-700' : 'border-rose-500 text-rose-700'} dark:text-white font-black italic text-[11px] md:text-sm shadow-sm`}>
        {text}
    </div>
);
