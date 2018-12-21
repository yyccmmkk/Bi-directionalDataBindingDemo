import Storage from "./storage";

/**
 * Created by zhoulongfei on 2018/12/3.
 * E-mail:36995800@163.com
 */
export default class Utils {
    regExp: any;
    map: any;
    deleteNode:any[]=[];
    constructor() {
        this.regExp = {};
        this.map = {
            value: true,
            src: true,
            title: true,
            id: true,
            href: true,
            style:true,
        }
    }

    isArray(value: any) {
        return Object.prototype.toString.apply(value) === '[object Array]'
    }

    getValue(scope: any, str: string,node:Node) {
        let temp = str.split('.');
        let lastKey = temp.pop();
        lastKey = typeof lastKey === 'undefined' ? "noop" : lastKey;
        let value;
        let data;
        scope=scope.slice(0);

        for (let l = scope.length; l--;) {
            let tempData = scope[l];
            for (let v of temp) {
                value = typeof value !== 'undefined' ? value[v] : tempData[v];
            }
            data = value ? value : tempData;
            value = value ? value[lastKey] : tempData[lastKey];
            if (typeof value !== 'undefined') break;
        }
        /*if (typeof value === 'undefined') {
            value=Storage.storage.get(node);
            data['lastKey']=value;
        }*/

        return {
            value,
            data,
            lastKey
        }
    }

    isProperty(key:any) {
        return this.map[key];
    }

    reset(node:Node, isFirst:boolean) {
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
        //this.vm.clear();
        return slot
    }
}