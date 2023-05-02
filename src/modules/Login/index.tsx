import { FC } from 'react';
import Auth from '@components/Auth';

// https://github.com/withastro/astro/issues/2903
const disableSignUp: boolean = import.meta.env.PUBLIC_DISABLE_SIGNUP === 'true';

const LoginPage: FC = () => (
  <div className="mt-8 sm:mt-12 mx-auto max-w-lg">
    <div>
      <span className="text-3xl text-gradient font-[800]">ChatGPT</span>
    </div>
    <Auth showLinks={!disableSignUp} />
  </div>
);

export default LoginPage;
