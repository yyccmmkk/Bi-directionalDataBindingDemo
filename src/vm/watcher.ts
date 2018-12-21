/**
 * Created by zhoulongfei on 2018/12/3.
 * E-mail:36995800@163.com
 */
export default class Watcher {
    list: any[] = [];
    static target: any = null;
    static _scope:any;
    options: any;

    constructor(opt: any) {

        this.options = Object.assign({}, opt)
    }

    notify(value:any) {
        for (let v of this.list) {
            v.update(value);
        }
    }

    add(watcher:any) {
        //console.log('add Watcher',watcher);
        this.list.push(watcher)
    }

    update(value:any) {
        this.options.update(value);
    }
}