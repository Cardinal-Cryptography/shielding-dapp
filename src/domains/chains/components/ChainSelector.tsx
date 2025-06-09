import { useMediaQuery } from '@react-hookz/web';
import { useAppKitNetwork } from '@reown/appkit/react';
import styled from 'styled-components';

import ChainIcon from 'src/domains/chains/components/ChainIcon';
import { Definition } from 'src/domains/chains/utils/definitions';
import supportedChains from 'src/domains/chains/utils/supportedChains';
import useChain from 'src/domains/chains/utils/useChain';
import Button from 'src/domains/misc/components/Button';
import CIcon from 'src/domains/misc/components/CIcon';
import SelectBox from 'src/domains/misc/components/SelectBox';
import { BOTTOM_MENU_BREAKPOINT, BREAKPOINTS } from 'src/domains/misc/consts/consts';
import { typography } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

const CHAIN_SELECTOR_WIDTH = 246;

const { testnet, mainnet } = supportedChains;

const ChainSelector = () => {
  const chainConfig = useChain();
  const isLargeScreen = useMediaQuery(`(min-width: ${BREAKPOINTS.sm})`);
  const { switchNetwork } = useAppKitNetwork();

  const renderOption = (chain: Definition) => ({
    onClick: () => void switchNetwork(chain),
    text:
      (
        <Option>
          <ChainIcon size={20} chainId={chain.id} />
          <p>{chain.name}</p>
          {chainConfig?.id === chain.id && <CIcon size={20} icon="CheckmarkRegular" />}
        </Option>
      ),
  });

  return (
    <StyledSelectBox
      align="start"
      sections={[
        { title: 'Mainnet', options: mainnet.map(renderOption) },
        { title: 'Testnet', options: testnet.map(renderOption) },
      ]}
    >
      <StyledButton variant="secondary">
        {chainConfig ? (
          <ButtonLeftContent>
            <ChainIcon chainId={chainConfig.id} size={24} />
            {isLargeScreen && chainConfig.name}
          </ButtonLeftContent>
        ) : (
          'Select Network'
        )}
        <CIcon icon="Chevron" color={vars('--color-neutral-foreground-3-rest')} />
        <UnderLine />
      </StyledButton>
    </StyledSelectBox>
  );
};

export default ChainSelector;

const ButtonLeftContent = styled.div`
  display: flex;
  align-items: center;
  gap: ${vars('--spacing-s')};
`;

const StyledSelectBox = styled(SelectBox)`
  width: ${CHAIN_SELECTOR_WIDTH}px;
`;

const StyledButton = styled(Button)`
  display: flex;

  position: relative;

  align-items: center;
  justify-content: space-between;
  gap: ${vars('--spacing-s')};

  padding-inline: ${vars('--spacing-s')};
  width: ${CHAIN_SELECTOR_WIDTH}px;

  background: ${vars('--color-neutral-background-1-rest')};
  border-color: ${vars('--color-neutral-stroke-2-rest')};
  overflow: hidden;

  ${typography.web.body1};

  @media (width <= ${BOTTOM_MENU_BREAKPOINT}) { /* stylelint-disable-line media-query-no-invalid */
    width: fit-content;
  }
`;

const Option = styled.div`
  display: flex;
  align-items: center;
  gap: ${vars('--spacing-s')};
  width: 100%;

  ${typography.web.body1Strong};

  & > ${CIcon} {
    margin-left: auto;
  }
`;

const UnderLine = styled.div`
  position: absolute;
  left: 0;
  bottom: 0;

  height: 1px;
  width: 100%;

  background: ${vars('--color-neutral-stroke-2-rest')};
`;
