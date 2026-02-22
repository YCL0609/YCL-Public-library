/**
 * 检查是否处于调试模式
 * @returns {boolean} 是否处于调试模式
 */
export const isDebug = (() => {
    const STORAGE_KEY = '__APP_RUNTIME_DEBUG__';
    const { hostname, search } = window.location;
    const urlParams = new URLSearchParams(search);

    // 本地环境识别
    const isLocal = /^(localhost|127\.0\.0\.1|::1|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|10\.)/i.test(hostname);

    // URL 指令解析
    const debugValue = urlParams.get('debug');

    // 显式开启
    const explicitOn = ['1', 'true', 'dev', 'admin'].includes(debugValue);

    // 显式关闭
    const explicitOff = debugValue === 'false' || debugValue === '0' || (urlParams.has('debug') && !explicitOn);

    // 状态同步与持久化
    let isDebugActive = false;
    if (explicitOn) {
        isDebugActive = true;
        try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch (e) { }
    } else if (explicitOff) {
        isDebugActive = false;
        try { sessionStorage.removeItem(STORAGE_KEY); } catch (e) { }
    } else {
        // 回退到本地检测或 Session 记忆
        isDebugActive = isLocal || sessionStorage.getItem(STORAGE_KEY) === '1';
    }

    return () => isDebugActive;
})();

/**
 * 判断访问设备
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
 * 网页URL参数获取
 * @param {string} [name] 不传返回所有值，传入则返回对应值
 * @returns {string|object|undefined} 参数值或所有参数对象，若URL中没有参数返回空对象，当给定参数不存在返回 undefined。
 */
export function getUrlParams(name) {
    const urlSearch = window.location.search;
    const params = new URLSearchParams(urlSearch);
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
 * 生成指定长度的随机字符串
 * @param {number} [length=32] - 随机字符串的长度，默认32位
 * @returns {string} 一个长度为 length 的随机字符串
 */
export function RandomString(length = 32) {
    const chatr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const result = new Array(length);
    for (let i = 0; i < length; i++) result[i] = chatr.charAt(Math.floor(Math.random() * chatr.length));
    return result.join('');
}