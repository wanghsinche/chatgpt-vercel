import { FC, PropsWithChildren, useState } from 'react';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import LoginPage from '@modules/Login';

const AuthWrap: FC<
  PropsWithChildren<{ supabaseKey: string; supabaseUrl: string }>
> = ({ children, supabaseUrl, supabaseKey }) => {
  // Create a new supabase browser client on every first render.
  const [supabaseClient] = useState(() =>
    createBrowserSupabaseClient({ supabaseKey, supabaseUrl })
  );
  return (
    <SessionContextProvider supabaseClient={supabaseClient}>
      <LoginPage>{children}</LoginPage>
    </SessionContextProvider>
  );
};

export default AuthWrap;
