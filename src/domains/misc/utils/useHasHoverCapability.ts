import { useMediaQuery } from '@react-hookz/web';

// `(hover: hover)` alone is not enough, because mobile devices simulate hover upon touch
export default () => useMediaQuery('(hover: hover) and (pointer: fine)');
