import { RenderMode, ServerRoute } from '@angular/ssr';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

interface LakeStub {
  id: string;
}

function getAllLakeIds(): { id: string }[] {
  // Runs at build time (Node context) - reads the source file directly,
  // since no HTTP server is available yet during prerendering.
  const filePath = join(process.cwd(), 'src/assets/data/lakes.json');
  const lakes: LakeStub[] = JSON.parse(readFileSync(filePath, 'utf-8'));
  return lakes.map(lake => ({ id: lake.id }));
}

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'seen', renderMode: RenderMode.Prerender },
  { path: 'about', renderMode: RenderMode.Prerender },
  { path: 'contact', renderMode: RenderMode.Prerender },
  {
    path: 'lake/:id',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      return getAllLakeIds();
    }
  },
  { path: '**', renderMode: RenderMode.Client }
];
