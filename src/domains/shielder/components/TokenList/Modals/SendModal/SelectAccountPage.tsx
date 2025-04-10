import { motion, AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { isAddress } from 'viem';

import Button from 'src/domains/misc/components/Button';
import CIcon from 'src/domains/misc/components/CIcon';
import DoubleBorderBox from 'src/domains/misc/components/DoubleBorderBox';
import PasteButton from 'src/domains/misc/components/PasteButton';
import TextInput from 'src/domains/misc/components/TextInput';
import { BEST_PRACTICES_LINK } from 'src/domains/misc/consts/consts';
import shieldImage from 'src/domains/shielder/assets/shield.png';
import { typography } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

type Props = {
  addressTo: string,
  setAddressTo: (address: string) => void,
  onConfirmClick: () => void,
};

const SelectAccountPage = ({ addressTo, setAddressTo, onConfirmClick }: Props) => {
  const [isExpanded, setIsExpanded] = useState(false);

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
      <Accordion>
        <AccordionHeader onClick={() => void setIsExpanded(curr => !curr)}>
          <AccordionTitle>
            Improve your privacy
          </AccordionTitle>
          <ChevronIconWrapper
            initial={{ rotateZ: -90 }}
            animate={{ rotateZ: isExpanded ? -270 : -90 }}
          >
            <CIcon icon="ChevronLeft" size={18} />
          </ChevronIconWrapper>
        </AccordionHeader>
        <AnimatePresence>
          {isExpanded && (
            <AccordionContent
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <AccordionItem>Send tokens to a newly created public accounts</AccordionItem>
              <AccordionItem>Divide your transfers into a few smaller batches</AccordionItem>
              <AccordionItem>Use rounded amounts for transfers, like 5.00, 30.00, or 100.00 USDC</AccordionItem>
              <AccordionItem>Spread the transfers in time</AccordionItem>
              <Link href={BEST_PRACTICES_LINK} target="_blank" rel="noopener noreferrer">Learn more</Link>
            </AccordionContent>
          )}
        </AnimatePresence>
      </Accordion>
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

const Accordion = styled(Content)`
  gap: ${vars('--spacing-none')};
  padding: ${vars('--spacing-l')};
`;

const AccordionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
`;

const AccordionTitle = styled.p`
  ${typography.web.caption1Strong};
`;

const AccordionContent = styled(motion.ul)`
  display: flex;
  flex-direction: column;
  gap: ${vars('--spacing-xs')};
  padding-top: ${vars('--spacing-m')};

  list-style-type: disc;
`;

const AccordionItem = styled.li`
  display: flex;
  gap: ${vars('--spacing-s')};
  align-items: start;
  ${typography.web.caption1};

  &::before {
    content: '•';
    color: currentcolor;
    line-height: 130%;
  }
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

const ChevronIconWrapper = styled(motion.div)`
  display: flex;
  align-self: center;

  justify-self: end;
`;

const Link = styled.a`
  color: ${vars('--color-brand-foreground-link-rest')};

  text-decoration: none;
  ${typography.web.body1}
`;
