import styled from 'styled-components';

import Button from 'src/domains/misc/components/Button';
import { themes, typography } from 'src/domains/styling/utils/tokens';
import { useTheme } from 'src/domains/styling/utils/useTheme';
import vars from 'src/domains/styling/utils/vars';

const THEMES = ['system', ...Object.keys(themes) as (keyof typeof themes)[]] as const;

const ThemeSelector = () => {
  const { userSelectedTheme, setTheme } = useTheme();

  return (
    <Container>
      <Title>Theme</Title>
      <ButtonsContainer>
        {THEMES.map(theme => (
          <CapitalizedButton
            key={theme}
            size="extra-small"
            variant="outline"
            selected={theme === userSelectedTheme}
            onClick={() => void setTheme(theme)}
          >
            {theme}
          </CapitalizedButton>
        ))}
      </ButtonsContainer>
    </Container>
  );
};

export default ThemeSelector;

const Container = styled.article`
  display: flex;
  align-items: center;
  gap: ${vars('--spacing-l')};
`;

const ButtonsContainer = styled.article`
  display: flex;
  align-items: center;
  gap: ${vars('--spacing-xs')};
`;

const CapitalizedButton = styled(Button)`
  text-transform: capitalize;
`;

const Title = styled.span`
  color: ${vars('--color-neutral-foreground-1-rest')};
  ${typography.web.body1}
`;
