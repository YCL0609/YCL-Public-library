/**
 * @class IndexedDBControl
 * 基于 Promise 封装的 IndexedDB 数据库操作静态类 (Chromium 74+ / Gecko 90+)
 */
export class IndexedDBControl {
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
                if (!db.objectStoreNames.contains(storeName)) db.createObjectStore(storeName)
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
        await this.#executeTransaction(db, storeName, 'readwrite', (store) => store.put(value, key))
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