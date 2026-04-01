import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { user_id, status } = await req.json();
    if (!user_id) return Response.json({ error: 'user_id required' }, { status: 400 });

    await base44.asServiceRole.entities.User.update(user_id, { status: status || 'blocked' });

    return Response.json({ ok: true });
});