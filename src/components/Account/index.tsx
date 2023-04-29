import GlobalContext from '@contexts/global';
import { useSessionContext, useUser } from '@supabase/auth-helpers-react';
import { Space, Tooltip, message, Tag, Spin } from 'antd';
import ConfigIcon from '@components/ConfigIcon';
import swr from 'swr';
import { useContext } from 'react';

function Account() {
  const { supabaseClient } = useSessionContext();
  const myself = useUser();
  const { i18n } = useContext(GlobalContext);

  const {
    data: subscription,
    error,
    isValidating,
  } = swr(myself ?? 'getCredit', async () =>
    supabaseClient.from('subscription').select<
      'credit, expired_at',
      {
        credit: number;
        expired_at: Date;
      }
    >('credit, expired_at')
  );

  function handleLogout() {
    supabaseClient.auth.signOut().catch((err) => {
      message.error(`Error logging out: ${err.message}`);
    });
  }

  return (
    <div>
      <div className="mb-2 break-all">{myself?.email || myself?.id}</div>
      <Space align="center">
        <Spin spinning={isValidating}>
          <Tag color="gold" title={i18n.credit}>
            {i18n.credit}: {error || subscription?.data?.[0]?.credit}
          </Tag>
        </Spin>
        <Tooltip title={i18n.logout}>
          <ConfigIcon onClick={handleLogout} name="ri-logout-circle-line" />
        </Tooltip>
      </Space>
    </div>
  );
}

export default Account;
