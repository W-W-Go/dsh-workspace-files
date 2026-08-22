/**
 * tsdown config for the out-of-tree `dsh-workspace-files` plugin.
 *
 * Two halves:
 *  - node half: src/index.ts -> lib/index.js  (host plugin: file-listing HTTP route)
 *  - browser half: src/client/index.ts -> lib/client.js (client plugin: sidebar
 *    footer action + floating file panel). The browser bundle must speak the
 *    shell's client-module protocol (window.__ModuleLoader__.load) and keep
 *    platform modules external — they resolve through the frozen module table
 *    at runtime, never through this bundle.
 *
 * CLIENT_EXTERNALS is imported from the deepseek-harness checkout so the
 * platform-module list cannot drift from the shell's seed table.
 */
const DSH_CHECKOUT = process.env.DSH_CHECKOUT
if (!DSH_CHECKOUT) {
  throw new Error('DSH_CHECKOUT not set. Set it to your deepseek-harness checkout path, e.g.: DSH_CHECKOUT=~/deepseek-harness pnpm build')
}

// Dynamic import: the platform-module list comes from the user's DSH checkout
// at build time. It must not drift from the shell's seed table. (Since DSH
// 0.1.1 the list lives in web/src/platform.ts; the old CLIENT_EXTERNALS export
// in tsdown.client.ts was removed by "build(client): enforce client package
// boundaries".)
const { PLATFORM_MODULES, PRELOADED_CLIENT_EXTERNALS } = await import(`${DSH_CHECKOUT}/packages/client/web/src/platform.ts`)

const ID = 'dsh-workspace-files'

export default [
  {
    // Node half (host plugin body). Runs inside the dsh host process; the
    // Loader resolves @deepseek-ai/cordis etc. from the profile's module
    // fallback, so everything but node builtins stays external.
    name: ID,
    entry: { index: 'src/index.ts' },
    outDir: 'lib',
    format: ['esm'],
    platform: 'node',
    target: 'es2024',
    dts: false,
    clean: true,
    fixedExtension: false,
    deps: { neverBundle: ['@deepseek-ai/cordis', '@deepseek-ai/dsh-host-webserver'] },
  },
  {
    // Browser half (client plugin bundle), served as /plugins/<id>/client.js.
    name: `${ID}/client`,
    entry: { client: 'src/client/index.ts' },
    outDir: 'lib',
    format: 'cjs',
    platform: 'browser',
    target: 'es2024',
    dts: false,
    clean: false,
    sourcemap: true,
    // Platform modules resolve from the loader module table at runtime;
    // everything else in this bundle is self-contained (no other deps).
    deps: { neverBundle: [...PLATFORM_MODULES, ...PRELOADED_CLIENT_EXTERNALS] },
    outputOptions: {
      entryFileNames: 'client.js',
      banner: `window.__ModuleLoader__.load({ id: ${JSON.stringify(ID)}, factory: (require) => {`,
      footer: 'return module.exports; } });',
      intro: 'var module = { exports: {} }; var exports = module.exports;',
    },
  },
]
