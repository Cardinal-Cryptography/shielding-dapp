import { match } from 'ts-pattern';

import WalletConnection from 'src/domains/chains/components/WalletConnection';
import WalletProvider from 'src/domains/chains/components/WalletProvider';
import Layout from 'src/domains/misc/components/Layout';
import Providers from 'src/domains/misc/components/Providers';
import Redirect from 'src/domains/routing/components/Redirect';
import router from 'src/domains/routing/utils/router';

const App = () => {
  const route = router.useRoute(['Shield']);

  return (
    <Providers>
      <WalletProvider>
        <Layout>
          {
            match(route)
              .with({ name: 'Shield' }, () => <WalletConnection />)
              .otherwise(() => <Redirect to="/" />)
          }
        </Layout>
      </WalletProvider>
    </Providers>
  );
};

export default App;
