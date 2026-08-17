/**
 * Workspace files plugin — browser half.
 *
 * One registration into the sidebar's `sidebar.footer.action` list slot
 * (declared by ui-sidebar; currently unoccupied). Uses slots.inject() so
 * activation order relative to ui-sidebar is irrelevant, mirroring how
 * ui-workspace registers into its target slots. Registers its own locale
 * namespace (`workspaceFiles`) so UI copy follows the DSH interface language.
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
// Type-only: pulls the runtime's GlobalStandardProps merge and the sidebar's
// SlotMap declaration into this program.
import type {} from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import { en, zh, type WorkspaceFilesKey } from './locales.ts'
import { FileBrowser } from './FileBrowser.tsx'

export type { FileBrowserProps } from './FileBrowser.tsx'
export type { WorkspaceFilesKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** The file-panel copy owned by this plugin. */
    workspaceFiles: WorkspaceFilesKey
  }
}

/** Dictionary namespace owned by this plugin. */
const NS = 'workspaceFiles'

/** Cordis plugin name. */
export const name = 'workspace-files-client'

/** Services required before registration. */
export const inject = ['slots', 'locale']

/**
 * Register the footer action once the sidebar slot declaration is on the
 * ledger. `sidebar.footer.action` is a LIST slot, so the registration
 * requires a unique `options.id` (enforced by SlotCore.register); the id
 * also keys the entry for later shadowing/removal.
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'workspace-files: dictionaries')

  ctx.slots.inject('sidebar.footer.action', () => ctx.slots.register(
    { name: 'sidebar.footer.action', id: 'workspace-files', locale: NS },
    FileBrowser,
  ))
}
