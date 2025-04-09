import { erc20Token, nativeToken } from '@cardinal-cryptography/shielder-sdk';
import { Token as SDKToken } from '@cardinal-cryptography/shielder-sdk/dist/types';

import { Token } from 'src/domains/chains/types/misc';

const tokenToShielderToken = (token: Token): SDKToken =>
  token.isNative ? nativeToken() : erc20Token(token.address);

export default tokenToShielderToken;
