import { NextAuthOptions, DefaultSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import { supabase } from './db/supabase';
import { supabaseAdmin } from './db/supabase-admin';
import bcrypt from 'bcryptjs';

// Extending internal session types
declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            totalXp: number;
            currentStreak: number;
            isAdmin: boolean;
        } & DefaultSession["user"]
    }

    interface JWT {
        id?: string;
        isAdmin?: boolean;
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        }),
        GitHubProvider({
            clientId: process.env.GITHUB_ID || '',
            clientSecret: process.env.GITHUB_SECRET || '',
        }),
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Email dan password wajib diisi sirkel!');
                }

                // SECURE: Use admin client to find user and check password
                const { data: user, error } = await supabaseAdmin
                    .from('users')
                    .select('*')
                    .eq('email', credentials.email)
                    .single();

                if (error || !user) {
                    throw new Error('User gak ketemu sirkel, daftar dulu yuk!');
                }

                if (!user.password) {
                    throw new Error('Email ini login lewat Google/GitHub sirkel!');
                }

                const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);

                if (!isPasswordCorrect) {
                    throw new Error('Password lo salah sirkel, coba lagi!');
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                };
            }
        }),
    ],
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        async signIn({ user, account }) {
            if (!user.email) return false;

            // Handle Credentials provider separately if needed (though next-auth handles it)
            if (account?.provider === 'credentials') {
                await supabaseAdmin.from('users').update({
                    last_login_at: new Date().toISOString()
                }).eq('id', user.id);
                return true;
            }

            // For OAuth (Google/GitHub), check if user exists by email
            const { data: existingUser } = await supabaseAdmin
                .from('users')
                .select('id')
                .eq('email', user.email)
                .single();

            if (existingUser) {
                // Link account if necessary, but here we just update profile
                await supabaseAdmin.from('users').update({
                    name: user.name,
                    image: user.image,
                    last_login_at: new Date().toISOString()
                }).eq('id', existingUser.id);

                // Important: Update the user object in the callback so the token gets the CORRECT id
                user.id = existingUser.id;
            } else {
                // New OAuth User
                const { error: insertError } = await supabaseAdmin.from('users').insert({
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                    last_login_at: new Date().toISOString(),
                    inventory: { hint: 0, focus: 0, shield: 0, booster: 0, timefreeze: 0, autocorrect: 0 },
                    gems: 100,
                    total_xp: 0,
                    current_streak: 0,
                });

                if (insertError) {
                    console.error('Error creating OAuth user:', insertError);
                    return false;
                }
            }

            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }

            // Sync isAdmin to token for middleware access
            if (token.id && !token.isAdmin) {
                const { data } = await supabase
                    .from('users')
                    .select('is_admin')
                    .eq('id', token.id)
                    .single();
                if (data) {
                    token.isAdmin = data.is_admin;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (token.id && session.user) {
                session.user.id = token.id as string;

                // Fetch real-time stats from Supabase to keep session updated
                const { data: userData } = await supabase
                    .from('users')
                    .select('total_xp, current_streak, is_admin')
                    .eq('id', token.id)
                    .single();

                if (userData) {
                    session.user.totalXp = userData.total_xp || 0;
                    session.user.currentStreak = userData.current_streak || 0;
                    session.user.isAdmin = userData.is_admin || false;
                }
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
    },
};
