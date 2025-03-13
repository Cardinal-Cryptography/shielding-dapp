import { initWasmWorker } from '@cardinal-cryptography/shielder-sdk-crypto-wasm';
import depositParamsUrl from '@cardinal-cryptography/shielder-sdk-crypto-wasm/keys/deposit/params.bin?url';
import depositPkUrl from '@cardinal-cryptography/shielder-sdk-crypto-wasm/keys/deposit/pk.bin?url';
import newAccountParamsUrl from '@cardinal-cryptography/shielder-sdk-crypto-wasm/keys/new_account/params.bin?url';
import newAccountPkUrl from '@cardinal-cryptography/shielder-sdk-crypto-wasm/keys/new_account/pk.bin?url';
import withdrawParamsUrl from '@cardinal-cryptography/shielder-sdk-crypto-wasm/keys/withdraw/params.bin?url';
import withdrawPkUrl from '@cardinal-cryptography/shielder-sdk-crypto-wasm/keys/withdraw/pk.bin?url';
import memoize from 'memoizee';

const fetchArrayBuffer = async (url: string): Promise<Uint8Array> => fetch(url)
  .then(r => r.arrayBuffer())
  .then(b => new Uint8Array(b));

export const wasmCryptoClientRead = memoize(async () => {
  const newAccountParams = await fetchArrayBuffer(newAccountParamsUrl);
  const newAccountPk = await fetchArrayBuffer(newAccountPkUrl);
  const depositParams = await fetchArrayBuffer(depositParamsUrl);
  const depositPk = await fetchArrayBuffer(depositPkUrl);
  const withdrawParams = await fetchArrayBuffer(withdrawParamsUrl);
  const withdrawPk = await fetchArrayBuffer(withdrawPkUrl);

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
})();
