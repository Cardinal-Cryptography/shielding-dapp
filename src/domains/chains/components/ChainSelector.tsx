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
  const isSelectedChainTestnet = testnet.some(c => c.id === chainConfig?.id);

  const renderOption = (chain: Definition) => {
    const isTestnet = testnet.some(c => c.id === chain.id);

    return {
      onClick: () => void switchNetwork(chain),
      text:
      (
        <Option>
          <ChainIcon size={20} chainId={chain.id} isTestnet={isTestnet} />
          <p>{chain.name}</p>
          {chainConfig?.id === chain.id && <CIcon size={20} icon="CheckmarkRegular" />}
        </Option>
      ),
    };
  };

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
            <ChainIcon chainId={chainConfig.id} size={24} isTestnet={isSelectedChainTestnet} />
            {isLargeScreen && chainConfig.name}
          </ButtonLeftContent>
        ) : (
          'Select Network'
        )}
        <ChevronIcon icon="ChevronLeft" />
      </StyledButton>
    </StyledSelectBox>
  );
};

export default ChainSelector;

const ChevronIcon = styled(CIcon)`
  transform: rotate(180deg);
`;

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

  align-items: center;
  justify-content: space-between;
  gap: ${vars('--spacing-s')};

  padding-inline: ${vars('--spacing-s')};
  width: ${CHAIN_SELECTOR_WIDTH}px;

  background: ${vars('--color-neutral-background-1-rest')};
  border-color: ${vars('--color-neutral-stroke-2-rest')};

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
