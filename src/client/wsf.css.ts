/**
 * Stylesheet for the workspace-files panel.
 *
 * Class names use the wsf- prefix and DSH theme aliases (--dsw-alias-*) so the
 * panel adapts to light/dark themes. The <style> tag is injected once at
 * bundle evaluation, mirroring how the framework's CSS-Modules pipeline injects
 * plugin styles.
 */
export const css = {
  actionBtn: 'wsf-action-btn',
  actionIcon: 'wsf-action-icon',
  actionLabel: 'wsf-action-label',
  backdrop: 'wsf-backdrop',
  panel: 'wsf-panel',
  header: 'wsf-header',
  title: 'wsf-title',
  close: 'wsf-close',
  workspaceInfo: 'wsf-workspace-info',
  workspaceTitle: 'wsf-workspace-title',
  workspacePath: 'wsf-workspace-path',
  toolbar: 'wsf-toolbar',
  hiddenToggle: 'wsf-hidden-toggle',
  refresh: 'wsf-refresh',
  tree: 'wsf-tree',
  row: 'wsf-row',
  dirRow: 'wsf-dir-row',
  arrow: 'wsf-arrow',
  dirName: 'wsf-dir-name',
  fileRow: 'wsf-file-row',
  fileName: 'wsf-file-name',
  fileActions: 'wsf-file-actions',
  iconBtn: 'wsf-icon-btn',
  loadingDot: 'wsf-loading-dot',
  empty: 'wsf-empty',
  error: 'wsf-error',
} as const

const STYLE_ID = 'dsh-workspace-files-css'

const CSS_TEXT = `
.wsf-action-btn{display:flex;align-items:center;gap:6px;height:32px;padding:0 10px;border:none;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary,#999);font-size:13px;cursor:pointer}
.wsf-action-btn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.15));color:var(--dsw-alias-label-primary,#eee)}
.wsf-action-icon{font-size:14px;line-height:1}
.wsf-backdrop{position:fixed;inset:0;z-index:900;background:var(--dsw-alias-bg-mask-drop,rgba(0,0,0,.35))}
.wsf-panel{position:fixed;top:0;right:0;bottom:0;width:360px;max-width:85vw;z-index:901;display:flex;flex-direction:column;background:var(--dsw-alias-bg-layer-1,#1e1f29);border-left:1px solid var(--dsw-alias-border-l2,#333);box-shadow:-8px 0 24px rgba(0,0,0,.25);color:var(--dsw-alias-label-primary,#eee);font-size:13px}
.wsf-header{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-bottom:1px solid var(--dsw-alias-border-l1,#2a2b36)}
.wsf-title{font-weight:600;font-size:14px}
.wsf-close{border:none;background:transparent;color:var(--dsw-alias-label-tertiary,#888);font-size:14px;cursor:pointer;padding:2px 6px;border-radius:4px}
.wsf-close:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.15));color:var(--dsw-alias-label-primary,#eee)}
.wsf-workspace-info{padding:10px 14px;border-bottom:1px solid var(--dsw-alias-border-l1,#2a2b36)}
.wsf-workspace-title{font-weight:500}
.wsf-workspace-path{margin-top:2px;font-size:12px;color:var(--dsw-alias-label-tertiary,#888);word-break:break-all}
.wsf-toolbar{display:flex;align-items:center;justify-content:space-between;padding:8px 14px;border-bottom:1px solid var(--dsw-alias-border-l1,#2a2b36)}
.wsf-hidden-toggle{display:flex;align-items:center;gap:6px;color:var(--dsw-alias-label-secondary,#aaa);font-size:12px;cursor:pointer}
.wsf-refresh{border:1px solid var(--dsw-alias-border-l2,#333);background:transparent;color:var(--dsw-alias-label-secondary,#aaa);font-size:12px;padding:2px 10px;border-radius:5px;cursor:pointer}
.wsf-refresh:hover{color:var(--dsw-alias-label-primary,#eee)}
.wsf-tree{flex:1;overflow-y:auto;padding:6px 0 12px}
.wsf-dir-row{display:flex;align-items:center;gap:4px;width:100%;border:none;background:transparent;color:var(--dsw-alias-label-primary,#eee);font-size:13px;height:26px;cursor:pointer;text-align:left}
.wsf-dir-row:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.12))}
.wsf-arrow{width:14px;flex:none;color:var(--dsw-alias-label-tertiary,#888);font-size:11px}
.wsf-dir-name{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.wsf-loading-dot{color:var(--dsw-alias-label-tertiary,#888);font-size:11px}
.wsf-file-row{display:flex;align-items:center;height:24px;padding-right:8px;color:var(--dsw-alias-label-secondary,#bbb);cursor:pointer}
.wsf-file-row:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.08))}
.wsf-file-name{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.wsf-file-actions{display:flex;gap:2px;opacity:0;flex:none}
.wsf-file-row:hover .wsf-file-actions{opacity:1}
.wsf-dir-row:hover .wsf-file-actions{opacity:1}
.wsf-icon-btn{border:none;background:transparent;color:var(--dsw-alias-label-tertiary,#888);font-size:12px;padding:0 3px;border-radius:4px;cursor:pointer;line-height:1}
.wsf-icon-btn:hover{background:var(--dsw-alias-interactive-bg-hover,rgba(128,128,128,.15));color:var(--dsw-alias-label-primary,#eee)}
.wsf-empty{padding:16px 14px;color:var(--dsw-alias-label-tertiary,#888);font-size:12px}
.wsf-error{padding:16px 14px;color:#e5534b;font-size:12px;white-space:pre-wrap}
`

if (typeof document !== 'undefined') {
  const existing = document.querySelector(`style[data-plugin-css="${STYLE_ID}"]`)
  if (existing === null) {
    const tag = document.createElement('style')
    tag.dataset.plugin = 'dsh-workspace-files'
    tag.dataset.pluginCss = STYLE_ID
    tag.textContent = CSS_TEXT
    document.head.appendChild(tag)
  }
}
