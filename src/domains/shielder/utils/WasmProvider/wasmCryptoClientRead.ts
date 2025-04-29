import { initWasmWorker } from '@cardinal-cryptography/shielder-sdk-crypto-wasm';
import depositParamsUrl from '@cardinal-cryptography/shielder-sdk-crypto-wasm/keys/deposit/params.bin?url';
import depositPkUrl from '@cardinal-cryptography/shielder-sdk-crypto-wasm/keys/deposit/pk.bin?url';
import newAccountParamsUrl from '@cardinal-cryptography/shielder-sdk-crypto-wasm/keys/new_account/params.bin?url';
import newAccountPkUrl from '@cardinal-cryptography/shielder-sdk-crypto-wasm/keys/new_account/pk.bin?url';
import withdrawParamsUrl from '@cardinal-cryptography/shielder-sdk-crypto-wasm/keys/withdraw/params.bin?url';
import withdrawPkUrl from '@cardinal-cryptography/shielder-sdk-crypto-wasm/keys/withdraw/pk.bin?url';
import memoize from 'memoizee';

const fetchArrayBuffer = async (url: string): Promise<Uint8Array> =>
  fetch(url).then(r => r.arrayBuffer()).then(b => new Uint8Array(b));

const _wasmCryptoClientRead = async () => {
  const [
    newAccountParams,
    newAccountPk,
    depositParams,
    depositPk,
    withdrawParams,
    withdrawPk,
  ] = await Promise.all([
    fetchArrayBuffer(newAccountParamsUrl),
    fetchArrayBuffer(newAccountPkUrl),
    fetchArrayBuffer(depositParamsUrl),
    fetchArrayBuffer(depositPkUrl),
    fetchArrayBuffer(withdrawParamsUrl),
    fetchArrayBuffer(withdrawPkUrl),
  ]);

  return initWasmWorker(
    navigator.hardwareConcurrency,
    {
      paramsBuf: newAccountParams,
      pkBuf: newAccountPk,
    },
    {
      paramsBuf: depositParams,
      pkBuf: depositPk,
    },
    {
      paramsBuf: withdrawParams,
      pkBuf: withdrawPk,
    },
  );
};

export const wasmCryptoClientRead = memoize(_wasmCryptoClientRead);
