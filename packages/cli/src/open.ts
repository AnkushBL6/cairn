import { spawn } from 'node:child_process';

/** Best-effort: open a URL in the user's default browser. Never throws. */
export function openBrowser(url: string): void {
  try {
    const platform = process.platform;
    const command = platform === 'darwin' ? 'open' : platform === 'win32' ? 'cmd' : 'xdg-open';
    const args = platform === 'win32' ? ['/c', 'start', '', url] : [url];
    const child = spawn(command, args, { stdio: 'ignore', detached: true });
    child.on('error', () => {
      /* no browser available — the URL is printed for manual opening */
    });
    child.unref();
  } catch {
    /* best effort only */
  }
}
