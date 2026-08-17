/**
 * `workspaceFiles` namespace dictionaries for the file panel (button label,
 * panel chrome, empty/loading states, per-file open actions). The zh
 * dictionary is the key-set source of truth; en must cover every key.
 */

/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
  'action.label': '文件',
  'panel.title': 'Workspace 文件',
  'close': '关闭',
  'empty.noWorkspace': '当前会话不在任何 workspace 中',
  'empty.loading': '加载中…',
  'showHidden': '显示隐藏文件',
  'refresh': '刷新',
  'open.finder': '在 Finder 中显示',
  'open.finderDir': '在 Finder 中打开',
  'open.vscode': '用 VS Code 打开',
} satisfies Record<string, string>

/** The workspaceFiles namespace key union. */
export type WorkspaceFilesKey = keyof typeof zh

/** English dictionary, checked complete against the zh key set. */
export const en = {
  'action.label': 'Files',
  'panel.title': 'Workspace Files',
  'close': 'Close',
  'empty.noWorkspace': 'The current session is not in any workspace',
  'empty.loading': 'Loading…',
  'showHidden': 'Show hidden files',
  'refresh': 'Refresh',
  'open.finder': 'Reveal in Finder',
  'open.finderDir': 'Open in Finder',
  'open.vscode': 'Open with VS Code',
} satisfies Record<WorkspaceFilesKey, string>
