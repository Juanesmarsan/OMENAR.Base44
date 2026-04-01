import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all active sessions
    const activeLogs = await base44.asServiceRole.entities.AccessLog.filter({ status: 'active' });

    const cutoff = new Date(Date.now() - 12 * 60 * 60 * 1000); // 12 hours ago
    let cleaned = 0;

    for (const log of activeLogs) {
        const loginTime = new Date(log.login_time);
        if (loginTime < cutoff) {
            const logoutTime = new Date(loginTime.getTime() + 8 * 60 * 60 * 1000); // assume 8h session
            const sessionDuration = 8 * 60;
            await base44.asServiceRole.entities.AccessLog.update(log.id, {
                status: 'timeout',
                logout_time: logoutTime.toISOString(),
                session_duration: sessionDuration
            });
            cleaned++;
        }
    }

    return Response.json({ cleaned });
});