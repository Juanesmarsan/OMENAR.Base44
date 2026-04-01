import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { log_id, status } = body;

    if (!log_id) {
        return Response.json({ error: 'log_id required' }, { status: 400 });
    }

    const logoutTime = new Date();
    const log = await base44.asServiceRole.entities.AccessLog.get(log_id);
    const loginTime = new Date(log.login_time);
    const sessionDuration = Math.floor((logoutTime - loginTime) / (1000 * 60));

    await base44.asServiceRole.entities.AccessLog.update(log_id, {
        logout_time: logoutTime.toISOString(),
        session_duration: sessionDuration,
        status: status || 'closed'
    });

    return Response.json({ ok: true });
});