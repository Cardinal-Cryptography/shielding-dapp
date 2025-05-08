import { match } from 'ts-pattern';

import Layout from 'src/domains/misc/components/Layout';
import Providers from 'src/domains/misc/components/Providers';
import Redirect from 'src/domains/routing/components/Redirect';
import router from 'src/domains/routing/utils/router';
import ShielderView from 'src/domains/shielder/components/ShielderView';

const App = () => {
  const route = router.useRoute(['Shielded-Account']);

  return (
    <Providers>
      <Layout>
        {
          match(route)
            .with({ name: 'Shielded-Account' }, () => <ShielderView />)
            .otherwise(() => <Redirect to="/shielded-account/" />)
        }
      </Layout>
    </Providers>
  );
};

export default App;
