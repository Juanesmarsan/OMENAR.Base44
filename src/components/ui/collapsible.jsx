import { useEffect } from 'react';
import { logAccess } from '@/functions/logAccess';
import { updateAccessLog } from '@/functions/updateAccessLog';
import { base44 } from '@/api/base44Client';

// Module-level variable: persists across SPA navigation remounts, resets on full page reload
let moduleLogId = null;
let isLogging = false;

export default function AccessLogger() {
    useEffect(() => {
        // Register unload handler always (in case component remounts)
        const handleUnload = () => {
            const logId = moduleLogId || sessionStorage.getItem('access_log_id');
            if (logId) {
                updateAccessLog({ log_id: logId, status: 'closed' }).catch(() => {});
                moduleLogId = null;
                sessionStorage.removeItem('access_log_id');
            }
        };
        window.addEventListener('beforeunload', handleUnload);

        // Only log once per SPA session
        if (moduleLogId || isLogging) {
            return () => window.removeEventListener('beforeunload', handleUnload);
        }

        const doLog = async () => {
            isLogging = true;
            try {
                const user = await base44.auth.me();
                if (!user) {
                    isLogging = false;
                    return;
                }
                const res = await logAccess({
                    ip_address: '',
                    user_agent: navigator.userAgent
                });
                if (res?.data?.log_id) {
                    moduleLogId = res.data.log_id;
                    sessionStorage.setItem('access_log_id', moduleLogId);
                }
            } catch (e) {
                console.error('AccessLogger error:', e);
            } finally {
                isLogging = false;
            }
        };

        doLog();

        return () => window.removeEventListener('beforeunload', handleUnload);
    }, []);

    return null;
}