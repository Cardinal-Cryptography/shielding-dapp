import Button from 'src/domains/misc/components/Button';

import { useWallet } from '../WalletProvider';

const WalletConnection = () => {
  const { account, error, loading, connectWallet, disconnectWallet } = useWallet();

  return (
    <div>
      {account ? (
        <div>
          <p>
            <strong>Wallet Connected!</strong>
          </p>
          <p>
            <strong>Account:</strong> {account}
          </p>
          <Button variant="danger" onClick={() => void disconnectWallet()}>
            Disconnect Wallet
          </Button>
        </div>
      ) : (
        <div>
          <Button variant="primary" onClick={() => void connectWallet()} disabled={loading}>
            {loading ? 'Loading...' : 'Connect with WalletConnect'}
          </Button>
          {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
        </div>
      )}
    </div>
  );
};

export default WalletConnection;
