import { useMemo } from 'react';
import styled from 'styled-components';
import { isAddress } from 'viem';

import Button from 'src/domains/misc/components/Button';
import CIcon from 'src/domains/misc/components/CIcon';
import DoubleBorderBox from 'src/domains/misc/components/DoubleBorderBox';
import PasteButton from 'src/domains/misc/components/PasteButton';
import TextInput from 'src/domains/misc/components/TextInput';
import { typography } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

import shieldImage from '../shield.png';

type Props = {
  addressTo: string,
  setAddressTo: (address: string) => void,
  onConfirmClick: () => void,
};

const SelectAccountPage = ({ addressTo, setAddressTo, onConfirmClick }: Props) => {
  const errorMsg = useMemo(() => {
    if (addressTo && !isAddress(addressTo)) return 'Please provide a valid address';
    return null;
  }, [addressTo]);

  return (
    <Container>
      <Content>
        <Label>
          <p>Receiving address</p>
          <PasteButton size={20} onPaste={setAddressTo}>Paste</PasteButton>
        </Label>
        <TextInput
          placeholder="Input address"
          onClear={() => void setAddressTo('')}
          value={addressTo}
          onChange={e => void setAddressTo(e.target.value)}
          size="small"
          variant="outline"
        />
        {errorMsg && <ErrorMessage>{errorMsg}</ErrorMessage>}
      </Content>
      <Disclaimer>
        <InfoContainer>
          <CIcon icon="InfoRegular" size={20} color={vars('--color-neutral-foreground-3-rest')} />
          <p>
            You’re about to send tokens from your shielded account to a public account.
            It will originate from the shielded pool, leaving your old transfer history behind.
          </p>
        </InfoContainer>
        <ShieldImage src={shieldImage} alt="Shield icon" />
      </Disclaimer>
      <Button variant="primary" onClick={onConfirmClick} disabled={!isAddress(addressTo)}>
        Continue
      </Button>
    </Container>
  );
};

export default SelectAccountPage;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${vars('--spacing-xl')};
`;

const Content = styled(DoubleBorderBox.Content)`
  display: flex;

  flex-direction: column;
  gap: ${vars('--spacing-m')};

  margin: ${vars('--spacing-none')};
  padding: ${vars('--spacing-m')};

  background: ${vars('--color-neutral-background-4a-rest')};
`;

const Disclaimer = styled(Content)`
  flex-direction: row;
  justify-content: space-between;
  padding: ${vars('--spacing-xs')} 0 0 0;
`;

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${vars('--spacing-xs')};
  padding: ${vars('--spacing-m')} ${vars('--spacing-l')} ${vars('--spacing-l')};
  color: ${vars('--color-neutral-foreground-2-rest')};
  ${typography.web.caption1};
`;

const ShieldImage = styled.img`
  align-self: end;
  height: 120px;
  margin-bottom: -2px;
  margin-right: -32px;
  pointer-events: none;
`;

const Label = styled.div`
  display: flex;
  justify-content: space-between;
  ${typography.web.body1};
`;

const ErrorMessage = styled.div`
  color: ${vars('--color-status-danger-foreground-1-rest')};
  ${typography.web.caption1};
`;
