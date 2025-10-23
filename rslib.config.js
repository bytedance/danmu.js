/* eslint-env node */
import { defineConfig } from '@rslib/core'
import { DefinePlugin } from '@rspack/core'
import { copyFileSync, mkdirSync, readFileSync } from 'fs'

// 直接读取 package.json 版本
const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'))
const version = packageJson.version

export default defineConfig({
  lib: [
    { 
      format: 'cjs',
      fileName: 'index.cjs'
    },
    { 
      format: 'umd', 
      name: 'DanmuJs',
      bundle: true,
      syntax: 'es5'
    },
  ],
  define: {
    __VERSION__: JSON.stringify(version)
  },
  banner: {
    js: `/* Built @${new Date().toUTCString()} */`
  },
  output: {
    target: 'web',
    sourceMap: true,
    minify: true,
  },
  tools: {
    cssExtract: false,
    rspack: {
      module: {
        rules: [
          {
            test: /\.scss$/,
            use: [
              'style-loader',
              'css-loader',
              'sass-loader'
            ]
          }
        ]
      },
      plugins: [
        new DefinePlugin({
          __VERSION__: JSON.stringify(version)
        })
      ]
    }
  },
  plugins: [
    {
      name: 'afterBuildScripts',
      setup(api) {
        api.onAfterBuild(async () => {
          // 开发模式下跳过 UMD 兼容性处理
          const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--watch')
          if (isDev) {
            return
          }
          
          await makeUmdNodeCompatible()
          await copyToBrowserDirectory()
        })
      }
    }
  ]
})

/**
 * 使 UMD 文件兼容 Node.js 环境
 */
async function makeUmdNodeCompatible() {
  const fs = await import('fs')
  const umdPath = './dist/index.js'
  
  let content = fs.readFileSync(umdPath, 'utf8')
  
  // 全局变量兜底逻辑
  const globalFallback = [
    'typeof window!=="undefined"?window',
    'typeof self!=="undefined"?self',
    'typeof globalThis!=="undefined"?globalThis',
    'typeof global!=="undefined"?global',
    'this'
  ].join(':')
  
  // 替换 UMD 包装器中的 self
  const pattern = /([)}\s]*\(\s*)self(\s*,)/g
  content = content.replace(pattern, `$1${globalFallback}$2`)
  
  fs.writeFileSync(umdPath, content)
  console.log('✅ Modified UMD to be Node.js compatible')
}

/**
 * 复制 UMD 文件到 browser 目录
 */
async function copyToBrowserDirectory() {
  mkdirSync('./browser', { recursive: true })
  copyFileSync('./dist/index.js', './browser/index.js')
  console.log('✅ Copied dist/index.js to browser/index.js for backward compatibility')
}
