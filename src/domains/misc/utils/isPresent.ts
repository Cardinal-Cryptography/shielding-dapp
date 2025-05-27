import { isNullish } from 'utility-types';

export default <T>(val: T): val is NonNullable<T> => !isNullish(val);
