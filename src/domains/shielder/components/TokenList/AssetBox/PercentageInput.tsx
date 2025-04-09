import styled from 'styled-components';

import CIcon from 'src/domains/misc/components/CIcon';
import { transitionTime, typography } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

import AutoResizingInput from './AutoResizingInput';
import useDecimalInputValue from './utils/useDecimalInputValue';

type Props = {
  value: number,
  onChange: (value: number) => unknown,
  highlighted?: boolean,
};

const PercentageInput = ({ value, onChange, highlighted }: Props) => {
  const [inputValue, setInputValue] = useDecimalInputValue({
    value,
    onValueChange: value => onChange(Number(value)),
    maxDecimals: 2,
  });

  return (
    <Container $highlighted={!!highlighted}>
      <PencilIcon icon="Pencil" size={14} color={vars('--color-neutral-foreground-4-rest')} />
      <Input
        placeholder="0"
        value={inputValue}
        onChange={e => void setInputValue(e.target.value)}
        inputMode="decimal"
        maxLength={20}
      />
      %
    </Container>
  );
};

export default PercentageInput;

const Input = styled(AutoResizingInput)`
  border: none;
  padding: 0;
  text-align: right;
  background: none;
  outline: none;
  
  ${typography.decorative.subtitle2}
`;

const Container = styled.label<{ $highlighted: boolean }>`
  display: flex;
  align-items: center;
  border-bottom: 1px dashed ${vars('--color-neutral-stroke-2-rest')};
  cursor: text;
  ${typography.decorative.subtitle2};

  &&, ${Input}, ${Input}::placeholder  {
    color: ${props => props.$highlighted ?
        vars('--color-status-danger-foreground-1-rest') :
        vars('--color-neutral-foreground-1-rest')
    };
    transition: color ${transitionTime};
  }
`;

const PencilIcon = styled(CIcon)`
  margin-right: ${vars('--spacing-xxs')};
`;
