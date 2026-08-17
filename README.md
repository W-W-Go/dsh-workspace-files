# dsh-workspace-files

DSH Web UI 插件：左侧栏底部"文件"按钮 → 浮动文件树面板，浏览当前会话 workspace 的目录；目录/文件可在 Finder 或 VS Code 中打开。

![demo](https://via.placeholder.com/800x400?text=workspace-files-plugin+demo)

## 功能

- 📂 **文件树浏览** — 左侧栏底部"文件"按钮，点击弹出浮动面板
- 🔍 **懒加载目录** — 跟随当前会话 workspace，按需展开目录
- 🖥️ **快速打开** — 目录/文件可在 Finder（macOS）或 VS Code 中打开
- 🌐 **多语言** — 支持中文/英文，跟随 DSH 界面语言

## 安装

### 从 GitHub 安装

```bash
cd ~/.dsh/profiles/web
pnpm add github:yourname/dsh-workspace-files
```

### 从本地安装

```bash
cd ~/.dsh/profiles/web
pnpm add /path/to/dsh-workspace-files
```

### 启用插件

编辑 `~/.dsh/profiles/web/package.json`，在 `dsh.profile.bundles` 数组中添加：

```json
{
  "dsh": {
    "profile": {
      "bundles": [
        "dsh-workspace-files",
        // ... 其他插件
      ]
    }
  }
}
```

重启 DSH Web UI 生效。

## 前提

- DSH **web** profile（UI 插件，headless 模式无意义）
- **macOS** — "在 Finder 中打开"功能需要 macOS；Windows/Linux 上 VS Code 打开功能可用，文件树浏览正常

## 验证

安装后确认：

1. 浏览器左侧栏底部出现"文件"（中文）/ "Files"（英文）按钮
2. 点击弹出文件树面板，跟随当前会话 workspace
3. `curl localhost:3080/plugins/dsh-workspace-files/client.js` → HTTP 200
4. `curl "localhost:3080/ws-files/list?path=/Users"` → JSON 列表

## 开发

### 构建

```bash
DSH_CHECKOUT=/path/to/deepseek-harness pnpm build
```

构建产物输出到 `lib/` 目录：
- `lib/index.js` — host 半（HTTP 端点）
- `lib/client.js` — browser 半（UI 面板）

### 目录结构

```
dsh-workspace-files/
├── src/
│   ├── index.ts              # host 半：/ws-files/list, /ws-files/open 端点
│   └── client/
│       ├── index.ts          # client 半：sidebar 注册 + locale
│       ├── FileBrowser.tsx   # 文件树 UI 组件
│       ├── locales.ts        # 中英文案字典
│       └── wsf.css.ts        # 面板样式
├── lib/                      # 构建产物
├── tsdown.config.ts          # 构建配置
├── package.json
└── cordis.patch.yml          # bundle 加载 patch
```

## 许可

MIT
