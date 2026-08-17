#!/usr/bin/env node

/**
 * setup.mjs — 一键安装 dsh-workspace-files 插件
 *
 * 功能：
 * 1. 读取 DSH_CHECKOUT 环境变量（或 --dsh-checkout 参数）
 * 2. 调用 tsdown 构建插件
 * 3. 自动更新 profile package.json 的 dsh.profile.bundles 数组
 * 4. 提示用户重启 DSH web
 *
 * 用法：
 *   DSH_CHECKOUT=~/deepseek-harness node scripts/setup.mjs              # 环境变量
 *   node scripts/setup.mjs --dsh-checkout ~/deepseek-harness             # 命令行参数
 *   node scripts/setup.mjs --profile headless --dsh-checkout ~/dsh       # 指定 profile
 */

import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── 解析命令行参数 ──
function parseArgs() {
  const args = process.argv.slice(2)
  const options = {
    profile: 'web',
    dshCheckout: undefined,
  }

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--profile' && args[i + 1]) {
      options.profile = args[++i]
    } else if (args[i] === '--dsh-checkout' && args[i + 1]) {
      options.dshCheckout = args[++i]
    }
  }

  return options
}

// ── 工具函数 ──
function log(msg) {
  console.log(`\x1b[0m${msg}\x1b[0m`)
}

function logSuccess(msg) {
  console.log(`\x1b[32m✓\x1b[0m ${msg}`)
}

function logWarn(msg) {
  console.log(`\x1b[33m⚠\x1b[0m ${msg}`)
}

function logError(msg) {
  console.log(`\x1b[31m✗\x1b[0m ${msg}`)
}

function readJSON(path) {
  return JSON.parse(readFileSync(path, 'utf-8'))
}

function writeJSON(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf-8')
}

// ── 主流程 ──
function main() {
  const options = parseArgs()

  // 1. 确定 DSH_CHECKOUT
  const dshCheckout = options.dshCheckout || process.env.DSH_CHECKOUT
  if (!dshCheckout) {
    logError('DSH_CHECKOUT 未设置')
    logError('用法: DSH_CHECKOUT=~/deepseek-harness node scripts/setup.mjs')
    logError('   或: node scripts/setup.mjs --dsh-checkout ~/deepseek-harness')
    process.exit(1)
  }

  process.env.DSH_CHECKOUT = dshCheckout
  log(`DSH_CHECKOUT = ${dshCheckout}`)

  // 2. 读取插件 package.json
  const pluginPkgPath = join(__dirname, '..', 'package.json')
  if (!existsSync(pluginPkgPath)) {
    logError(`找不到插件 package.json: ${pluginPkgPath}`)
    process.exit(1)
  }

  const pluginPkg = readJSON(pluginPkgPath)
  const pluginName = pluginPkg.name
  const pluginVersion = pluginPkg.version
  log(`插件: ${pluginName}@${pluginVersion}`)

  // 3. 构建插件
  log('\n🔨 开始构建插件...')
  const tsdownPath = join(dshCheckout, 'node_modules/.bin/tsdown')
  if (!existsSync(tsdownPath)) {
    logError(`找不到 tsdown: ${tsdownPath}`)
    logError('请确认 DSH_CHECKOUT 路径正确，且已运行 pnpm install')
    process.exit(1)
  }

  try {
    execSync(`${tsdownPath}`, {
      cwd: join(__dirname, '..'),
      stdio: 'inherit',
      env: { ...process.env, DSH_CHECKOUT: dshCheckout },
    })
    logSuccess('构建完成')
  } catch (error) {
    logError('构建失败')
    process.exit(1)
  }

  // 4. 更新 profile package.json
  const profilePkgPath = join(process.env.HOME, '.dsh', 'profiles', options.profile, 'package.json')
  if (!existsSync(profilePkgPath)) {
    logError(`找不到 profile package.json: ${profilePkgPath}`)
    logError('请确认 profile 名称正确 (默认: web)')
    process.exit(1)
  }

  const profilePkg = readJSON(profilePkgPath)
  const bundles = profilePkg.dsh?.profile?.bundles || []

  if (bundles.includes(pluginName)) {
    logWarn(`"${pluginName}" 已在 bundles 中，跳过添加`)
  } else {
    bundles.push(pluginName)
    if (!profilePkg.dsh) profilePkg.dsh = {}
    if (!profilePkg.dsh.profile) profilePkg.dsh.profile = {}
    profilePkg.dsh.profile.bundles = bundles
    writeJSON(profilePkgPath, profilePkg)
    logSuccess(`已将 "${pluginName}" 添加到 ${options.profile} profile 的 bundles`)
  }

  // 5. 检查依赖是否已安装
  const deps = profilePkg.dependencies || {}
  if (deps[pluginName]) {
    logSuccess(`依赖 "${pluginName}" 已安装`)
  } else {
    logWarn(`依赖 "${pluginName}" 未安装，请先运行:`)
    log(`   cd ~/.dsh/profiles/${options.profile} && pnpm add ${pluginName}`)
  }

  // 6. 提示重启
  log('\n' + '='.repeat(50))
  logSuccess('安装完成！')
  log('下一步：')
  log(`  1. 确认依赖已安装: pnpm add ${pluginName} (在 ~/.dsh/profiles/${options.profile})`)
  log('  2. 重启 DSH Web UI')
  log('  3. 浏览器确认左侧栏底部出现"文件"按钮')
  log('='.repeat(50) + '\n')
}

main()
