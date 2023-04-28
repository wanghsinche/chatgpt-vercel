import {
  StyleProvider,
  legacyLogicalPropertiesTransformer,
} from '@ant-design/cssinjs';
import { FC, PropsWithChildren, useEffect } from 'react';
import { wxGoToHell } from '@utils';

export const DowngradeAntd: FC<PropsWithChildren> = ({ children }) => {
  useEffect(() => {
    wxGoToHell();
  });
  return (
    <StyleProvider
      hashPriority="high"
      transformers={[legacyLogicalPropertiesTransformer]}
    >
      {children}
    </StyleProvider>
  );
};

export default DowngradeAntd;
