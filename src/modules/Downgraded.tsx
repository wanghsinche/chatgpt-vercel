import { DowngradeAntd } from '@utils/downgradeAntd';
import OriginLogin from '@modules/Login';
import OriginMain from '@modules/Main';
import { Lang } from '@interfaces';
import OriginUpdatePassword from '@/modules/UpdatePassword';

export const Login = () => (
  <DowngradeAntd>
    <OriginLogin />
  </DowngradeAntd>
);
export const UpdatePassword = () => (
  <DowngradeAntd>
    <OriginUpdatePassword />
  </DowngradeAntd>
);
export const Main = (p: { lang: Lang; inVercel: boolean }) => (
  <DowngradeAntd>
    <OriginMain {...p} />
  </DowngradeAntd>
);
