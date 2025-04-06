import styled from 'styled-components';
import { Nullish } from 'utility-types';

import { typography } from 'src/domains/styling/utils/tokens';
import vars from 'src/domains/styling/utils/vars';

type Props = {
  data: {
    text: string,
    /**
     * Position in px.
     */
    position: number,
  }[],
  highlightedIndex: number | Nullish,
  onLabelClick: (position: number) => unknown,
  onLabelHover: (index: number) => unknown,
  onLabelUnhover: () => unknown,
};

const Axis = ({ data, onLabelClick, highlightedIndex, onLabelHover, onLabelUnhover }: Props) => (
  <Container>
    {data.map(({ text, position }, i) => (
      <Label
        key={position}
        style={{ left: position }}
        onClick={() => void onLabelClick(position)}
        $highlighted={i === highlightedIndex}
        onMouseEnter={() => onLabelHover(i)}
        onMouseLeave={() => onLabelUnhover()}
      >
        {text}
      </Label>
    ))}
  </Container>
);

export default Axis;

const Container = styled.div`
  position: relative;
  height: 16px;
  
  ${typography.web.caption2}
`;

const Label = styled.div<{ $highlighted: boolean }>`
  display: inline-block;

  position: absolute;
  bottom: 0;

  text-align: center;
  color: ${props => props.$highlighted ?
      vars('--color-neutral-foreground-disabled-rest') :
      vars('--color-neutral-foreground-4-rest')
  };

  transition: color 0.3s;
  transform: translateX(-50%);
  cursor: pointer;

  user-select: none;
`;
