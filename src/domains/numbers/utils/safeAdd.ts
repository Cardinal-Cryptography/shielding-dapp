import isPresent from 'src/domains/misc/utils/isPresent';

const safeAdd = (x: number | null | undefined, y: number | null | undefined) => (
  isPresent(x) && isPresent(y) ? x + y : undefined
);

export default safeAdd;
