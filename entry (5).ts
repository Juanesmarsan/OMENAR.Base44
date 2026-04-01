import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));

    // Close any previous active sessions for this user
    const activeSessions = await base44.asServiceRole.entities.AccessLog.filter({ user_email: user.email, status: 'active' });
    for (const session of activeSessions) {
        const loginTime = new Date(session.login_time);
        const logoutTime = new Date();
        const sessionDuration = Math.round((logoutTime - loginTime) / (1000 * 60));
        await base44.asServiceRole.entities.AccessLog.update(session.id, {
            status: 'closed',
            logout_time: logoutTime.toISOString(),
            session_duration: sessionDuration
        });
    }

    const accessLogData = {
        user_email: user.email,
        user_name: user.full_name || user.email,
        login_time: new Date().toISOString(),
        ip_address: body.ip_address || null,
        user_agent: body.user_agent || null,
        status: 'active'
    };

    const log = await base44.asServiceRole.entities.AccessLog.create(accessLogData);

    return Response.json({ log_id: log.id });
});