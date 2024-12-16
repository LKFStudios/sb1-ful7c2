interface Env {
  SUPABASE_URL: string;
  SUPABASE_KEY: string;
  GEMINI_API_KEY: string;
  MIXPANEL_TOKEN: string;
  IS_DEV: boolean;
}

function validateEnv(): void {
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_GEMINI_API_KEY',
    'VITE_MIXPANEL_TOKEN'
  ];

  const missing = requiredVars.filter(
    varName => !import.meta.env[varName]
  );

  if (missing.length > 0) {
    console.warn(`Missing environment variables: ${missing.join(', ')}`);
  }
}

validateEnv();

export const env: Env = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY,
  MIXPANEL_TOKEN: import.meta.env.VITE_MIXPANEL_TOKEN,
  IS_DEV: import.meta.env.DEV
} as const;