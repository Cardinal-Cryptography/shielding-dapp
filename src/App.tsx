import styled from 'styled-components';

import { useTheme } from 'src/domains/common/hooks/useTheme';
import Providers from 'src/domains/common/providers/Providers';

const App = () => {
  const { userSelectedTheme, setTheme } = useTheme();
  return (
    <Providers>
      shielding dapp
      <ThemeSelector>
        <Button onClick={() => void setTheme('light')}>light</Button>
        <Button onClick={() => void setTheme('dark')}>dark</Button>
        <Button onClick={() => void setTheme('system')}>system</Button>
      </ThemeSelector>
      Current theme:
      {' '}
      {userSelectedTheme}
    </Providers>
  );
};

export default App;

const ThemeSelector = styled.div`
  display: flex;
  gap: 2px;
`;

const Button = styled.button`
  padding: 4px 8px;
  color: white;
  background: gray;
`;
