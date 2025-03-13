import { themes, primitives } from 'src/domains/styling/utils/tokens';

type ThemeToken = keyof (typeof themes)[keyof typeof themes];

type FluidBreakPoint = {
  /* The token value should not contain the units - "px" is added automatically. */
  sizeToken: ThemeToken,
  atBreakpoint: number,
};

/**
 * A fluid responsive design helper composing a "clamp()" clause, which usage results in
 * smooth size changes based on the window size dimension, limited by some edge values.
 *
 * Values `a` and `b` are the coefficients of the `y = a * x + b` equation which
 * this function is solving for set parameters, where `x` is a window dimension
 * and `y` is the resulting, actual, applied size.
 *
 * It is based on css vars tokens instead of raw numbers as the sizes, in order to follow
 * the token-based theming architecture that we utilize.
 */
export default (min: FluidBreakPoint, max: FluidBreakPoint, dependsOn: 'vw' | 'vh') => {
  const minSize = parseFloat(primitives[themes.light[min.sizeToken]]);
  const maxSize = parseFloat(primitives[themes.light[max.sizeToken]]);

  const a = (maxSize - minSize) / (max.atBreakpoint - min.atBreakpoint);
  const b = maxSize - a * max.atBreakpoint;

  return `clamp(${minSize} * 1px, calc(${a} * 100${dependsOn} + ${b} * 1px), ${maxSize} * 1px)`;
};
