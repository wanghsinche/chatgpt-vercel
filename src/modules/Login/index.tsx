import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useEffect, useState, FC, PropsWithChildren } from 'react';

const LoginPage: FC<PropsWithChildren<Record<string, never>>> = ({
  children,
}) => {
  const supabaseClient = useSupabaseClient();
  const user = useUser();
  if (!user)
    return (
      <Auth
        redirectTo="http://localhost:3000/"
        appearance={{ theme: ThemeSupa }}
        supabaseClient={supabaseClient}
        providers={['google', 'github']}
        socialLayout="horizontal"
      />
    );

  return <>{children}</>;
};

export default LoginPage;
