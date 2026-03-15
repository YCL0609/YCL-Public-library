import terser from '@rollup/plugin-terser';

// Banner 文字
const bannerText = `/*!
 * YCL public function Library by @YCL with MIT License
 * Built: ${new Date().toISOString().slice(0, 10)}
 */`;

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
        file: 'dist/function.umd.min.js',
        format: 'umd',
        exports: 'default',
        name: 'YclUtils',
        banner: bannerText,
        sourcemap: true,
        plugins: [terserPlugin]
      }
    ]
  },
  // --- ESM 格式 ---
  {
    input: 'src/index.esm.js',
    output: [
      {
        file: 'dist/function.esm.min.js',
        format: 'esm',
        banner: bannerText,
        sourcemap: true,
        plugins: [terserPlugin]
      }
    ]
  }
];