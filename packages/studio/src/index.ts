/**
 * @cairn/studio — the brainstorming studio.
 *
 * A structured interview model, a tiny live Node server, and a world-class
 * self-contained HTML wizard (with a static fallback for headless environments).
 */

export * from './interview.js';
export { renderWizard, type WizardOptions } from './wizard.js';
export { StudioServer, type StudioServerOptions } from './server.js';
