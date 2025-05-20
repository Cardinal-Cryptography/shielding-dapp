import {
  IDBFactory,
  IDBKeyRange,
  IDBRequest,
} from 'fake-indexeddb';

Object.defineProperty(window, 'indexedDB', {
  value: new IDBFactory(),
});

Object.defineProperty(window, 'IDBKeyRange', {
  value: IDBKeyRange,
});

Object.defineProperty(window, 'IDBRequest', {
  value: IDBRequest,
});
