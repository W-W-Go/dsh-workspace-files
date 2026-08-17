/**
 * Workspace file browser — browser half of the dsh-workspace-files plugin.
 *
 * Registers into the sidebar's `sidebar.footer.action` list slot: a footer
 * button ("文件") that toggles a floating right-side panel listing the current
 * session's workspace directory tree. Directory levels are lazy-loaded
 * through the host half's GET /ws-files/list endpoint. The panel follows the
 * current session: switching sessions re-targets the tree automatically.
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { SnapshotSelectorHook } from '@deepseek-ai/dsh-client-ui-slots'
import type { SessionListState, WorkspaceListState } from '@deepseek-ai/dsh-client-runtime/client'
import type { WorkspaceFilesKey } from './locales.ts'
import { css } from './wsf.css.ts'

/** One listed child from the host endpoint. */
export interface FileEntry {
  name: string
  path: string
  type: 'dir' | 'file'
  hidden: boolean
}

interface ListOk { ok: true; path: string; entries: FileEntry[] }
interface ListError { ok: false; error: string }
type ListResult = ListOk | ListError

/** List one directory level through the host half's endpoint. */
async function listDir(path: string): Promise<FileEntry[]> {
  const res = await fetch(`/ws-files/list?path=${encodeURIComponent(path)}`)
  const data = (await res.json()) as ListResult
  if (!data.ok) throw new Error(data.error)
  return data.entries
}

/** Open a path through the host half's endpoint (Finder reveal / VS Code). */
async function openWith(app: 'finder' | 'vscode', path: string): Promise<void> {
  await fetch(`/ws-files/open?app=${app}&path=${encodeURIComponent(path)}`)
}

/**
 * Full component props: the footer-action owner share (wide), the locale seat
 * (t), plus the global runtime hooks the framework injects into every
 * root-scope slot component.
 */
export interface FileBrowserProps {
  /** Whether the sidebar renders wide content (false = 56px rail). */
  wide: boolean
  /** Locale translate function (registered under the workspaceFiles namespace). */
  t: (key: WorkspaceFilesKey) => string
  /** Framework-global hook: session list snapshot (current session id). */
  useSessions: SnapshotSelectorHook<SessionListState>
  /** Framework-global hook: workspace list snapshot (paths + session accounts). */
  useWorkspaces: SnapshotSelectorHook<WorkspaceListState>
}

/**
 * Render the footer action button and, while open, the floating file panel.
 * @param props - composed props (see FileBrowserProps).
 * @returns the button and (when open) the panel tree.
 */
