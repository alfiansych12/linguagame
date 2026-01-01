import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAllUsers, getRedeemCodes, getAnnouncements } from '@/app/actions/adminActions';
import AdminClientWrapper from './AdminClientWrapper';

export default async function AdminDashboard() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.isAdmin) {
        redirect('/');
    }

    const { data: users = [] } = await getAllUsers();
    const { data: codes = [] } = await getRedeemCodes();
    const { data: announcements = [] } = await getAnnouncements();

    return (
        <AdminClientWrapper
            users={users}
            codes={codes}
            announcements={announcements}
        />
    );
}
