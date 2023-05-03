import { FC, useContext } from 'react';
import { Button, Card, Tag } from 'antd';
import GlobalContext from '@contexts/global';

const WepayButton: FC<{ email: string; enableDesc?: boolean }> = ({
  email,
  enableDesc = false,
}) => {
  const { i18n } = useContext(GlobalContext);
  const btn = (
    <Button className="w-full" type="primary">
      <a
        href={`/wepay?Email=${email}&Price=19&Expiry=${Date.now() + 1000 * 60}`}
        target="blank"
      >
        {i18n.pay_with_wexin}
      </a>
    </Button>
  );

  if (enableDesc)
    return (
      <Card bordered title={<Tag color="gold">19元2M月度流量包</Tag>}>
        {btn}
      </Card>
    );

  return btn;
};

export default WepayButton;
