import {
  StyleProvider,
  legacyLogicalPropertiesTransformer,
} from '@ant-design/cssinjs';
import { FC, PropsWithChildren } from 'react';

export const DowngradeAntd: FC<PropsWithChildren> = ({ children }) => (
  <StyleProvider
    hashPriority="high"
    transformers={[legacyLogicalPropertiesTransformer]}
  >
    {children}
  </StyleProvider>
);

export default DowngradeAntd;
