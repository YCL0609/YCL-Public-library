/**
 * 检查是否处于调试模式 (Chromium 49+ / Gecko 44+)
 * @returns {boolean} 是否处于调试模式
 */
export const isDebug = (() => {
    const STORAGE_KEY = '__APP_RUNTIME_DEBUG__';
    const { hostname, search } = window.location;
    const urlParams = new URLSearchParams(search);

    // 1. 环境判断：增加了对 .local 后缀的支持
    const isLocal = /^(localhost|127\.0\.0\.1|::1|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|10\.)/i.test(hostname) || hostname.endsWith('.local');

    // 2. 参数获取：注意 get 返回 null 或 string
    const debugValue = urlParams.get('debug');

    // 3. 显式开关逻辑优化
    const explicitOn = ['1', 'true', 'yes', 'on'].includes(debugValue);
    // 只要有 debug 参数且不是开启指令，或者是明确的关闭指令，就判定为显式关闭
    const explicitOff = (urlParams.has('debug') && !explicitOn) || ['0', 'false', 'no', 'off'].includes(debugValue);

    let isDebugActive = false;

    if (explicitOn) {
        isDebugActive = true;
        sessionStorage.setItem(STORAGE_KEY, '1');
    } else if (explicitOff) {
        isDebugActive = false;
        sessionStorage.removeItem(STORAGE_KEY);
    } else {
        // 回退到 local 判断或 session 记忆
        isDebugActive = isLocal || sessionStorage.getItem(STORAGE_KEY) === '1';
    }

    return () => isDebugActive;
})();

/**
 * 判断访问设备 (Chromium 45+ / Gecko 45+)
 * @returns {boolean} true为手机, false为电脑
 */
export const isMobile = (() => {
    // 尝试现代 API
    if (navigator.userAgentData && navigator.userAgentData.mobile !== undefined) {
        const result = navigator.userAgentData.mobile;
        return () => result;
    }

    // 媒体查询判断交互方式
    const isTouchMode = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

    // 新款 iPad 在 Safari 中会自称是 Macintosh (Intel Mac)
    const isIPadOS = (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    // UA 正则检测
    const ua = navigator.userAgent || navigator.vendor || (window.opera || '');
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);

    // 最终结果
    const finalResult = isTouchMode || isIPadOS || isMobileUA;
    return () => finalResult;
})();

/**
 * 网页URL参数获取 (Chromium 60+ / Gecko 55+)
 * @param {string} [name] 不传返回所有值，传入则返回对应值
 * @returns {string|object|undefined} 参数值或所有参数对象，若URL中没有参数返回空对象，当给定参数不存在返回 undefined。
 */
export function getUrlParams(name) {
    const urlSearch = window.location.search;
    const params = new URLSearchParams(urlSearch);
    if (typeof name === 'string') name = name.trim();
    if (!name) {
        // 不传 name：返回所有参数的键值对对象
        const allParams = {};
        for (const [key, value] of params.entries()) {
            allParams[key] = value;
        }
        return allParams;
    } else {
        // 传入 name：返回特定参数的值
        const value = params.get(name);
        return value === null ? undefined : value; // 参数不存在时返回 undefined
    }
}

/**
 * 生成指定长度的随机字符串 (Chromium 60+ / Gecko 55+)
 * @param {number} [length=32] - 字符串的长度，默认为 32
 * @param {Object} [config] - 配置选项
 * @param {boolean} [config.UpCase=true] - 是否包含大写字母 (A-Z)
 * @param {boolean} [config.LowCase=true] - 是否包含小写字母 (a-z)
 * @param {boolean} [config.Number=true] - 是否包含数字 (0-9)
 * @param {boolean} [config.Symbol=false] - 是否包含特殊符号
 * @returns {string} 生成的随机字符串。如果所有配置项均为 false，则返回空字符串。
 */
export function RandomString(length = 32, config = { UpCase: true, LowCase: true, Number: true, Symbol: false }) {
    // 合并配置
    const settings = {
        UpCase: true,
        LowCase: true,
        Number: true,
        Symbol: false,
        ...config
    };

    // 构建字符池
    let charset = '';
    if (settings.UpCase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (settings.LowCase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (settings.Number) charset += '0123456789';
    if (settings.Symbol) charset += '!@#$%^&*()_+~`|}{[]:;?><,./-=';

    // 如果配置全为 false, 返回空字符串
    if (!charset) return '';

    // 随机
    const result = new Array(length);
    const charsetLength = charset.length;
    for (let i = 0; i < length; i++) {
        result[i] = charset.charAt(Math.floor(Math.random() * charsetLength));
    }

    return result.join('');
}