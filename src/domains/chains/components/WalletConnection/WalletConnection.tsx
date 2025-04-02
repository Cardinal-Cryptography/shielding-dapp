import { useWallet } from 'src/domains/chains/components/WalletProvider';
import Button from 'src/domains/misc/components/Button';
import useShielderClient from 'src/domains/shielder/utils/useShielderClient';

const WalletConnection = () => {
  const { isSuccess } = useShielderClient();
  const { isConnected, isLoading, disconnect, address, openModal } = useWallet();

  return (
    <div>
      Shielder successfully loaded:
      {isSuccess ? 'Yes' : 'No'}
      {isConnected ? (
        <div>
          <p>
            <strong>Wallet Connected!</strong>
          </p>
          <p>
            <strong>Account:</strong> {address}
          </p>
          <Button variant="danger" onClick={() => void disconnect()}>
            Disconnect Wallet
          </Button>
        </div>
      ) : (
        <div>
          <Button variant="primary" onClick={() => void openModal({ view: 'Connect' })}>
            {isLoading ? 'Loading...' : 'Connect with WalletConnect'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default WalletConnection;
