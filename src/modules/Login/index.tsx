import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { FC, PropsWithChildren } from 'react';

const LoginPage: FC<PropsWithChildren<Record<string, unknown>>> = ({
  children,
}) => {
  const supabaseClient = useSupabaseClient();
  const user = useUser();
  if (!user)
    return (
      <div>
        <div>Welcome to AI Chat</div>
        <Auth
          redirectTo="http://localhost:3000/"
          appearance={{ theme: ThemeSupa }}
          supabaseClient={supabaseClient}
          providers={[]}
          socialLayout="horizontal"
        />
      </div>
    );

  return <>{children}</>;
};

export default LoginPage;
