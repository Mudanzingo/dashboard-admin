// Polyfills mínimos para librerías que esperan entorno Node
import { Buffer } from 'buffer';

if (typeof globalThis.global === 'undefined') {
  // @ts-ignore
  globalThis.global = globalThis;
}
if (typeof globalThis.process === 'undefined') {
  // @ts-ignore
  globalThis.process = { env: {} };
}
if (typeof globalThis.Buffer === 'undefined') {
  // @ts-ignore
  globalThis.Buffer = Buffer;
}
