/**
 * Created by zhoulongfei on 2018/12/3.
 * E-mail:36995800@163.com
 */
import Utils from './utils';
import Watcher from './watcher';
import Storage from './storage';

let utils = new Utils();

export default class VirtualDOM {
    vm: any;
    deleteNode: any[];
    scope: any[];
    status: boolean = false;
    [index:string]:any;
    constructor(node: any, scope: any) {
        this.vm = Storage.storage;
        this.deleteNode = [];
        this.scope = [...scope];
        this.add(node, this.scope, true);
    }

    add(node: any, v: any, isNot?: boolean, isNoScope?: boolean) {
        this.vm.set(node, v);
        !isNot && this.deleteNode.push(node);
        if (typeof v === 'undefined') {
            return
        }
        Watcher._scope = null;
        if (isNoScope) {
            return
        }
        this.addScope(v);

    }

    addScope(v: any) {
        utils.isArray(v) ? this.scope.push(...v) : this.scope.push(v);
        this.scope = [...new Set(this.scope)];
    }

    getScope() {
        return [...this.scope];
    }

    reset(node: Node, isFirst: boolean) {
        let slot = document.createComment('slot');
        let isSet;
        let v;
        while (v = this.deleteNode.pop()) {
            if (!isSet && !isFirst) {
                v.nextSibling ? v.parentNode.insertBefore(slot, v.nextSibling) : v.parentNode.appendChild(slot);
                isSet = true;
            }
            v.parentNode.removeChild(v);
        }

        if (!isSet) {
            node.nextSibling ? node.parentNode!.insertBefore(slot, node.nextSibling) : node.parentNode!.appendChild(slot);
        }
        isFirst && node.parentNode!.removeChild(node);
        this.vm.clear();
        return slot
    }

}