// @ts-expect-error fake-indexeddb does not expose FDBFactory in package.json "exports" — using internal path
import FDBFactory from 'fake-indexeddb/lib/FDBFactory';
// @ts-expect-error fake-indexeddb does not expose FDBKeyRange in package.json "exports" — using internal path
import FDBKeyRange from 'fake-indexeddb/lib/FDBKeyRange';

Object.defineProperty(window, 'indexedDB', {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  value: new FDBFactory(),
});

Object.defineProperty(window, 'IDBKeyRange', {
  value: FDBKeyRange,
});
