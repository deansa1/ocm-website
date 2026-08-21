function parseCookies(header = '') {
  return Object.fromEntries(header.split(';').map(v => v.trim()).filter(Boolean).map(v => {
    const i = v.indexOf('=');
    return [v.slice(0, i), decodeURIComponent(v.slice(i + 1))];
  }));
}

export default async function handler(req, res) {
  const { code, state } = req.query;
  const cookies = parseCookies(req.headers.cookie || '');

  if (!code || !state || !cookies.decap_oauth_state || state !== cookies.decap_oauth_state) {
    res.status(400).send('Invalid or expired CMS login request.');
    return;
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    res.status(500).send('CMS login is not configured yet.');
    return;
  }

  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code })
  });
  const tokenData = await tokenResponse.json();

  if (!tokenData.access_token) {
    res.status(400).send('GitHub authentication failed.');
    return;
  }

  const payload = JSON.stringify({ token: tokenData.access_token, provider: 'github' }).replace(/</g, '\\u003c');
  res.setHeader('Set-Cookie', 'decap_oauth_state=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(`<!doctype html><html><body><p>Login complete. You can close this window.</p><script>
    (function(){
      var msg = 'authorization:github:success:' + ${JSON.stringify(payload)};
      if (window.opener) {
        window.opener.postMessage(msg, window.location.origin);
        setTimeout(function(){ window.close(); }, 500);
      }
    })();
  </script></body></html>`);
}
