import * as core from './core.js';
import * as net from './net.js';
import { IndexedDBControl } from './storage.js';
import { DbgTimmer } from './debug.js';

const YclUtils = Object.freeze({
    ...core,
    ...net,
    IndexedDBControl,
    DbgTimmer
});

(function () {
    const root = typeof window !== 'undefined' ? window : {};
    if (root.YCL_PUBLIC_LIBRARY_NOLOGO || typeof console === 'undefined') return;

    root.YCL_PUBLIC_LIBRARY_NOLOGO = true;
    const colors = ['#ff0', '#0f0', '#0ff'];
    const styles = Array(5).fill(colors.map(c => `color:${c}`)).flat();

    console.log(`
+---------------------------------------------------------+

         %co     o          %co o o          %co
           %co o           %co               %co
            %co           %co                %co
            %co            %co               %co
            %co             %co o o          %co o o o%c    

+--------------------------------------------------------+

我们一日日度过的所谓的日常，实际上可能是接连不断的奇迹！--京阿尼《日常》`,
...styles, 'color:#fff');
})();

export default YclUtils;