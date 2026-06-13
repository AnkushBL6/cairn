/**
 * @cairn/cli — the `cairn` command and its programmatic API.
 *
 * Wires the pure graph engine and the studio to the filesystem: run a
 * brainstorming session, synthesize the project graph, and resume with full
 * context in a fresh session.
 */

export { CairnStore } from './store.js';
export * from './commands.js';
export { type CliIO, HELP, runCli, VERSION } from './run.js';
export { numFlag, parseArgs, strFlag } from './args.js';
export { openBrowser } from './open.js';
