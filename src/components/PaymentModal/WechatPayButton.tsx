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

  const btn = (
    <Button className="w-full" type="primary">
      <a
        href={`/wepay?Email=${email}&Price=${price}&Expiry=${expiry}&Tier=${tier}`}
        target="blank"
      >
        {i18n.pay_with_wexin}
      </a>
    </Button>
  );

  if (enableDesc)
    return (
      <Card
        bordered
        title={
          <Tag color="gold">
            {price}元{tier}M月度流量包
          </Tag>
        }
      >
        {btn}
      </Card>
    );

  return btn;
};

export default WepayButton;
