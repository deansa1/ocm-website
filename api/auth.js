import crypto from 'node:crypto';

export default function handler(req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    res.status(500).send('CMS login is not configured yet. Missing GITHUB_CLIENT_ID.');
    return;
  }

  const state = crypto.randomBytes(24).toString('hex');
  const callback = `https://${req.headers.host}/api/callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: callback,
    scope: 'public_repo user:email',
    state
  });

  res.setHeader('Set-Cookie', `decap_oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`);
  res.redirect(302, `https://github.com/login/oauth/authorize?${params.toString()}`);
}
