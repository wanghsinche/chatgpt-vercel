import { FC, useContext, useEffect, useState } from 'react';
import { Button, Card, Tag } from 'antd';
import GlobalContext from '@contexts/global';
import { wechatExpirySec } from '@configs';

const WepayButton: FC<{
  email: string;
  enableDesc?: boolean;
  price?: number;
  tier?: number;
}> = ({ email, enableDesc = false, price = 19, tier = 2 }) => {
  const [expiry, setExpiry] = useState(Date.now() + 1000 * wechatExpirySec);
  const { i18n } = useContext(GlobalContext);

  useEffect(() => {
    const t = setInterval(() => {
      setExpiry(Date.now() + 1000 * wechatExpirySec);
    }, 30000);
    return () => clearInterval(t);
  }, []);

  const link = (
    <a
      href={`/wepay?Email=${email}&Price=${price}&Expiry=${expiry}&Tier=${tier}`}
      target="blank"
      className="inline-flex items-center		"
    >
      <i className="ri-wechat-pay-fill"></i> {i18n.pay_with_wexin}
    </a>
  );

  const btn = (
    <Button className="!bg-green-500 !hover:bg-green-600 !text-white rounded-md px-8 py-2 w-full !h-auto !border-transparent	">
      {link}
    </Button>
  );

  if (enableDesc)
    return (
      <Card
        className="rounded-md shadow-md"
        bordered
        title={
          <div className="flex justify-center">
            <Tag color="gold">Chatgpt {tier}M月度流量包</Tag>
          </div>
        }
      >
        <div className="text-gray-800 text-2xl  text-center">
          ¥{Number(price).toFixed(2)}
        </div>
        <div className="text-gray-800 text-lg  text-center">
          1M流量约等于1000次对话
        </div>
        <div className="flex justify-center items-center py-6">{btn}</div>
      </Card>
    );

  return btn;
};

export default WepayButton;
