# 🎮 LinguaGame - Premium Language Learning Platform

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-DB-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

**LinguaGame** is a high-fidelity, gamified language learning platform built for the "Bro Gacor" community. It features ultra-premium "Mega-Mehwah" visual effects, real-time multiplayer duels, and a robust security-first architecture.

## ✨ Key Features

- **Mega-Mehwah UI**: 5 tiers of animated avatar borders with GPU-accelerated effects (Diamond, Emerald, Obsidian, Infinity, Celestial).
- **Gamified Path**: Vocabulary and Grammar paths with interactive stages (Flashcards, Jumbled Words, Match Pairs).
- **Security by Design**: 
  - Server-side session authority (NextAuth).
  - Zod validation for all score submissions and shop transactions.
  - Rate limiting via Upstash Redis to prevent bot exploits.
  - Data minimization (User PII never exposed).
- **Crystal Shop**: Purchase Skill Crystals (Shield, Booster, focus) and limited-edition borders.
- **Duel Arena**: Real-time 1v1 multiplayer duels (via Supabase Realtime).
- **Comprehensive Profile**: XP tracking, streaks, and milestone-based referral system.

## 🚀 Tech Stack

- **Framework**: Next.js (App Router)
- **State Management**: Zustand (with Persist)
- **Styling**: Tailwind CSS v4 & Framer Motion
- **Database/Auth**: Supabase & NextAuth.js
- **Validation**: Zod
- **Security**: Upstash Ratelimit (Redis)

## 🛠️ Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/linguagame.git
   cd linguagame
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Copy `.env.example` to `.env.local` and fill in your keys:
   ```bash
   cp .env.example .env.local
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

## 🔒 Security Policy

This project implements "Security by Design". All critical actions (XP updates, Gem spending, Item consumption) are handled via **Next.js Server Actions** with session verification. Client-side state is synchronized ONLY after server approval.

## 📄 License

MIT License - Copyright (c) 2025 LinguaGame Team
