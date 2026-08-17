import { execFile } from "node:child_process";
import { readdir, stat } from "node:fs/promises";
import { isAbsolute, join, resolve } from "node:path";
import { promisify } from "node:util";
//#region src/index.ts
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
const execFileAsync = promisify(execFile);
/** Cordis plugin name. */
const name = "workspace-files";
/** Services required before registration. */
const inject = ["webServer"];
function writeJson(res, status, body) {
	res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
	res.end(JSON.stringify(body));
}
/** Install the /ws-files prefix route.
* @param ctx - plugin context (webServer provided).
*/
function apply(ctx) {
	ctx.effect(() => ctx.webServer.register({
		kind: "prefix",
		path: "/ws-files",
		handler: async (req, res) => {
			try {
				const url = new URL(req.url ?? "/", "http://localhost");
				if (req.method !== "GET") {
					writeJson(res, 405, {
						ok: false,
						error: "GET only"
					});
					return;
				}
				if (url.pathname === "/ws-files/list") {
					await handleList(url, res);
					return;
				}
				if (url.pathname === "/ws-files/open") {
					await handleOpen(url, res);
					return;
				}
				writeJson(res, 404, {
					ok: false,
					error: "not found"
				});
			} catch (error) {
				writeJson(res, 200, {
					ok: false,
					error: error instanceof Error ? error.message : String(error)
				});
			}
		}
	}), "workspace-files: routes");
}
/** One directory level plus the ancestry, for the tree browser. */
async function handleList(url, res) {
	const raw = url.searchParams.get("path");
	if (raw === null || raw === "" || !isAbsolute(raw)) {
		writeJson(res, 400, {
			ok: false,
			error: "absolute path required"
		});
		return;
	}
	const path = resolve(raw);
	const dirents = await readdir(path, { withFileTypes: true });
	const entries = [];
	for (const entry of dirents) {
		if (entry.name === "." || entry.name === "..") continue;
		const childPath = join(path, entry.name);
		let type;
		if (entry.isDirectory()) type = "dir";
		else if (entry.isSymbolicLink()) try {
			type = (await stat(childPath)).isDirectory() ? "dir" : "file";
		} catch {
			type = "file";
		}
		else type = "file";
		entries.push({
			name: entry.name,
			path: childPath,
			type,
			hidden: entry.name.startsWith(".")
		});
	}
	entries.sort((a, b) => {
		if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
		return a.name.localeCompare(b.name);
	});
	writeJson(res, 200, {
		ok: true,
		path,
		entries
	});
}
/**
* Hand a path to the OS. `app=finder`: reveal files in Finder (`open -R`) and
* open directory windows (`open`); `app=vscode`: open in VS Code (`code -r`,
* falling back to `open -a "Visual Studio Code"`).
*/
async function handleOpen(url, res) {
	const app = url.searchParams.get("app");
	const raw = url.searchParams.get("path");
	if (app !== "finder" && app !== "vscode" || raw === null || raw === "" || !isAbsolute(raw)) {
		writeJson(res, 400, {
			ok: false,
			error: "app=finder|vscode and an absolute path are required"
		});
		return;
	}
	const path = resolve(raw);
	try {
		if (app === "finder") if ((await stat(path)).isDirectory()) await execFileAsync("open", [path]);
		else await execFileAsync("open", ["-R", path]);
		else try {
			await execFileAsync("code", ["-r", path]);
		} catch {
			await execFileAsync("open", [
				"-a",
				"Visual Studio Code",
				path
			]);
		}
		writeJson(res, 200, { ok: true });
	} catch (error) {
		writeJson(res, 200, {
			ok: false,
			error: error instanceof Error ? error.message : String(error)
		});
	}
}
//#endregion
export { apply, inject, name };
