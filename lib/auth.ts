import { NextAuthOptions, DefaultSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { supabase } from './db/supabase';

// Extending internal session types
declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            totalXp: number;
            currentStreak: number;
        } & DefaultSession["user"]
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        }),
    ],
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        async signIn({ user, account }) {
            if (!user.email) return false;

            // Create or Update user to keep image and name in sync
            const { error: upsertError } = await supabase.from('users').upsert({
                id: user.id,
                email: user.email,
                name: user.name,
                image: user.image,
                last_login_at: new Date().toISOString()
            }, {
                onConflict: 'email'
            });

            if (upsertError) {
                console.error('Error upserting user:', upsertError);
            }
            return true;
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (token.id && session.user) {
                session.user.id = token.id as string;

                // Fetch real-time stats from Supabase to keep session updated
                const { data: userData } = await supabase
                    .from('users')
                    .select('total_xp, current_streak')
                    .eq('id', token.id)
                    .single();

                if (userData) {
                    session.user.totalXp = userData.total_xp || 0;
                    session.user.currentStreak = userData.current_streak || 0;
                }
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
    },
};
