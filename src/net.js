/**
 * 异步加载资源函数 (Chromium 61+ / Gecko 60+)
 * @param {string} url 资源路径
 * @param {string} type 资源类型 ('js' 或 'css')
 * @param {boolean} [isModule=false] js资源是否为ES module
 * @param {boolean} [isasync=false] js资源是否为异步加载
 * @returns {Promise<void>} 返回一个Promise对象
 */
export function loadExternalResource(url, type, isModule = false, isasync = false) {
    if (typeof document === 'undefined' || !document.head) {
        return Promise.reject(new Error('loadExternalResource: Must be executed in DOM environment.'));
    }
    return new Promise((resolve, reject) => {
        let tag;
        switch (type) {
            case 'css':
                tag = document.createElement('link');
                tag.rel = 'stylesheet';
                tag.href = url;
                break;
            case 'js':
                tag = document.createElement('script');
                tag.src = url;
                tag.async = isasync;
                if (isModule) tag.type = 'module';
                break;
            default:
                return reject(new Error(`loadExternalResource: Invalid type "${type}".`));
        }
        tag.onload = resolve;
        tag.onerror = () => reject(new Error(`Failed to load resource: ${url}`));
        document.head.appendChild(tag);
    });
}

/**
 * 测试并选择最快的服务器 (Chromium 66+ / Gecko 57+)
 * @param {string[]} TestURLs 需要测试的服务器 URL 数组
 * @param {boolean} [isDebug=false] 调试模式：输出详细结果到控制台
 * @returns {Promise<object[]>} 按响应速度排序的数组，每个对象包含可用服务器的URL和耗时
 */
export async function ServerChoose(TestURLs, isDebug = false) {
    if (!Array.isArray(TestURLs) || TestURLs.length === 0) return [];

    const TIMEOUT = 3000;

    const results = await Promise.all(
        TestURLs.map(async (url) => {
            const controller = new AbortController();
            const start = performance.now();
            const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

            try {
                const separator = url.includes('?') ? '&' : '?';
                const testUrl = `${url}${separator}nocf=1`;
                // 测试服务器
                const response = await fetch(testUrl, {
                    method: 'HEAD',
                    signal: controller.signal,
                });
                clearTimeout(timeoutId);
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return { url, elapsedTime: performance.now() - start, }
            } catch (error) {
                clearTimeout(timeoutId);
                console.error(error);
                return { url, elapsedTime: -1 };
            }
        })
    );

    // 过滤掉所有报错/超时的节点,并按耗时升序排列
    const sorted = results
        .filter(r => r.elapsedTime > -1)
        .sort((a, b) => a.elapsedTime - b.elapsedTime);

    if (isDebug) results.forEach(e => console.log(`URL: ${e.url} | 耗时: ${e.elapsedTime}ms`));
    return sorted;
}