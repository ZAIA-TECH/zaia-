import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

export default ({mode, command}) => {
  const envVariable = loadEnv(mode, process.cwd())
  console.log(mode !== 'develop'? envVariable.VITE_APP_PUBLISHPATH : '/');
  return defineConfig({
    base: mode !== 'develop'? envVariable.VITE_APP_PUBLISHPATH : '/',
    build: {
      outDir: envVariable.VITE_APP_OUTPUTDIR,
      chunkSizeWarningLimit: 1500,
      cssCodeSplit: true,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,  //打包时删除console
          drop_debugger: true, //打包时删除 debugger
          pure_funcs: ['console.log'],
        },
        output: {
          // 去掉注释内容
          comments: true,
        },
      },
    },
    plugins: [
      vue(),
      vueJsx(),
    ],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@import "./src/assets/css/common.scss";'
        }
      },
      postcss: {
        plugins: [
          require('postcss-pxtorem')({
            rootValue: 37.5, // 换算的基数
            selectorBlackList: [], // 忽略转换正则匹配项
            propList: ['*'],
            minPixelValue: 2,
            // unitPrecision: 1,
          }),
        ],
      },
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@img': fileURLToPath(new URL('./src/assets/images', import.meta.url)),
      }
    },
    server: {
      open: false,
      port: 9527,
      host: '0.0.0.0',
      // https: true,
      proxy: {
        '/composition': {
          target: envVariable.VITE_APP_TARGET + envVariable.VITE_APP_API_BASEURL,
          changeOrigin: true,
          rewrite: (path) => path.replace(new RegExp(`^${envVariable.VITE_APP_API_BASEURL}`), '')
        },
      }
    },
  })
} 
