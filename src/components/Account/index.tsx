import GlobalContext from '@contexts/global';
import { Space, Tooltip, message, Tag, Spin } from 'antd';
import ConfigIcon from '@components/ConfigIcon';
import swr from 'swr';
import { useContext } from 'react';
import type { IAccount } from '@pages/api/account';
import { myRequest } from '@utils/request';

function Account() {
  const { i18n } = useContext(GlobalContext);

  const {
    data: account,
    error,
    isValidating,
  } = swr<IAccount>(
    'account',
    async () =>
      myRequest('/api/account', {
        method: 'get',
      }),
    { refreshInterval: 60000 }
  );

  function handleLogout() {
    myRequest('/api/logout', {
      method: 'post',
    })
      .then(() => {
        localStorage.clear();
        window.location.reload();
      })
      .catch((err) => {
        message.error(`Error logging out: ${err}`);
      });
  }

  return (
    <div>
      <div className="mb-2 break-all">{account?.email || account?.id}</div>
      <Space align="center">
        <Spin spinning={isValidating}>
          <Tag color="gold" title={i18n.credit}>
            {i18n.credit}: {Number(error || account?.credit) / 1000} M
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
