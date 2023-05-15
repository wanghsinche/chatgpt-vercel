import { FC, useContext } from 'react';
import { Button, Card, Tag } from 'antd';
import GlobalContext from '@contexts/global';
import swr from 'swr';
import { IProductInfo, productDetail } from '@utils/priceModel';
import { myRequest } from '@utils/request';

const WepayButton: FC<{
  email: string;
  enableDesc?: boolean;
  product?: IProductInfo;
}> = ({ enableDesc = false, product = productDetail.default }) => {
  const { i18n, isMobile } = useContext(GlobalContext);

  const { data, error, isValidating } = swr(['checkout', product.product], () =>
    myRequest('/api/semipaycheckout', {
      method: 'POST',
      body: JSON.stringify({ product: product.product }),
    })
  );

  const link = (
    <a
      href={data?.checkout?.url}
      target="blank"
      className="inline-flex items-center		"
    >
      <i className="ri-wechat-pay-fill"></i> {i18n.pay_with_wexin}
    </a>
  );

  const btn = (
    <Button
      loading={isValidating}
      className="!bg-green-500 !hover:bg-green-600 !text-white rounded-md px-8 py-2 w-full !h-auto !border-transparent	"
    >
      {link}
    </Button>
  );
  if (error) {
    return (
      <Card className="rounded-md shadow-md" bordered>
        {String(error)}
      </Card>
    );
  }
  if (enableDesc)
    return (
      <Card
        className="rounded-md shadow-md"
        bordered
        title={
          <div className="flex justify-center">
            <Tag color="gold">
              Chatgpt {product.credit / 1000}M 额度月度流量包
            </Tag>
          </div>
        }
      >
        <div className="text-gray-800 text-2xl  text-center">
          ¥{Number(product.price).toFixed(2)}
        </div>
        {!isMobile && (
          <div className="text-gray-800 text-lg  text-center">
            1M 约等于1000次对话
          </div>
        )}
        <div className="flex justify-center items-center py-6">{btn}</div>
      </Card>
    );

  return btn;
};

export default WepayButton;
