import Main from '@modules/Main';
import AuthWrap from '@modules/AuthWrap';
import { FC } from 'react';
import type { Lang } from '@interfaces';

const MainWithAuth: FC<{
  lang: Lang;
  supabaseKey: string;
  supabaseUrl: string;
}> = ({ lang, supabaseKey, supabaseUrl }) => (
  <AuthWrap supabaseUrl={supabaseUrl} supabaseKey={supabaseKey}>
    <Main lang={lang} />
  </AuthWrap>
);

export default MainWithAuth;