export function FileBrowser({ wide, t, useSessions, useWorkspaces }: FileBrowserProps) {
  const [open, setOpen] = useState(false)
  const [entriesByDir, setEntriesByDir] = useState<Record<string, FileEntry[]>>({})
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | null>(null)
  const [showHidden, setShowHidden] = useState(false)

  // Follow the current session's workspace.
  const currentId = useSessions(s => s.current)
  const items = useWorkspaces(s => s.items)
  const currentWorkspace = useMemo(() => {
    if (currentId === undefined) return undefined
    return items.find(workspace => workspace.sessionIds.includes(currentId))
  }, [items, currentId])
  const rootPath = currentWorkspace?.path

  /** Load one directory level into the cache. */
  const load = useCallback(async (dir: string): Promise<void> => {
    setLoading(previous => ({ ...previous, [dir]: true }))
    setError(null)
    try {
      const entries = await listDir(dir)
      setEntriesByDir(previous => ({ ...previous, [dir]: entries }))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setLoading(previous => ({ ...previous, [dir]: false }))
    }
  }, [])

  // Load the root level when the panel opens or the workspace changes.
  useEffect(() => {
    if (!open || rootPath === undefined) return
    if (entriesByDir[rootPath] === undefined) void load(rootPath)
  }, [open, rootPath, entriesByDir, load])

  /** Expand/collapse one directory, loading its children on first expand. */
  const toggleDir = useCallback((dir: string): void => {
    const next = expanded[dir] !== true
    setExpanded(previous => ({ ...previous, [dir]: next }))
    if (next && entriesByDir[dir] === undefined) void load(dir)
  }, [expanded, entriesByDir, load])

  /** Recursively render the children of one directory (depth = indent level). */
  const renderChildren = (dir: string, depth: number): ReactNode => {
    const entries = (entriesByDir[dir] ?? []).filter(entry => showHidden || !entry.hidden)
    return entries.map(entry => {
      const indent = { paddingLeft: `${12 + depth * 14}px` }
      if (entry.type === 'dir') {
        const isOpen = expanded[entry.path] === true
        return (
          <div key={entry.path} className={css.row}>
            <button
              type="button"
              className={css.dirRow}
              style={indent}
              title={entry.path}
              onClick={() => { toggleDir(entry.path) }}
            >
              <span className={css.arrow}>{isOpen ? '▾' : '▸'}</span>
              <span className={css.dirName}>{entry.name}</span>
              {loading[entry.path] === true && <span className={css.loadingDot}>···</span>}
              <span className={css.fileActions}>
                <button
                  type="button"
                  className={css.iconBtn}
                  title={t('open.finderDir')}
                  aria-label={t('open.finderDir')}
                  onClick={(event) => { event.stopPropagation(); void openWith('finder', entry.path) }}
                >📂</button>
              </span>
            </button>
            {isOpen && renderChildren(entry.path, depth + 1)}
          </div>
        )
      }
      return (
        <div
          key={entry.path}
          className={css.fileRow}
          style={indent}
          title={entry.path}
          onClick={() => { void openWith('finder', entry.path) }}
        >
          <span className={css.fileName}>{entry.name}</span>
          <span className={css.fileActions}>
            <button
              type="button"
              className={css.iconBtn}
              title={t('open.finder')}
              aria-label={t('open.finder')}
              onClick={(event) => { event.stopPropagation(); void openWith('finder', entry.path) }}
            >📂</button>
            <button
              type="button"
              className={css.iconBtn}
              title={t('open.vscode')}
              aria-label={t('open.vscode')}
              onClick={(event) => { event.stopPropagation(); void openWith('vscode', entry.path) }}
            >⌨</button>
          </span>
        </div>
      )
    })
  }

  return (
    <>
      <button
        type="button"
        className={css.actionBtn}
        aria-label={t('action.label')}
        title={t('action.label')}
        onClick={() => { setOpen(previous => !previous) }}
      >
        <span className={css.actionIcon} aria-hidden>🗂</span>
        {wide && <span className={css.actionLabel}>{t('action.label')}</span>}
      </button>
      {open && (
        <>
          <div className={css.backdrop} onClick={() => { setOpen(false) }} />
          <aside className={css.panel} role="dialog" aria-label={t('panel.title')}>
            <header className={css.header}>
              <span className={css.title}>{t('panel.title')}</span>
              <button type="button" className={css.close} aria-label={t('close')} onClick={() => { setOpen(false) }}>✕</button>
            </header>
            <div className={css.workspaceInfo}>
              <div className={css.workspaceTitle}>{currentWorkspace?.title ?? t('empty.noWorkspace')}</div>
              <div className={css.workspacePath}>{rootPath ?? '—'}</div>
            </div>
            <div className={css.toolbar}>
              <label className={css.hiddenToggle}>
                <input type="checkbox" checked={showHidden} onChange={event => { setShowHidden(event.target.checked) }} />
                {t('showHidden')}
              </label>
              <button type="button" className={css.refresh} onClick={() => { if (rootPath !== undefined) void load(rootPath) }}>{t('refresh')}</button>
            </div>
            <div className={css.tree}>
              {rootPath === undefined
                ? <div className={css.empty}>{t('empty.noWorkspace')}</div>
                : error !== null
                  ? <div className={css.error}>{error}</div>
                  : loading[rootPath] === true && entriesByDir[rootPath] === undefined
                    ? <div className={css.empty}>{t('empty.loading')}</div>
                    : renderChildren(rootPath, 0)}
            </div>
          </aside>
        </>
      )}
    </>
  )
}
