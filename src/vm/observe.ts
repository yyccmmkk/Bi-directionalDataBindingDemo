/**
 * Created by zhoulongfei on 2018/12/3.
 * E-mail:36995800@163.com
 */
import Watcher from './watcher'

export default class Observe {
    default: any;
    regExp: RegExp = /^\$.+/;

    constructor(opt: any) {
        this.default = {};
        this.proxy(opt.data);
    }

    proxy(data: any) {
        if (data === null || typeof data !== 'object') return;
        for (let k of Object.keys(data)) {
            let watcher = new Watcher({});
            let v = data[k];
            if (this.regExp.test(k)) {
                return
            }
            Object.defineProperty(data, k, {
                set(value) {
                    if(v!==value){  console.log('update');
                        v = value;
                        Watcher._scope = null;
                        watcher.notify(value);
                    }

                },
                get() {
                    if (Watcher.target) {
                        //console.log('get', k);
                        watcher.add(Watcher.target);
                        Watcher.target = null;
                    }
                    return v;
                }
            });
            this.proxy(v);

        }
    }
}