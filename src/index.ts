/**
 * Host half of the workspace-files plugin.
 *
 * Serves two endpoints for the browser half's file panel:
 *  - `GET /ws-files/list?path=<absolute>` — directory listing (files AND
 *    directories; symlinked directories resolved via stat). The built-in
 *    `host.listDirectory` capability only returns subdirectories, so this
 *    plugin adds its own readdir-backed route.
 *  - `GET /ws-files/open?app=finder|vscode&path=<absolute>` — hand a path to
 *    the OS: Finder (reveal files, open directory windows) or VS Code
 *    (`code -r`, falling back to `open -a "Visual Studio Code"`).
 *
 * Security note: like the client-modules /plugins route, this prefix route is
 * NOT behind the api-gateway trust fence — it is a direct webServer
 * registration. The open endpoint executes local programs on arbitrary
 * absolute paths the host user can reach. Treat this deployment as shell
 * access.
 */
import { execFile } from 'node:child_process'
import { readdir, stat } from 'node:fs/promises'
import { isAbsolute, join, resolve } from 'node:path'
import { promisify } from 'node:util'
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-host-webserver'

const execFileAsync = promisify(execFile)

/** Cordis plugin name. */
export const name = 'workspace-files'

/** Services required before registration. */
export const inject = ['webServer']

/** One listed child: a directory or a file. */
export interface FileEntry {
  name: string
  path: string
  type: 'dir' | 'file'
  hidden: boolean
}

/** JSON body of a successful listing. */
export interface ListResponse {
  ok: true
  path: string
  entries: FileEntry[]
}

/** JSON body of a failed listing. */
export interface ErrorResponse {
  ok: false
  error: string
}

function writeJson(res: import('node:http').ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(body))
}

/** Install the /ws-files prefix route.
 * @param ctx - plugin context (webServer provided).
 */
export function apply(ctx: Context): void {
  ctx.effect(
    () => ctx.webServer.register({
      kind: 'prefix',
      path: '/ws-files',
      handler: async (req, res) => {
        try {
          const url = new URL(req.url ?? '/', 'http://localhost')
          if (req.method !== 'GET') {
            writeJson(res, 405, { ok: false, error: 'GET only' })
            return
          }
          if (url.pathname === '/ws-files/list') {
            await handleList(url, res)
            return
          }
          if (url.pathname === '/ws-files/open') {
            await handleOpen(url, res)
            return
          }
          writeJson(res, 404, { ok: false, error: 'not found' })
        } catch (error) {
          writeJson(res, 200, {
            ok: false,
            error: error instanceof Error ? error.message : String(error),
          })
        }
      },
    }),
    'workspace-files: routes',
  )
}

/** One directory level plus the ancestry, for the tree browser. */
async function handleList(url: URL, res: import('node:http').ServerResponse): Promise<void> {
  const raw = url.searchParams.get('path')
  if (raw === null || raw === '' || !isAbsolute(raw)) {
    writeJson(res, 400, { ok: false, error: 'absolute path required' })
    return
  }
  const path = resolve(raw)
  const dirents = await readdir(path, { withFileTypes: true })
  const entries: FileEntry[] = []
  for (const entry of dirents) {
    if (entry.name === '.' || entry.name === '..') continue
    const childPath = join(path, entry.name)
    let type: 'dir' | 'file'
    if (entry.isDirectory()) {
      type = 'dir'
    } else if (entry.isSymbolicLink()) {
      // isDirectory() does not follow symlinks: resolve the target so
      // symlinked directories stay expandable in the tree.
      try {
        type = (await stat(childPath)).isDirectory() ? 'dir' : 'file'
      } catch {
        type = 'file' // dangling symlink
      }
    } else {
      type = 'file'
    }
    entries.push({ name: entry.name, path: childPath, type, hidden: entry.name.startsWith('.') })
  }
  entries.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'dir' ? -1 : 1
    return a.name.localeCompare(b.name)
  })
  writeJson(res, 200, { ok: true, path, entries })
}

/**
 * Hand a path to the OS. `app=finder`: reveal files in Finder (`open -R`) and
 * open directory windows (`open`); `app=vscode`: open in VS Code (`code -r`,
 * falling back to `open -a "Visual Studio Code"`).
 */
async function handleOpen(url: URL, res: import('node:http').ServerResponse): Promise<void> {
  const app = url.searchParams.get('app')
  const raw = url.searchParams.get('path')
  if ((app !== 'finder' && app !== 'vscode') || raw === null || raw === '' || !isAbsolute(raw)) {
    writeJson(res, 400, { ok: false, error: 'app=finder|vscode and an absolute path are required' })
    return
  }
  const path = resolve(raw)
  try {
    if (app === 'finder') {
      const info = await stat(path)
      if (info.isDirectory()) await execFileAsync('open', [path])
      else await execFileAsync('open', ['-R', path])
    } else {
      try {
        await execFileAsync('code', ['-r', path])
      } catch {
        // No `code` CLI on PATH: fall back to the installed app.
        await execFileAsync('open', ['-a', 'Visual Studio Code', path])
      }
    }
    writeJson(res, 200, { ok: true })
  } catch (error) {
    writeJson(res, 200, {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
