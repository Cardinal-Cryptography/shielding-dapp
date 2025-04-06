import { usePreviousDistinct } from '@react-hookz/web';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { isNullish } from 'utility-types';

import isPresent from 'src/domains/misc/utils/isPresent';

import parseSafeInt from './parseSafeInt';
import smartRound from './smartRound';

const DECIMALS_SEPARATORS = ['.', ','];

type Params = {
  value?: number | string,
  onValueChange?: (value: string) => void,
  maxDecimals?: number,
};

export default ({ value, onValueChange, maxDecimals }: Params = {}) => {
  const previousValue = usePreviousDistinct(value);

  const valueBN = isNullish(value) ? undefined : BigNumber(value || 0);

  const [inputValue, setInputValue] = useState(
    isNullish(valueBN) ? '' : smartRound(valueBN, maxDecimals)
  );

  useEffect(() => {
    if (value === previousValue) return;

    // this is to be able to compare partial number inputs like "10." or "10.0"
    const numericInputValue = Number(inputValue);
    const numericValue = isPresent(value) ? Number(value) : undefined;

    if (numericValue !== numericInputValue) {
      setInputValue(previousInputValue => {
        const maybeSeparator = DECIMALS_SEPARATORS.some(separator => previousInputValue.endsWith(separator)) ? '.' : '';
        return isNullish(valueBN) ? '' : `${smartRound(valueBN, maxDecimals)}${maybeSeparator}`;
      });
    }
    // we don't want to react anything other than token value changes - the other variables' values are relevant only at the time of the token values changing
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, previousValue]);

  const updateValue = (inputValue: string) => {
    const safeInputValue = parseSafeInt(inputValue);

    setInputValue(safeInputValue);
    onValueChange?.(Number(safeInputValue) > 0 ? safeInputValue : '0');
  };

  const sanitizeAndSetInputValue = (newInputValue: string) => {
    const setFallbackValue = () => void updateValue(inputValue || '0');

    const [wholePartString, decimalPartString] = splitWholeFromDecimal(newInputValue);

    if(!newInputValue.length) return void updateValue('0');

    const wholePart = BigNumber(wholePartString);
    if (wholePart.isNaN()) return void setFallbackValue();
    const sanitizedWholePart = wholePart.toFixed();

    if (decimalPartString === undefined) return void updateValue(sanitizedWholePart);
    const decimalPart = BigNumber(decimalPartString);

    if (decimalPartString.length > 0 && decimalPart.isNaN()) setFallbackValue();
    else updateValue(`${wholePart.toFixed()}.${decimalPartString.substring(0, maxDecimals)}`);
  };

  return [inputValue, sanitizeAndSetInputValue] as const;
};

// different devices and different locales use different decimal part separators that cannot be configured so we have to take them all into account
const splitWholeFromDecimal = (string: string) => string.split(
  new RegExp(`[${DECIMALS_SEPARATORS.join('')}]`)
) as [string, string | undefined];
