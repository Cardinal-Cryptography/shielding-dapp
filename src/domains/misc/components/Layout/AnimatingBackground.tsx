import styled from 'styled-components';

import vars from 'src/domains/styling/utils/vars';

import AnimatingBgSvg from './bgAnimation.svg?react';

const AnimatingBackground = () => (
  <Container>
    <AnimatingBgSvg />
    <AnimatingBgSvg />
  </Container>
);

export default AnimatingBackground;

const Container = styled.div`
  position: fixed;
  inset: 0;

  z-index: -1;
  
  & > * {
    /*
      The below values are a result of calculations aimed to achieve fluid responsiveness
      based on extrapolation of states defined by the designs. Those states are positions
      and sizes of the two animating elements on both desktop (1792x1084) and mobile (360x640):
      +----------------------+---------------+----------+----------+---------+
      |       element        |       x       |    y     |  width   |  height |
      +----------------------+---------------+----------+----------+---------+
      | 1st element desktop  |  -350px       |  250px   |  1450    |  896    |
      | 1st element mobile   |  -460px       |  140px   |  950opx  |  587px  |
      | 2nd element desktop  |  100vw - 700  |  -300px  |  1450    |  896    |
      | 2nd element mobile   |  100vw        |  -590    |  950opx  |  587px  |
      +----------------------+---------------+----------+----------+---------+
      
      Those states form points from which coefficients of the function "y = a * x + b"
      where found and used in the "calc()" function as follows: "calc(<a>vw + <b>px)".
      
      This made the designs fluid in respect to the width of the window. In order
      to make it better laid out in taller screens, some "calc(<a>vh + <b>px)" functions
      (calculated with the exact same method as described above, but with respect to the
      window height) were added using "max()" or "min()" (selected based on visual appeal)
      which make the browser choose between the width-based and height-based fluid dimensions.
     */
    position: fixed;
    width: calc(35vw + 824px);
    height: calc(22vw + 510px);

    & * {
      stroke: ${vars('--color-neutral-stroke-3-rest')};
    }
    
    &:nth-child(1) {
      top: max(calc(8vw + 110px), calc(25vh - 18px));
      left: calc(8vw - 490px);
    }
    
    &:nth-child(2) {
      top: min(calc(20vw - 650px), calc(60vh - 1000px));
      left: calc(100vw - (50vw - 175px));
    }
  }
`;
