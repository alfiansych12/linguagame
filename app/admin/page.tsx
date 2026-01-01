import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAllUsers, getRedeemCodes, getAnnouncements } from '@/app/actions/adminActions';
import AdminClientWrapper from './AdminClientWrapper';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
        redirect('/');
    }

    const { data: users = [] } = await getAllUsers();
    const { data: codes = [] } = await getRedeemCodes();
    const { data: announcements = [] } = await getAnnouncements();

    return (
        <Suspense fallback={<div className="h-screen w-full flex items-center justify-center bg-[#06060a] text-primary font-black uppercase tracking-widest animate-pulse">Initializing Admin Frame...</div>}>
            <AdminClientWrapper
                users={users}
                codes={codes}
                announcements={announcements}
            />
        </Suspense>
    );
}
