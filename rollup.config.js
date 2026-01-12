// rollup.config.js

import terser from '@rollup/plugin-terser';

// 临时全局变量名
const TEMP_GLOBAL_NAME = '__YCL_GLOBAL_EXPORTS__';
// Banner 文字
const bannerText = `/*!
 * YCL public function Library by @YCL with MIT License
 * Built: ${new Date().toISOString().slice(0, 10)}
 */`;

// UMD footer 代码
const umdFooter = `
(function () {
    if (typeof window === 'undefined') return;
    var exports = window['${TEMP_GLOBAL_NAME}'];
    if (exports) {
        for (var key in exports) {
            if (exports.hasOwnProperty(key)) {
                window[key] = exports[key];
            }
        }
        delete window['${TEMP_GLOBAL_NAME}'];
    }
})();
`;

// 压缩插件配置
const terserPlugin = terser({
    compress: { passes: 2 },
    format: { comments: /^\!/ }
});

export default [
    // UMD 压缩版
    {
        input: 'src/index.umd.js',
        output: {
            file: 'dist/function.bundle.min.js',
            format: 'umd',
            name: TEMP_GLOBAL_NAME,
            exports: 'named',
            banner: bannerText,
            footer: umdFooter,
        },
        plugins: [terserPlugin]
    },
    // UMD 未压缩版
    {
        input: 'src/index.umd.js',
        output: {
            file: 'dist/function.bundle.js',
            format: 'umd',
            name: TEMP_GLOBAL_NAME,
            exports: 'named',
            banner: bannerText,
            footer: umdFooter,
        },
        plugins: []
    },
    // ESM 压缩版
    {
        input: 'src/index.esm.js',
        output: {
            file: 'dist/function.esm.min.js',
            format: 'es',
            exports: 'named',
            banner: bannerText,
        },
        plugins: [terserPlugin]
    },
    // ESM 未压缩版
    {
        input: 'src/index.esm.js',
        output: {
            file: 'dist/function.esm.js',
            format: 'es',
            exports: 'named',
            banner: bannerText,
        },
        plugins: []
    }
];