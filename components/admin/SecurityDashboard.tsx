'use client';

import React, { useState, useEffect } from 'react';
import { Card, Icon, Badge, Button } from '@/components/ui/UIComponents';
import { motion, AnimatePresence } from 'framer-motion';

interface SuspiciousActivity {
    timestamp: number;
    ip: string;
    userAgent: string;
    path: string;
    reason: string;
}

interface SecurityStats {
    totalBlacklisted: number;
    recentViolations: number;
    suspiciousActivities: number;
}

export const SecurityDashboard: React.FC = () => {
    const [activities, setActivities] = useState<SuspiciousActivity[]>([]);
    const [stats, setStats] = useState<SecurityStats>({
        totalBlacklisted: 0,
        recentViolations: 0,
        suspiciousActivities: 0
    });
    const [selectedIP, setSelectedIP] = useState<string | null>(null);
    const [banReason, setBanReason] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadSecurityData();
        const interval = setInterval(loadSecurityData, 10000); // Refresh every 10s
        return () => clearInterval(interval);
    }, []);

    const loadSecurityData = async () => {
        try {
            const response = await fetch('/api/admin/security');
            if (response.ok) {
                const data = await response.json();
                setActivities(data.activities || []);
                setStats(data.stats || stats);
            }
        } catch (error) {
            console.error('Failed to load security data:', error);
        }
    };

    const handleBlacklistIP = async () => {
        if (!selectedIP || !banReason) return;

        setLoading(true);
        try {
            const { adminBlacklistIP } = await import('@/app/actions/securityActions');
            const result = await adminBlacklistIP({
                ip: selectedIP,
                reason: banReason
            });

            if (result.success) {
                alert(`IP ${selectedIP} has been blacklisted successfully!`);
                setSelectedIP(null);
                setBanReason('');
                loadSecurityData();
            } else {
                alert(`Failed: ${result.error}`);
            }
        } catch (error) {
            alert('Error blacklisting IP');
        } finally {
            setLoading(false);
        }
    };

    const getRiskLevel = (reason: string): 'low' | 'medium' | 'high' => {
        if (reason.includes('BLACKLISTED') || reason.includes('AUTO_BAN')) return 'high';
        if (reason.includes('RATE_LIMIT')) return 'medium';
        return 'low';
    };

    const getRiskColor = (level: 'low' | 'medium' | 'high') => {
        switch (level) {
            case 'high': return 'text-red-500 bg-red-500/10 border-red-500/30';
            case 'medium': return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
            case 'low': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
        }
    };

    return (
        <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-6 bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-400 font-bold">Blacklisted IPs</p>
                            <h3 className="text-3xl font-black text-red-500 mt-2">{stats.totalBlacklisted}</h3>
                        </div>
                        <Icon name="block" size={40} className="text-red-500/30" />
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-400 font-bold">Recent Violations</p>
                            <h3 className="text-3xl font-black text-orange-500 mt-2">{stats.recentViolations}</h3>
                        </div>
                        <Icon name="warning" size={40} className="text-orange-500/30" />
                    </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-400 font-bold">Suspicious Activities</p>
                            <h3 className="text-3xl font-black text-yellow-500 mt-2">{stats.suspiciousActivities}</h3>
                        </div>
                        <Icon name="visibility" size={40} className="text-yellow-500/30" />
                    </div>
                </Card>
            </div>

            {/* Manual IP Ban */}
            <Card className="p-6">
                <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                    <Icon name="shield" className="text-red-500" />
                    Manual IP Blacklist
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                        type="text"
                        placeholder="IP Address (e.g., 192.168.1.1)"
                        value={selectedIP || ''}
                        onChange={(e) => setSelectedIP(e.target.value)}
                        className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-primary focus:outline-none"
                    />
                    <input
                        type="text"
                        placeholder="Reason for ban"
                        value={banReason}
                        onChange={(e) => setBanReason(e.target.value)}
                        className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-primary focus:outline-none"
                    />
                    <Button
                        onClick={handleBlacklistIP}
                        disabled={!selectedIP || !banReason || loading}
                        className="bg-red-500 hover:bg-red-600 disabled:opacity-50"
                    >
                        <Icon name="block" className="mr-2" />
                        {loading ? 'Banning...' : 'Blacklist IP'}
                    </Button>
                </div>
            </Card>

            {/* Activity Log */}
            <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                        <Icon name="history" className="text-primary" />
                        Suspicious Activity Log
                    </h2>
                    <Badge variant="primary" className="text-xs">
                        Live Monitoring
                    </Badge>
                </div>

                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    <AnimatePresence>
                        {activities.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">
                                <Icon name="check_circle" size={48} className="mx-auto mb-4 opacity-30" />
                                <p className="font-bold">No suspicious activities detected</p>
                                <p className="text-sm mt-2">System is secure 🛡️</p>
                            </div>
                        ) : (
                            activities.map((activity, index) => {
                                const riskLevel = getRiskLevel(activity.reason);
                                const riskColor = getRiskColor(riskLevel);

                                return (
                                    <motion.div
                                        key={`${activity.ip}-${activity.timestamp}`}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`p-4 rounded-xl border-2 ${riskColor} backdrop-blur-sm`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <Badge variant="primary" className="text-xs font-black">
                                                        {activity.reason}
                                                    </Badge>
                                                    <span className="text-xs text-slate-400">
                                                        {new Date(activity.timestamp).toLocaleString('id-ID')}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                                                    <div>
                                                        <span className="text-slate-500 font-bold">IP:</span>
                                                        <span className="ml-2 text-white font-mono">{activity.ip}</span>
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <span className="text-slate-500 font-bold">Path:</span>
                                                        <span className="ml-2 text-white font-mono text-xs">{activity.path}</span>
                                                    </div>
                                                </div>
                                                <div className="mt-2 text-xs text-slate-400 truncate">
                                                    <span className="font-bold">User-Agent:</span> {activity.userAgent}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setSelectedIP(activity.ip);
                                                    setBanReason(`Suspicious activity: ${activity.reason}`);
                                                }}
                                                className="ml-4 p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors"
                                                title="Ban this IP"
                                            >
                                                <Icon name="block" size={20} className="text-red-500" />
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </AnimatePresence>
                </div>
            </Card>
        </div>
    );
};
