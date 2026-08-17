window.__ModuleLoader__.load({
	id: "dsh-workspace-files",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/client/locales.ts
		/**
		* `workspaceFiles` namespace dictionaries for the file panel (button label,
		* panel chrome, empty/loading states, per-file open actions). The zh
		* dictionary is the key-set source of truth; en must cover every key.
		*/
		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = {
			"action.label": "文件",
			"panel.title": "Workspace 文件",
			"close": "关闭",
			"empty.noWorkspace": "当前会话不在任何 workspace 中",
			"empty.loading": "加载中…",
			"showHidden": "显示隐藏文件",
			"refresh": "刷新",
			"open.finder": "在 Finder 中显示",
			"open.finderDir": "在 Finder 中打开",
			"open.vscode": "用 VS Code 打开"
		};
		/** English dictionary, checked complete against the zh key set. */
		const en = {
			"action.label": "Files",
			"panel.title": "Workspace Files",
			"close": "Close",
			"empty.noWorkspace": "The current session is not in any workspace",
			"empty.loading": "Loading…",
			"showHidden": "Show hidden files",
			"refresh": "Refresh",
			"open.finder": "Reveal in Finder",
			"open.finderDir": "Open in Finder",
			"open.vscode": "Open with VS Code"
		};
		//#endregion
		//#region src/client/wsf.css.ts
		/**
		* Stylesheet for the workspace-files panel.
		*
		* Class names use the wsf- prefix and DSH theme aliases (--dsw-alias-*) so the
		* panel adapts to light/dark themes. The <style> tag is injected once at
		* bundle evaluation, mirroring how the framework's CSS-Modules pipeline injects
		* plugin styles.
		*/
		const css = {
			actionBtn: "wsf-action-btn",
			actionIcon: "wsf-action-icon",
			actionLabel: "wsf-action-label",
			backdrop: "wsf-backdrop",
			panel: "wsf-panel",
			header: "wsf-header",
			title: "wsf-title",
			close: "wsf-close",
			workspaceInfo: "wsf-workspace-info",
			workspaceTitle: "wsf-workspace-title",
			workspacePath: "wsf-workspace-path",
			toolbar: "wsf-toolbar",
			hiddenToggle: "wsf-hidden-toggle",
			refresh: "wsf-refresh",
			tree: "wsf-tree",
			row: "wsf-row",
			dirRow: "wsf-dir-row",
			arrow: "wsf-arrow",
			dirName: "wsf-dir-name",
			fileRow: "wsf-file-row",
			fileName: "wsf-file-name",
			fileActions: "wsf-file-actions",
			iconBtn: "wsf-icon-btn",
			loadingDot: "wsf-loading-dot",
			empty: "wsf-empty",
			error: "wsf-error"
		};
		const STYLE_ID = "dsh-workspace-files-css";
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
`;
		if (typeof document !== "undefined") {
			if (document.querySelector(`style[data-plugin-css="${STYLE_ID}"]`) === null) {
				const tag = document.createElement("style");
				tag.dataset.plugin = "dsh-workspace-files";
				tag.dataset.pluginCss = STYLE_ID;
				tag.textContent = CSS_TEXT;
				document.head.appendChild(tag);
			}
		}
		//#endregion
		//#region src/client/FileBrowser.tsx
		/**
		* Workspace file browser — browser half of the dsh-workspace-files plugin.
		*
		* Registers into the sidebar's `sidebar.footer.action` list slot: a footer
		* button ("文件") that toggles a floating right-side panel listing the current
		* session's workspace directory tree. Directory levels are lazy-loaded
		* through the host half's GET /ws-files/list endpoint. The panel follows the
		* current session: switching sessions re-targets the tree automatically.
		*/
		/** List one directory level through the host half's endpoint. */
		async function listDir(path) {
			const data = await (await fetch(`/ws-files/list?path=${encodeURIComponent(path)}`)).json();
			if (!data.ok) throw new Error(data.error);
			return data.entries;
		}
		/** Open a path through the host half's endpoint (Finder reveal / VS Code). */
		async function openWith(app, path) {
			await fetch(`/ws-files/open?app=${app}&path=${encodeURIComponent(path)}`);
		}
		/**
		* Render the footer action button and, while open, the floating file panel.
		* @param props - composed props (see FileBrowserProps).
		* @returns the button and (when open) the panel tree.
		*/
		function FileBrowser({ wide, t, useSessions, useWorkspaces }) {
			const [open, setOpen] = (0, react.useState)(false);
			const [entriesByDir, setEntriesByDir] = (0, react.useState)({});
			const [expanded, setExpanded] = (0, react.useState)({});
			const [loading, setLoading] = (0, react.useState)({});
			const [error, setError] = (0, react.useState)(null);
			const [showHidden, setShowHidden] = (0, react.useState)(false);
			const currentId = useSessions((s) => s.current);
			const items = useWorkspaces((s) => s.items);
			const currentWorkspace = (0, react.useMemo)(() => {
				if (currentId === void 0) return void 0;
				return items.find((workspace) => workspace.sessionIds.includes(currentId));
			}, [items, currentId]);
			const rootPath = currentWorkspace?.path;
			/** Load one directory level into the cache. */
			const load = (0, react.useCallback)(async (dir) => {
				setLoading((previous) => ({
					...previous,
					[dir]: true
				}));
				setError(null);
				try {
					const entries = await listDir(dir);
					setEntriesByDir((previous) => ({
						...previous,
						[dir]: entries
					}));
				} catch (cause) {
					setError(cause instanceof Error ? cause.message : String(cause));
				} finally {
					setLoading((previous) => ({
						...previous,
						[dir]: false
					}));
				}
			}, []);
			(0, react.useEffect)(() => {
				if (!open || rootPath === void 0) return;
				if (entriesByDir[rootPath] === void 0) load(rootPath);
			}, [
				open,
				rootPath,
				entriesByDir,
				load
			]);
			/** Expand/collapse one directory, loading its children on first expand. */
			const toggleDir = (0, react.useCallback)((dir) => {
				const next = expanded[dir] !== true;
				setExpanded((previous) => ({
					...previous,
					[dir]: next
				}));
				if (next && entriesByDir[dir] === void 0) load(dir);
			}, [
				expanded,
				entriesByDir,
				load
			]);
			/** Recursively render the children of one directory (depth = indent level). */
			const renderChildren = (dir, depth) => {
				return (entriesByDir[dir] ?? []).filter((entry) => showHidden || !entry.hidden).map((entry) => {
					const indent = { paddingLeft: `${12 + depth * 14}px` };
					if (entry.type === "dir") {
						const isOpen = expanded[entry.path] === true;
						return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: css.row,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: css.dirRow,
								style: indent,
								title: entry.path,
								onClick: () => {
									toggleDir(entry.path);
								},
								children: [
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: css.arrow,
										children: isOpen ? "▾" : "▸"
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: css.dirName,
										children: entry.name
									}),
									loading[entry.path] === true && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: css.loadingDot,
										children: "···"
									}),
									/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
										className: css.fileActions,
										children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: css.iconBtn,
											title: t("open.finderDir"),
											"aria-label": t("open.finderDir"),
											onClick: (event) => {
												event.stopPropagation();
												openWith("finder", entry.path);
											},
											children: "📂"
										})
									})
								]
							}), isOpen && renderChildren(entry.path, depth + 1)]
						}, entry.path);
					}
					return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: css.fileRow,
						style: indent,
						title: entry.path,
						onClick: () => {
							openWith("finder", entry.path);
						},
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: css.fileName,
							children: entry.name
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: css.fileActions,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: css.iconBtn,
								title: t("open.finder"),
								"aria-label": t("open.finder"),
								onClick: (event) => {
									event.stopPropagation();
									openWith("finder", entry.path);
								},
								children: "📂"
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: css.iconBtn,
								title: t("open.vscode"),
								"aria-label": t("open.vscode"),
								onClick: (event) => {
									event.stopPropagation();
									openWith("vscode", entry.path);
								},
								children: "⌨"
							})]
						})]
					}, entry.path);
				});
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: css.actionBtn,
				"aria-label": t("action.label"),
				title: t("action.label"),
				onClick: () => {
					setOpen((previous) => !previous);
				},
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: css.actionIcon,
					"aria-hidden": true,
					children: "🗂"
				}), wide && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: css.actionLabel,
					children: t("action.label")
				})]
			}), open && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				className: css.backdrop,
				onClick: () => {
					setOpen(false);
				}
			}), /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("aside", {
				className: css.panel,
				role: "dialog",
				"aria-label": t("panel.title"),
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("header", {
						className: css.header,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: css.title,
							children: t("panel.title")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: css.close,
							"aria-label": t("close"),
							onClick: () => {
								setOpen(false);
							},
							children: "✕"
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: css.workspaceInfo,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: css.workspaceTitle,
							children: currentWorkspace?.title ?? t("empty.noWorkspace")
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: css.workspacePath,
							children: rootPath ?? "—"
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
						className: css.toolbar,
						children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("label", {
							className: css.hiddenToggle,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: showHidden,
								onChange: (event) => {
									setShowHidden(event.target.checked);
								}
							}), t("showHidden")]
						}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: css.refresh,
							onClick: () => {
								if (rootPath !== void 0) load(rootPath);
							},
							children: t("refresh")
						})]
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: css.tree,
						children: rootPath === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: css.empty,
							children: t("empty.noWorkspace")
						}) : error !== null ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: css.error,
							children: error
						}) : loading[rootPath] === true && entriesByDir[rootPath] === void 0 ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: css.empty,
							children: t("empty.loading")
						}) : renderChildren(rootPath, 0)
					})
				]
			})] })] });
		}
		//#endregion
		//#region src/client/index.ts
		/** Dictionary namespace owned by this plugin. */
		const NS = "workspaceFiles";
		/** Cordis plugin name. */
		const name = "workspace-files-client";
		/** Services required before registration. */
		const inject = ["slots", "locale"];
		/**
		* Register the footer action once the sidebar slot declaration is on the
		* ledger. `sidebar.footer.action` is a LIST slot, so the registration
		* requires a unique `options.id` (enforced by SlotCore.register); the id
		* also keys the entry for later shadowing/removal.
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "workspace-files: dictionaries");
			ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
				name: "sidebar.footer.action",
				id: "workspace-files",
				locale: NS
			}, FileBrowser));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		exports.name = name;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map