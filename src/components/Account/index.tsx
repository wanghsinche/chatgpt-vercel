import GlobalContext from '@contexts/global';
import { useSessionContext, useUser } from '@supabase/auth-helpers-react';
import { Space } from 'antd';
import ConfigIcon from '@components/ConfigIcon';

import { useContext } from 'react';

function Account() {
  const { supabaseClient } = useSessionContext();
  const myself = useUser();
  const { i18n } = useContext(GlobalContext);

  async function handleLogout() {
    const { error } = await supabaseClient.auth.signOut();
    if (error) console.log('Error logging out:', error.message);
  }

  return (
    <Space>
      {myself?.email || myself?.id}
      <ConfigIcon onClick={handleLogout} name="ri-logout-circle-line">
        {i18n.logout}
      </ConfigIcon>
    </Space>
  );
}

export default Account;
