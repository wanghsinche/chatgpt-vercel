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
import { useSessionContext, useUser } from '@supabase/auth-helpers-react';
import swr from 'swr';
import { consumptionEveryTime } from '@configs';

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
  const { supabaseClient } = useSessionContext();
  const myself = useUser();

  const {
    data: subscription,
    error,
    isValidating,
  } = swr(myself ?? 'getCredit', async () =>
    supabaseClient
      .from('subscription')
      .select<
        'credit, expired_at',
        {
          credit: number;
          expired_at: Date;
        }
      >('credit, expired_at')
      .eq('id', myself.id)
  );

  const paymentBtn = (
    <stripe-buy-button
      customer-email={myself?.email}
      buy-button-id={btnId}
      publishable-key={pubKey}
    ></stripe-buy-button>
  );

  const toBeExpired = Math.min(
    consumptionEveryTime,
    Number(error || subscription?.data?.[0]?.credit)
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
            {myself?.email || myself?.id}
          </Descriptions.Item>
          <Descriptions.Item label={i18n.credit}>
            <Tag color="gold" title={i18n.credit}>
              {Number(error || subscription?.data?.[0]?.credit) / 1000}M{' '}
              {i18n.credit}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label={i18n.expired_date}>
            {error ||
              new Date(
                subscription?.data?.[0]?.expired_at
              ).toLocaleDateString()}
          </Descriptions.Item>
          <Descriptions.Item label={i18n.expire_credit}>
            <Tag color="red" title={i18n.credit}>
              {toBeExpired / 1000}M {i18n.credit}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </div>
      <div className="mt-[12px] flex items-center justify-center">
        {!myself || isValidating ? <Skeleton /> : paymentBtn}
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
