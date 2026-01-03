'use client';

import React from 'react';
import Link from 'next/link';
import { Icon } from '@/components/ui/UIComponents';

export const Footer = () => {
    return (
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#06060a] mt-auto">
            <div className="max-w-[1440px] mx-auto px-4 md:px-6 lg:px-8 xl:px-16 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
                    {/* Brand Column */}
                    <div className="col-span-1 md:col-span-2 space-y-4">
                        <Link href="/" className="inline-flex items-center gap-2 group">
                            <div className="size-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/25">
                                <Icon name="bolt" size={20} filled />
                            </div>
                            <span className="text-xl font-black italic tracking-tighter text-slate-900 dark:text-white uppercase">
                                Lingua<span className="text-primary">Game</span>
                            </span>
                        </Link>
                        <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                            Platform belajar bahasa Inggris berbasis gamifikasi #1 di Indonesia.
                            Kami mengubah cara kamu belajar dari membosankan menjadi petualangan epik.
                        </p>
                        <div className="flex items-center gap-4 pt-2">
                            <SocialIcon icon="language" label="Website" href="https://linguagame.vercel.app" />
                            <SocialIcon icon="code" label="Github" href="#" />
                            <SocialIcon icon="mail" label="Email" href="letspastijago@gmail.com" />
                        </div>
                    </div>

                    {/* Links Column 1 */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Platform</h4>
                        <ul className="space-y-2">
                            <FooterLink href="/" label="Home" />
                            <FooterLink href="/grammar" label="Grammar Guide" />
                            <FooterLink href="/leaderboard" label="Leaderboard" />
                            <FooterLink href="/shop" label="Shop" />
                        </ul>
                    </div>

                    {/* Links Column 2 */}
                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Legal & Support</h4>
                        <ul className="space-y-2">
                            <FooterLink href="/about" label="Tentang Kami" />
                            <FooterLink href="/contact" label="Hubungi Kami" />
                            <FooterLink href="/privacy" label="Privacy Policy" />
                            <FooterLink href="/terms" label="Terms of Service" />
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-[10px] font-bold text-slate-400">
                        &copy; {new Date().getFullYear()} LinguaGame. All rights reserved.
                    </p>
                    <p className="text-[10px] font-bold text-slate-500 flex items-center gap-2">
                        <span>Made with <span className="text-rose-500">♥</span> by Alfian X Antigravity</span>
                    </p>
                </div>
            </div>
        </footer>
    );
};

const SocialIcon = ({ icon, label, href }: { icon: string, label: string, href: string }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all hover:scale-110"
        title={label}
    >
        <Icon name={icon} size={16} />
    </a>
);

const FooterLink = ({ href, label }: { href: string, label: string }) => (
    <li>
        <Link href={href} className="text-xs font-bold text-slate-500 hover:text-primary transition-colors block py-0.5">
            {label}
        </Link>
    </li>
);
