import { Amplify } from 'aws-amplify';

function pickRedirect(value?: string) {
  if (!value) return undefined as unknown as string;
  const parts = value.split(',').map((s) => s.trim()).filter(Boolean);
  if (typeof window !== 'undefined') {
    const byOrigin = parts.find((u) => {
      try { return new URL(u).origin === window.location.origin; } catch { return false; }
    });
    return byOrigin || parts[0];
  }
  return parts[0];
}

const config = {
  Auth: {
    region: import.meta.env.VITE_AMPLIFY_REGION,
    userPoolId: import.meta.env.VITE_AMPLIFY_USER_POOL_ID,
    userPoolWebClientId: import.meta.env.VITE_AMPLIFY_USER_POOL_CLIENT_ID,
    oauth: {
      domain: import.meta.env.VITE_AMPLIFY_COGNITO_DOMAIN,
      scope: (import.meta.env.VITE_AMPLIFY_OAUTH_SCOPES || 'openid profile email').split(',').map(s => s.trim()),
      redirectSignIn: pickRedirect(import.meta.env.VITE_AMPLIFY_REDIRECT_SIGN_IN),
      redirectSignOut: pickRedirect(import.meta.env.VITE_AMPLIFY_REDIRECT_SIGN_OUT),
      responseType: 'code', // Authorization Code Flow with PKCE
    },
  },
};

Amplify.configure(config);

export { config };