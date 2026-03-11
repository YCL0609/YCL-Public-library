/**
 * @class DbgTimmer
 * 性能调试计时器 (Chromium 49+ / Gecko 45+)
 */
export class DbgTimmer {
    /**
     * @param {boolean} [enabled=false] - 是否启用计时器
     */
    constructor(enabled = false) {
        this.enabled = enabled;
        if (!enabled) return;
        this.list = new Map();
    }

    /**
     * 开始一个名为 name 的计时
     * @param {string} [name='noname'] - 计时器的名称
     */
    Start(name = 'noname') {
        if (!this.enabled) return;
        this.list.set(name, performance.now());
    }

    /**
     * 输出名为 name 当前经过的时间
     * @param {string} [name='noname'] - 计时器的名称
     * @param {string} [text=''] - 输出时显示的前缀文本
     * @returns {number | undefined} 经过的时间
     */
    Tick(name = 'noname', text = '') {
        if (!this.enabled) return;
        const startTime = this.list.get(name);
        if (startTime === undefined) return undefined;
        const time = performance.now() - startTime;
        if (typeof console !== 'undefined') {
            console.log(`${text || name}: %c${time.toFixed(3)}ms`, 'color: #6495ed');
        }
        return time;
    }

    /**
     * 停止名为 name 的计时并删除记录
     * @param {string} [name='noname'] - 要停止的计时器的名称
     * @param {string} [text=''] - 输出时显示的前缀文本
     * @returns {number | undefined} 经过的时间
     */
    Stop(name = 'noname', text = '') {
        if (!this.enabled) return;
        const time = this.Tick(name, text);
        if (time !== undefined) this.list.delete(name);
        return time;
    }
}