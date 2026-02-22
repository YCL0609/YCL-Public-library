# YCL Public Library
一个 JavaScript 公共函数库，包含常用工具函数，使用 Rollup 打包。入口文件分别为`src/index.esm.js`和`src/index.umd.js`，打包配置为 `rollup.config.js`。<br>
A JavaScript public function library that includes commonly used utility functions, bundled using Rollup. The entry files are `src/index.esm.js` and `src/index.umd.js`, and the bundling configuration is `rollup.config.js`.
## 构建 - Construct
```bash
git clone https://github.com/YCL0609/YCL-Public-library.git
cd YCL-Public-library
npm install
npm run build
```
## 打包输出 - Package output
dist/function.esm.js -- ESM格式未压缩版本 (Uncompressed version of ESM format)<br>
dist/function.esm.min.js -- ESM格式已压缩版本 (Compressed version of ESM format)<br>
dist/function.umd.js -- UMD格式未压缩版本 (Uncompressed version of UMD format)<br>
dist/function.umd.min.js -- UMD格式未压缩版本 (Compressed version of UMD format)