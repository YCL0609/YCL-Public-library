/*!
 * YCL public function Library by @YCL with MIT License
 * Built: 2026-02-22
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.__YCL_GLOBAL_EXPORTS__ = {}));
})(this, (function (exports) { 'use strict';

    /**
     * 检查是否处于调试模式
     * @returns {boolean} 是否处于调试模式
     */
    const isDebug = (() => {
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
    const isMobile = (() => {
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
    function getUrlParams(name) {
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
    function RandomString(length = 32) {
        const chatr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const result = new Array(length);
        for (let i = 0; i < length; i++) result[i] = chatr.charAt(Math.floor(Math.random() * chatr.length));
        return result.join('');
    }

    /**
     * 异步加载资源函数
     * @param {string} url 资源路径
     * @param {string} type 资源类型 ('js' 或 'css')
     * @param {boolean} [isModule=false] js资源是否为ES module
     * @param {boolean} [isasync=false] js资源是否为异步加载
     * @returns {Promise<void>} 返回一个Promise对象
     */
    function loadExternalResource(url, type, isModule = false, isasync = false) {
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
     * 测试并选择最快的服务器
     * @param {string[]} TestURLs 需要测试的服务器 URL 数组
     * @param {boolean} [isDebug=false] 调试模式：输出详细结果到控制台。
     * @returns {Promise<object[]>} 一个对象数组，包含每个服务器的 URL、耗时、是否出错、出错信息、是否最快等信息。
     */
    async function ServerChoose(TestURLs, isDebug = false) {
        if (!Array.isArray(TestURLs) || TestURLs.length === 0) {
            if (isDebug) console.warn("TestURLs 数组为空或无效。");
            return [];
        }
        const TIMEOUT_MS = 3000;
        const results = await Promise.all(
            TestURLs.map(async (url, index) => {
                const controller = new AbortController();
                const start = performance.now();
                let timeoutId;
                const timeoutPromise = new Promise((_, reject) => {
                    timeoutId = setTimeout(() => {
                        controller.abort();
                        reject(new Error(`Timeout after ${TIMEOUT_MS}ms`));
                    }, TIMEOUT_MS);
                });

                try {
                    const testUrl = `${url.endsWith('/') ? url : url + '/'}test.bin`;
                    const fetchPromise = fetch(testUrl, { signal: controller.signal });
                    const response = await Promise.race([fetchPromise, timeoutPromise]);
                    clearTimeout(timeoutId);
                    if (!response.ok) {
                        throw new Error(`HTTP Error: ${response.status} ${response.statusText || ''}`);
                    }
                    await response.arrayBuffer();
                    return { url, elapsedTime: performance.now() - start, isError: false, error: null, index };
                } catch (error) {
                    clearTimeout(timeoutId);
                    const end = performance.now();
                    return {
                        url,
                        elapsedTime: end - start,
                        isError: true,
                        error: error.message || error.toString(),
                        index
                    };
                }
            })
        );
        const validResults = results.filter(r => !r.isError);
        const minElapsedTime = validResults.length > 0
            ? Math.min(...validResults.map(r => r.elapsedTime))
            : Infinity;
        const finalResults = results.map(result => ({
            url: result.url,
            elapsedTime: Number(result.elapsedTime.toFixed(2)),
            isError: result.isError,
            errorMessage: result.error,
            isFastest: !result.isError && result.elapsedTime === minElapsedTime,
        }));
        if (isDebug) {
            finalResults.forEach(e => {
                const timeColor = e.isFastest ? '#00ff7f' : (e.elapsedTime < 1000 ? '#ffff00' : '#ffffff');
                const errorColor = e.isError ? '#ff4500' : '#32cd32';
                console.log(
                    `%c[${e.isFastest ? 'FASTEST' : 'NORMAL'}] %cURL: ${e.url} | %c耗时: ${e.elapsedTime}ms | %c出错: ${e.isError}`,
                    `font-weight: bold; color: ${e.isFastest ? '#00ff7f' : '#1e90ff'}`,
                    'color: #ffffff',
                    `color: ${timeColor}; font-weight: bold;`,
                    `color: ${errorColor}; font-weight: bold;`
                );
                if (e.isError) {
                    console.log(`%c错误信息: ${e.errorMessage}`, 'color:red');
                }
            });
        }
        return finalResults;
    }

    /**
     * @class IndexedDBControl
     * 基于 Promise 封装的 IndexedDB 数据库操作静态类。
     */
    class IndexedDBControl {
        static #dbCache = new Map();
        /**
         * 打开数据库, 如数据库不存在则创建一个新的数据库并添加对象存储
         * @param {string} dbName 数据库名称
         * @param {string} storeName 对象存储名称
         * @returns {Promise<IDBDatabase>} 返回一个 Promise 对象，表示数据库打开操作
         */
        static openDatabase(dbName, storeName) {
            if (!('indexedDB' in window)) {
                return Promise.reject(new Error('IndexedDB is not supported in this environment.'));
            }
            if (this.#dbCache.has(dbName)) return this.#dbCache.get(dbName);
            const dbPromise = new Promise((resolve, reject) => {
                const request = indexedDB.open(dbName, 1);
                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    if (!db.objectStoreNames.contains(storeName)) db.createObjectStore(storeName);
                };
                request.onsuccess = event => {
                    const db = event.target.result;
                    db.onclose = () => this.#dbCache.delete(dbName);
                    resolve(db);
                };
                request.onerror = event => {
                    this.#dbCache.delete(dbName);
                    reject(new Error(`IndexedDB open error: ${event.target.error.name}`));
                };
            });
            this.#dbCache.set(dbName, dbPromise);
            return dbPromise;
        }
        /**
         * @private
         * 封装 IndexedDB 事务操作，返回一个 Promise
         * @param {IDBDatabase} db - 已打开的数据库连接
         * @param {string} storeName - 对象存储名称
         * @param {IDBTransactionMode} mode - 事务模式 ('readonly' 或 'readwrite')
         * @param {function(IDBObjectStore): IDBRequest} operation - 执行的具体操作，返回 IDBRequest
         * @returns {Promise<any>} Promise，解析为请求结果
         */
        static #executeTransaction(db, storeName, mode, operation) {
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([storeName], mode);
                const store = transaction.objectStore(storeName);
                const request = operation(store);
                transaction.oncomplete = () => resolve(request.result);
                transaction.onerror = event => reject(new Error(`Transaction error: ${event.target.error.name}`));
                request.onerror = event => reject(new Error(`Request error: ${event.target.error.name}`));
            });
        }
        /**
         * 将数据存储到 IndexedDB 中
         * @param {string} dbName 数据库名称
         * @param {string} storeName 对象存储名称
         * @param {string} key 数据的键
         * @param {any} value 数据的值
         * @returns {Promise<void>} 返回一个 Promise 对象，表示数据存储操作
         */
        static async saveToIndexedDB(dbName, storeName, key, value) {
            const db = await this.openDatabase(dbName, storeName);
            await this.#executeTransaction(db, storeName, 'readwrite', (store) => store.put(value, key));
        }
        /**
         * 从 IndexedDB 中获取数据
         * @param {string} dbName 数据库名称
         * @param {string} storeName 对象存储名称
         * @param {string} key 数据的键
         * @returns {Promise<any>} 返回一个 Promise 对象，表示数据获取操作
         */
        static async getFromIndexedDB(dbName, storeName, key) {
            const db = await this.openDatabase(dbName, storeName);
            return this.#executeTransaction(db, storeName, 'readonly', (store) => store.get(key))
        }
    }

    /**
     * @class DbgTimmer
     * 性能调试计时器。通过创建实例并调用 setEnable(true) 来启用计时功能。
     */
    class DbgTimmer {
        #isEnabled = false;
        #timings = new Map();
        /**
         * 构造函数。默认情况下计时器是禁用的。
         * @param {boolean} [startEnabled=false] - 如果为 true，则创建时即启用计时器。
         */
        constructor(startEnabled = false) {
            this.#isEnabled = startEnabled;
        }
        /**
         * 设置计时器的启用状态。
         * @param {boolean} [status=false] - 如果为 true 则启用计时器，否则禁用。
         * @returns {void}
         */
        setEnable(status = false) {
            this.#isEnabled = status;
            if (!this.#isEnabled) this.#timings.clear();
        }
        /**
         * 开始一个名为 name 的计时。
         * 只有在计时器启用时才记录当前高精度时间。
         * @param {string} [name='noname'] - 计时器的名称。
         * @returns {void}
         */
        Start(name = 'noname') {
            if (!this.#isEnabled) return;
            this.#timings.set(name, performance.now());
        }
        /**
         * 停止名为 name 的计时，计算经过时间，并输出结果到控制台。
         * 如果计时器未启用或未找到起始时间，则不执行任何操作。
         * @param {string} [name='noname'] - 要停止的计时器的名称。
         * @param {string} [text=''] - 输出时显示的前缀文本。
         * @returns {number | undefined} 经过的时间（毫秒），如果未计时则返回 undefined。
         */
        Stop(name = 'noname', text = '') {
            if (!this.#isEnabled) return;
            const startTime = this.#timings.get(name);
            if (!startTime) return undefined;
            const now = performance.now();
            const time = now - startTime;
            if (typeof console !== 'undefined') {
                console.log(`${text || name}: %c${time}ms`, 'color: #6495ed');
            }
            this.#timings.delete(name);
            return time;
        }
    }

    if (typeof console !== 'undefined') {
        console.log(`
+---------------------------------------------------------+

         %co     o          %co o o          %co
           %co o           %co               %co
            %co           %co                %co
            %co            %co               %co
            %co             %co o o          %co o o o%c    
     
+--------------------------------------------------------+

我们一日日度过的所谓的日常，实际上可能是接连不断的奇迹！--京阿尼《日常》`,
            'color:#ff0', 'color:#0f0', 'color:#0ff',
            'color:#ff0', 'color:#0f0', 'color:#0ff',
            'color:#ff0', 'color:#0f0', 'color:#0ff',
            'color:#ff0', 'color:#0f0', 'color:#0ff',
            'color:#ff0', 'color:#0f0', 'color:#0ff',
            'color:#fff');
    }

    exports.DbgTimmer = DbgTimmer;
    exports.IndexedDBControl = IndexedDBControl;
    exports.RandomString = RandomString;
    exports.ServerChoose = ServerChoose;
    exports.getUrlParams = getUrlParams;
    exports.isDebug = isDebug;
    exports.isMobile = isMobile;
    exports.loadExternalResource = loadExternalResource;

}));
(function(g,n){var e=g[n];if(!e)return;for(var k in e){if(Object.prototype.hasOwnProperty.call(e,k)){g[k]=e[k]}}try{delete g[n]}catch(x){g[n]=void 0}})(typeof self!=='undefined'?self:(typeof window!=='undefined'?window:global),"__YCL_GLOBAL_EXPORTS__")
