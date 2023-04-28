import { FC } from 'react';
import Auth from '@components/Auth';

const LoginPage: FC = () => (
  <div className="mt-8 sm:mt-12 mx-auto max-w-lg">
    <div className="my-8">
      <span className="text-3xl text-gradient font-[800]">ChatGPT</span>
    </div>
    <Auth />
  </div>
);

export default LoginPage;
