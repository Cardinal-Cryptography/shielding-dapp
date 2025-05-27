import { DefaultError } from '@tanstack/react-query';
import { TransactionExecutionError } from 'viem';

const ERROR_NAME_BY_CODE = {
  4001: 'USER_REJECTED_REQUEST',
  4100: 'LOCKED_OR_UNAUTHORIZED',
} as const;

type KnownErrorCode = keyof typeof ERROR_NAME_BY_CODE;
type KnownErrorName = (typeof ERROR_NAME_BY_CODE)[keyof typeof ERROR_NAME_BY_CODE];

export const handleWalletError = (error: unknown): never => {
  if (error instanceof TransactionExecutionError) {
    const cause = error.cause as { code?: number };
    const code = cause.code?.toString() as KnownErrorCode | undefined;
    const knownErrorName = code ? ERROR_NAME_BY_CODE[code] : undefined;

    if (knownErrorName) {
      throw new Error(knownErrorName);
    }
    throw error;
  }
  throw error;
};

export const getWalletErrorName = (error: DefaultError): KnownErrorName | null => {
  const matches = Object.values(ERROR_NAME_BY_CODE).find(name =>
    error.message.includes(name)
  );

  return matches ?? null;
};
