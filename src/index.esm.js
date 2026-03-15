import * as core from './core.js';
import * as net from './net.js';
import { IndexedDBControl } from './storage.js';
import { DbgTimmer } from './debug.js';

// Tree-shaking 支持
export * from './core.js';
export * from './net.js';
export { IndexedDBControl, DbgTimmer };

export default Object.freeze({
    ...core,
    ...net,
    IndexedDBControl,
    DbgTimmer
});