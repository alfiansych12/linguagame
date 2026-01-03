import { Metadata, Route } from 'next';

export default async function sitemap() {
    const baseUrl = 'https://linguagame.vercel.app';

    const routes = [
        '',
        '/about',
        '/contact',
        '/privacy',
        '/terms',
        '/grammar',
        '/leaderboard',
        '/shop',
    ];

    return routes.map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: route === '' ? 1 : 0.8,
    }));
}
