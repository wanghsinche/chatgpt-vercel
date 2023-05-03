import { FC, useContext, useState } from 'react';
import {
  Button,
  Modal,
  ModalProps,
  Space,
  Skeleton,
  Tag,
  Descriptions,
} from 'antd';
import GlobalContext from '@contexts/global';
import swr from 'swr';
import { consumptionEveryTime } from '@configs';
import type { IAccount } from '@pages/api/account';
import { myRequest } from '@utils/request';
import WepayButton from './WechatPayButton';

interface PaymentModalProps {
  onOk: () => void;
}

const btnId = import.meta.env.PUBLIC_STRIPE_BUY_BUTTON_ID;
const pubKey = import.meta.env.PUBLIC_STRIPE_PUB_KEY;

const PaymentModal: FC<PaymentModalProps & Omit<ModalProps, 'onOk'>> = ({
  onOk,
  ...rest
}) => {
  const { i18n, isMobile } = useContext(GlobalContext);

  const {
    data: account,
    error,
    isLoading,
  } = swr<IAccount>('account', async () =>
    myRequest('/api/account', {
      method: 'get',
    })
  );

  const paymentBtn = (
    <Space direction="vertical">
      {btnId && (
        <stripe-buy-button
          customer-email={account?.email}
          buy-button-id={btnId}
          publishable-key={pubKey}
        ></stripe-buy-button>
      )}
      <WepayButton email={account?.email} enableDesc={!btnId} />
    </Space>
  );

  const toBeExpired = Math.min(
    consumptionEveryTime,
    Number(error || account?.credit)
  );

  return (
    <Modal
      title={i18n.payment}
      footer={null}
      width={isMobile ? '90vw' : '50vw'}
      style={{ maxWidth: 600 }}
      {...rest}
    >
      <div className="mt-[12px]">
        <Descriptions column={2}>
          <Descriptions.Item label={i18n.account}>
            {account?.email || account?.id}
          </Descriptions.Item>
          <Descriptions.Item label={i18n.current_credit}>
            <Tag color="gold" title={i18n.credit}>
              {Number(error || account?.credit) / 1000}M
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label={i18n.expired_date}>
            {error || new Date(account?.expired_at).toLocaleDateString()}
          </Descriptions.Item>
          <Descriptions.Item label={i18n.expire_credit}>
            <Tag color="red" title={i18n.credit}>
              {toBeExpired / 1000}M
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </div>
      <div className="mt-[12px] flex items-center justify-center">
        {!account || isLoading ? <Skeleton /> : paymentBtn}
      </div>
      <div className="mt-[12px] flex items-center flex-row-reverse">
        <Space>
          <Button onClick={onOk}>{i18n.action_ok}</Button>
        </Space>
      </div>
    </Modal>
  );
};

const PremiumButton: FC<Record<string, void>> = () => {
  const { i18n } = useContext(GlobalContext);
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Tag
        title={i18n.premium}
        className="cursor-pointer"
        color="volcano"
        onClick={() => setVisible(true)}
      >
        {i18n.premium}
      </Tag>
      <PaymentModal
        open={visible}
        onOk={() => setVisible(false)}
        onCancel={() => setVisible(false)}
      />
    </>
  );
};

export default PremiumButton;
