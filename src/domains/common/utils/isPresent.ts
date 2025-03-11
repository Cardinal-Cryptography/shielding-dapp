import { isNullish } from 'utility-types';

export default (val: unknown): val is NonNullable<unknown> => !isNullish(val);
