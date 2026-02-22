import terser from '@rollup/plugin-terser';
const TEMP_GLOBAL_NAME = '__YCL_GLOBAL_EXPORTS__';

// Banner 文字
const bannerText = `/*!
 * YCL public function Library by @YCL with MIT License
 * Built: ${new Date().toISOString().slice(0, 10)}
 */`;

// UMD footer 代码
const umdFooter = `(function(g,n){var e=g[n];if(!e)return;for(var k in e){if(Object.prototype.hasOwnProperty.call(e,k)){g[k]=e[k]}}try{delete g[n]}catch(x){g[n]=void 0}})(typeof self!=='undefined'?self:(typeof window!=='undefined'?window:global),"${TEMP_GLOBAL_NAME}")`;

// 压缩插件配置
const terserPlugin = terser({
    compress: { passes: 2 },
    format: { comments: /^\!/ }
});

export default [
  // --- UMD 格式 ---
  {
    input: 'src/index.umd.js',
    output: [
      {
        file: 'dist/function.umd.js',
        format: 'umd',
        name: TEMP_GLOBAL_NAME,
        exports: 'named',
        banner: bannerText,
        footer: umdFooter,
        indent: true
      },
      {
        file: 'dist/function.umd.min.js',
        format: 'umd',
        name: TEMP_GLOBAL_NAME,
        exports: 'named',
        banner: bannerText,
        footer: umdFooter,
        plugins: [terserPlugin]
      }
    ]
  },

  // --- ESM 格式 ---
  {
    input: 'src/index.esm.js',
    output: [
      {
        file: 'dist/function.esm.js',
        format: 'esm',
        banner: bannerText
      },
      {
        file: 'dist/function.esm.min.js',
        format: 'esm',
        banner: bannerText,
        plugins: [terserPlugin]
      }
    ]
  }
];