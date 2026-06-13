import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import {
  CairnGraph,
  type GraphDoc,
  type ResumeBrief,
  renderDesignDoc,
  renderMermaid,
  summarizeForResume,
} from '@cairn/core';
import type { Transcript } from '@cairn/studio';

/**
 * The on-disk home of a project's "brain". All file I/O lives here so the core
 * engine can stay pure. The layout is committed to git so any fresh session
 * reloads full context.
 */
export class CairnStore {
  readonly root: string;
  readonly dir: string;
  readonly graphPath: string;
  readonly designPath: string;
  readonly mermaidPath: string;
  readonly sessionsDir: string;
  readonly runtimeDir: string;

  constructor(root: string = process.cwd()) {
    this.root = root;
    this.dir = join(root, '.cairn');
    this.graphPath = join(this.dir, 'graph.json');
    this.designPath = join(this.dir, 'design.md');
    this.mermaidPath = join(this.dir, 'graph.mmd');
    this.sessionsDir = join(this.dir, 'sessions');
    this.runtimeDir = join(this.dir, '.runtime');
  }

  exists(): boolean {
    return existsSync(this.graphPath);
  }

  /** Load the graph, or an empty one if the project hasn't been initialized. */
  async loadGraph(session = 'cli'): Promise<CairnGraph> {
    if (!this.exists()) {
      return new CairnGraph({ session });
    }
    const raw = await readFile(this.graphPath, 'utf8');
    const doc = JSON.parse(raw) as GraphDoc;
    return CairnGraph.fromJSON(doc, { session });
  }

  /** Persist the graph and regenerate the human-readable artifacts beside it. */
  async saveGraph(graph: CairnGraph): Promise<void> {
    await mkdir(this.dir, { recursive: true });
    await writeFile(this.graphPath, `${JSON.stringify(graph.toJSON(), null, 2)}\n`, 'utf8');
    await writeFile(this.designPath, `${renderDesignDoc(graph)}\n`, 'utf8');
    await writeFile(this.mermaidPath, `${renderMermaid(graph)}\n`, 'utf8');
  }

  /** Save a raw interview transcript. Returns the file path. */
  async saveSession(transcript: Transcript): Promise<string> {
    await mkdir(this.sessionsDir, { recursive: true });
    const path = join(this.sessionsDir, `${transcript.sessionId}.json`);
    await writeFile(path, `${JSON.stringify(transcript, null, 2)}\n`, 'utf8');
    return path;
  }

  /** Write an arbitrary file under `.cairn/`, creating parent dirs. */
  async writeArtifact(path: string, contents: string): Promise<void> {
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, contents, 'utf8');
  }

  async resumeBrief(): Promise<ResumeBrief> {
    return summarizeForResume(await this.loadGraph());
  }
}
