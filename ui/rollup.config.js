import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import html from '@web/rollup-plugin-html';
import { importMetaAssets } from '@web/rollup-plugin-import-meta-assets';
import { terser } from 'rollup-plugin-terser';
import replace from '@rollup/plugin-replace';
import copy from "rollup-plugin-copy";

export default {
  input: 'index.html',
  output: {
    entryFileNames: 'index.js',
    chunkFileNames: '[hash].js',
    assetFileNames: '[hash][extname]',
    format: 'es',
    dir: 'dist',
  },
  preserveEntrySignatures: false,

  watch: {
    clearScreen: false,
  },

  plugins: [
    // copy({ // not needed anymore since bubble-big.png is directly encoded as base64
    //   targets: [{ src: "public/*", dest: "dist" }],
    // }),
    /** Enable using HTML as rollup entrypoint */
    replace({
      'process.env.HC_PORT': '8000',
      // 'process.env.HC_PORT': '8888',
      // 'process.env.HC_PORT': '8001',
      delimiters: ['', ''],
    }),
    html({
      minify: true,
      injectServiceWorker: true,
      serviceWorkerPath: 'dist/sw.js',
    }),
    /** Resolve bare module imports */
    nodeResolve({
      browser: true,
    }),
    commonjs(),
    /** Minify JS */
    terser(),
    /** Bundle assets references via import.meta.url */
    importMetaAssets(),
    /** Compile JS to a lower language target */
    babel({
      babelHelpers: 'bundled',
      presets: [
        [
          require.resolve('@babel/preset-env'),
          {
            targets: [
              'last 3 Chrome major versions',
              'last 3 Firefox major versions',
              'last 3 Edge major versions',
              'last 3 Safari major versions',
            ],
            modules: false,
            bugfixes: true,
          },
        ],
      ],
      plugins: [
        [
          require.resolve('babel-plugin-template-html-minifier'),
          {
            modules: {
              lit: ['html', { name: 'css', encapsulation: 'style' }],
            },
            failOnError: false,
            strictCSS: true,
            htmlMinifier: {
              collapseWhitespace: true,
              conservativeCollapse: true,
              removeComments: true,
              caseSensitive: true,
              minifyCSS: true,
            },
          },
        ],
      ],
    }),
  ],
};
