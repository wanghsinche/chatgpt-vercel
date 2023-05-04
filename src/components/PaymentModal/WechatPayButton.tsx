import { FC, useContext, useEffect, useState } from 'react';
import { Button, Card, Tag } from 'antd';
import GlobalContext from '@contexts/global';

const WepayButton: FC<{
  email: string;
  enableDesc?: boolean;
  price?: number;
  tier?: number;
}> = ({ email, enableDesc = false, price = 19, tier = 2 }) => {
  const [expiry, setExpiry] = useState(Date.now() + 1000 * 60);
  const { i18n } = useContext(GlobalContext);

  useEffect(() => {
    const t = setInterval(() => {
      setExpiry(Date.now() + 1000 * 60);
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

  if (enableDesc)
    return (
      <Card
        className="rounded-md shadow-md"
        bordered
        title={
          <div className="flex justify-center">
            <Tag color="gold">
              Chatgpt {price}元{tier}M月度流量包
            </Tag>
          </div>
        }
      >
        <div className="text-gray-800 text-2xl  text-center">
          ¥{Number(price).toFixed(2)}
        </div>
        <div className="flex justify-center items-center py-6">
          <Button className=" bg-green-500 hover:bg-green-600 text-white rounded-md px-8 py-2 w-full h-auto border-transparent	">
            {link}
          </Button>
        </div>
      </Card>
    );

  return (
    <Button className=" bg-green-500 hover:bg-green-600 text-white rounded-md px-8 py-2 w-full h-auto border-transparent	">
      {link}
    </Button>
  );
};

export default WepayButton;
