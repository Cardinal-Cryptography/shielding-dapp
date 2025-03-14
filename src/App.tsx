import { match } from 'ts-pattern';

import Layout from 'src/domains/misc/components/Layout';
import Providers from 'src/domains/misc/components/Providers';
import Redirect from 'src/domains/routing/components/Redirect';
import router from 'src/domains/routing/utils/router';

const App = () => {
  const route = router.useRoute(['Shield']);

  return (
    <Providers>
      <Layout>
        {
          match(route)
            .with({ name: 'Shield' }, () => 'Shielding dApp')
            .otherwise(() => <Redirect to="/" />)
        }
      </Layout>
    </Providers>
  );
};

export default App;
