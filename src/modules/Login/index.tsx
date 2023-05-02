// import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { FC, PropsWithChildren } from 'react';
import Auth from '@components/Auth';

// https://github.com/withastro/astro/issues/2903
const homepage = import.meta.env.PUBLIC_HOMEPAGE;
const disableSignUp: boolean = import.meta.env.PUBLIC_DISABLE_SIGNUP === 'true';

const LoginPage: FC<PropsWithChildren<Record<string, unknown>>> = ({
  children,
}) => {
  const supabaseClient = useSupabaseClient();
  const user = useUser();

  if (!user)
    return (
      <div className="mt-8 sm:mt-12">
        <div>
          <span className="text-3xl text-gradient font-[800]">ChatGPT</span>
        </div>
        <Auth
          showLinks={!disableSignUp}
          // redirectTo={homepage}
          // appearance={{ theme: ThemeSupa }}
          // supabaseClient={supabaseClient}
          // providers={[]}
          // socialLayout="horizontal"
        />
      </div>
    );

  return <>{children}</>;
};

export default LoginPage;
