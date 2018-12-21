/**
 * Created by zhoulongfei on 2018/12/3.
 * E-mail:36995800@163.com
 */
import Watcher from './watcher';
import Utils from './utils';
import VirtualDOM from './dom';
import Storage from './storage';
import AS from './syntaxAnalysis';

let doc: Document = document;
let win: Window = window;
let utils = new Utils();
let expando: number = 1;

interface setting {
    [propName: string]: any
}
const REGEXP={
  quote:/['"]/g
};

//propertyDirectiveMap
const PDMap: any = {
    toggle: (property:any,node: Node, data: any, dom: any,scope:any, isFirst: boolean) => {
        if (isFirst) {
            dom.fn = function (evt: any) {
                data.data[data.lastKey] = !data.data[data.lastKey];

            };
            node.addEventListener('click', dom.fn, false);

        }
    },
    ngclass: (property: any, node: any, data: any, dom: any, scope: any, isFirst: boolean) => {
        debugger;
        let vas = new AS(dom.classTml, scope, node);
        node.className = vas.result ? node.className + " " + dom.className : node.className.replace(dom.className);
    }
};

class directives {
    constructor() {

    }

    for(attribute: any, node: any, data: any, match: any, dom: any, scope: any, isFirst: boolean) {
        let value = isFirst ? data.value : data;
        if (!utils.isArray(value)) {
            return
        }
        let df = document.createDocumentFragment();
        let firstNode: Node;
        let slot = dom.reset(node, isFirst);
        let key = match[1];
        value.forEach((v: any, i: number) => {
            let cloneNode = node.cloneNode(true);
            cloneNode.removeAttribute('*ngfor');
            cloneNode.vmExpando = 'node' + expando++;
            //cloneNode.id = 's' + expando;
            if (!firstNode) {
                firstNode = cloneNode;
            }
            dom.add(cloneNode, {[key]: v}, null, true);
            df.appendChild(cloneNode);
            Compile.parseDirective(isFirst ? df : cloneNode, [...scope, {index: i}, {[key]: v}]);
        });

        let pNode = slot.parentNode;
        if (pNode) {
            pNode.replaceChild(df, slot);
            pNode.normalize();
        }
        //console.log('in for');

    }

    if(attribute: any, node: any, data: any, match: any, dom: any, scope: any, isFirst: boolean) {
        if (isFirst) {
            return
        }
        if (Compile.checkIf(attribute, node, dom, [...scope, data], isFirst)) {
            if (dom.status) return;
            Compile.parseDirective(node, scope);
            dom.slot.parentNode.replaceChild(node, dom.slot);
            dom.slot = node;
            dom.status = true;
        } else {
            if (!dom.status) return;
            dom.slot.nodeType === 1 && (dom.slot = dom.reset(dom.slot));
            dom.slot.parentNode === node.parentNode && node.parentNode.removeChild(node);
            dom.status = false;

        }

    }

    propertyBind(property: any, node: any, data: any, match: any, dom: any, scope: any, isFirst: boolean) {
        node.removeAttribute(`[${property}]`);
        if (PDMap[property]) {
            PDMap[property].call(this, property, node, data, dom, scope, isFirst);
            return;
        }
        if (AS.regExp.compute.test(dom.tml) || AS.regExp.three.test(dom.tml)) {
            console.log(data.value);
            let vas = new AS(dom.tml, scope, node);
            node[property] = vas.result;

        } else {
            node[property] = typeof data.value !== 'undefined' ? data.value : "";
        }

        //node[property] = data.value ? data.value : data;
    }

    eventBind(event: string, node: any, data: any, match: any, dom: any, scope: any, isFirst: boolean) {
        //console.log('event',node,data,isFirst);

        (window as any).xxx = data;
        if (isFirst) {
            node.removeAttribute(`[(${event})]`);
            dom.fn = function (evt: any) {
                data.data[data.lastKey] = this.value;
                console.log(this.value);
            };
            node.addEventListener(event, dom.fn, dom.fn, false);
            Watcher.target = new Watcher({
                update: (value: any) => {
                    node.value = value;
                }
            });
            node.value = data.data[data.lastKey];
        }


    }

    attribute(node: any, attributeName: any, data: any) {

    }

    setProperty(node: any, data: any, property: any, dom: any, scope: any, isFirst: boolean) {

        let tml = dom.propertyTml;
        for (let v of dom.match) {
            let temp = utils.getValue(scope, v.slice(2, -2).trim(), node);
            let regExp = new RegExp(v.replace(Compile.regExp.regExpStr, '\\$1'), 'g');
            tml = tml.replace(regExp, temp.value);
        }

        if (utils.isProperty(property)) {
            node[property] = tml;
            //node.removeAttribute(property);

        } else {
            node.setAttribute(property, tml);
        }

    }

    insertText(node: any, data: any, match: any, dom: any, scope: any, isFirst: boolean) {
        let value = dom.tml;
        for (let v of dom.match) {
            let temp = utils.getValue(scope, v.slice(2, -2).trim(), node);
            let regExp = new RegExp(v.replace(Compile.regExp.regExpStr, '\\$1'), 'g');
            value = value.replace(regExp, temp.value)
        }
        node.nodeValue = value
    }
}

/*const DIRECTIVES={

}*/


export default class Compile {
    static regExp: any = {
        s: /^(object|array)\./,
        variableStr: /([a-zA-Z\$\-\_\.]+)/g,
        regExpStr: /([\$\{\}\[\]\.])/g,
        text: /{{[^{}]+}}/g,
        compute: /([\w'"]+)\s*(={1,3})\s*([\w'"]+)/,
        propertyBind: /\[\s*([\w\-\_\$]+)\s*\]/,
        eventBind: /\[\(\s*([\w\-\_\$]+)\s*\)\]/,
        'for': /\s*let\s+([\w\-\_\$]+)\s+of\s+([\w\-\_\$\.]+)\s*/
    };
    scope: object;
    cache: object;
    expando: number;
    static directives: any;
    eleStr: string;
    static $data: object;
    originNode: any;

    constructor(opt: setting) {
        this.expando = 1;
        this.cache = {};
        this.scope = {};

        Compile.directives = new directives();

        this.eleStr = opt.template || document.querySelector(`${opt.id}`) || "";
        Compile.$data = opt.data;
        // @ts-ignore
        return this.init(opt.container)
    }

    init(selector: string) {
        let node = this.originNode = this.parseNode(this.eleStr);
        let container = doc.querySelector(selector);
        Compile.parseDirective(node);
        container && container.appendChild(node);
        return container && container.lastElementChild
    }

    parseNode(str: string | Node): Node {
        if (typeof str === 'string') {
            let node = document.createDocumentFragment();
            let wrap = document.createElement('div');
            wrap.innerHTML = str;
            while (wrap.firstChild) {
                node.appendChild(wrap.firstChild);
            }
            return node.cloneNode(true);
        }
        return str;
    }

    static parseDirective(node: Node, scope?: object) {
        let _this = this;
        let regExp = this.regExp;
        let i = 0;
        let _scope = scope ? scope : [this.$data];
        let nodes = node.childNodes || [];

        for (; nodes[i]; i++) {
            let _node = nodes[i];
            let temp;
            let _dom = new VirtualDOM(node, _scope);
            let tempScope = _dom.getScope();


            //console.log(tempScope);
            if (_node.nodeType === 1) {
                let ngIf = (_node as HTMLElement).getAttribute('*ngif');
                if (ngIf) {
                    if (!this.checkIf({nodeName: '*ngif', nodeValue: ngIf}, _node as HTMLElement, _dom, _scope, true)) {
                        console.log('continue');
                        _node.parentNode!.removeChild(_node);
                        _dom.status = false;
                        continue;
                    } else {
                        _dom.status = true;
                    }
                }
                //@ts-ignore
                let attributeList = [...(_node as HTMLElement).attributes];
                for (let v of attributeList) {
                    let nodeAttribute = v;
                    if (regExp.text.test(nodeAttribute.nodeValue)) {
                        let pName = nodeAttribute.nodeName;
                        let pValue = nodeAttribute.nodeValue;
                        let match = pValue!.match(Compile.regExp.text) || [];
                        _dom.propertyTml = pValue;
                        _dom.match = match;//属性中的插值表达式列表
                        for (let key of match) {
                            temp = utils.getValue(tempScope, key.slice(2, -2).trim(), _node);
                            /* if(typeof temp.value === 'undefined'){
                                 temp.value=Storage.storage.get(_node);
                                 temp.data['lastKey']=temp.value;
                             }*/
                            console.log(temp.value, Storage.storage.get(_node));
                            this.addWatcher(temp, pName, 'setProperty', _node, _dom, _scope);
                        }


                    }
                    if (this.isDirective(nodeAttribute.nodeName) || this.isEventBind(nodeAttribute.nodeName)) {
                        let match = nodeAttribute.nodeValue!.match(this.regExp[nodeAttribute.nodeName.substring(3)] || /NULL/);

                        let temp = utils.getValue(tempScope, match ? match[2] : nodeAttribute.nodeValue as string, _node);
                        _dom.match = match || [];

                        this.addWatcher(temp, match, nodeAttribute, _node, _dom, _scope);
                    }
                    if (this.isPropertyBind(nodeAttribute.nodeName)) {
                        let tempMatch;
                        if (tempMatch = (nodeAttribute.nodeValue as string).match(AS.regExp.compute) || AS.regExp.three.test(nodeAttribute.nodeValue as string)) {
                            let vas = new AS(nodeAttribute.nodeValue as string, _scope as any[], _node);
                            _dom.tml = nodeAttribute.nodeValue;
                            _dom.propertyValue = vas.result;
                            vas.varList.forEach((v: any, i: number, a: any[]) => {
                                let temp = utils.getValue(tempScope, v, _node);
                                this.addWatcher(temp, null, nodeAttribute, _node, _dom, _scope);
                            })
                        } else if (AS.regExp.ngClass.test(nodeAttribute.nodeValue as string)) {
                            let match = (nodeAttribute.nodeValue as string).match(AS.regExp.ngClass);
                            if (match && match.length === 3) {
                                let vas = new AS(match[2].trim(), _scope as any[], _node);
                                let temp = utils.getValue(tempScope, match[2].trim(), _node);
                                _dom.classTml = match[2].trim();
                                _dom.className = match[1].trim().replace(REGEXP.quote,'');
                                _dom.classComputeValue = vas.result;
                                this.addWatcher(temp, null, nodeAttribute, _node, _dom, _scope);
                            }

                        } else {

                            let temp = utils.getValue(tempScope, nodeAttribute.nodeValue as string, _node);
                            _dom.match = [];
                            this.addWatcher(temp, null, nodeAttribute, _node, _dom, _scope);
                        }


                    }

                }
            } else {
                let match = _node.nodeValue!.match(regExp.text);
                _dom.tml = _node.nodeValue;
                _dom.match = match || [];
                if (match) {
                    for (let v of match) {
                        let key = v.slice(2, -2).trim();
                        let temp = utils.getValue(tempScope, key, _node);
                        this.addWatcher(temp, v, 'insertText', _node, _dom, _scope);
                    }
                }
            }
            if (_node && _node.hasChildNodes() && !Compile.isSkip(_node as HTMLElement)) {
                this.parseDirective(_node, _scope)
            }
        }
    }

    static isDirective(attribute: any) {
        /* let regExp = Compile.regExp;
         if (regExp.propertyBind.test(attribute) || regExp.eventBind.test(attribute)) {
             return true
         }*/
        return !!this.directives[attribute.substring(3)]
    }

    static isPropertyBind(attribute: string) {
        return Compile.regExp.propertyBind.test(attribute);
    }

    static isEventBind(attribute: string) {
        return Compile.regExp.eventBind.test(attribute);
    }

    static isSkip(node: HTMLElement) {
        //@ts-ignore
        for (let v of node.attributes) {
            if (v.nodeName === '*ngfor' || v.nodeName === 'if') return true;
        }
    }

    static addWatcher(temp: any, match: any, nodeAttribute: any, node: any, dom: any, scope: any,) {

        Watcher.target = new Watcher({
            update: (value: any) => {
                this.dispatch(nodeAttribute, [node, {value}, match, dom, scope]);
            }
        });
        let vvvv = temp.data[temp.lastKey];

        this.dispatch(nodeAttribute, [node, temp, match, dom, scope, 1]);
    }

    static compileCode(code: string) {
        return new Function('', `return ${code}`)();
    }

    static checkIf(attribute: any, node: HTMLElement, dom: any, scope: any, isFirst: boolean) {
        console.log('if');
        let regExp = Compile.regExp;
        let regV = regExp.variableStr;
        let pValue = attribute.nodeValue;
        let m = pValue.match(regV);
        let result;
        isFirst && node.removeAttribute(attribute.nodeName);
        isFirst && (dom.slot = dom.reset(node));
        if (!m) {
            return false
        }
        for (let i = 0, l = m.length; i < l; i++) {
            if (regExp.s.test(m[i])) {
                continue
            }
            let data = utils.getValue(scope, m[i], node);
            isFirst && this.addWatcher(data, null, attribute, node, dom, scope);
            pValue = pValue.replace(new RegExp(m[i].replace(regExp.regExpStr, '\\$1')), data.value);
            console.log('pValue', pValue);
            console.log('value:', data.value);
        }
        result = this.compileCode(pValue);
        if (!result) {
            return false
        }
        isFirst && dom.add(node, null, null, true);
        return true
    }

    static dispatch(attribute: any, argList: any) {
        let directives = Compile.directives;
        let regExp = Compile.regExp;

        if (attribute === 'insertText') {
            directives.insertText.apply(this, argList);
            return true
        }
        if (attribute === 'setProperty') {
            directives.setProperty.apply(this, argList);
            return true
        }
        if (attribute.nodeName === '*ngif') {
            directives.if.apply(this, [attribute, ...argList]);
            return true
        }
        let nodeName = attribute.nodeName;

        if (regExp.propertyBind.test(nodeName)) {
            directives.propertyBind.apply(this, [nodeName.slice(1, -1).trim()].concat(argList));
            return true
        }
        if (regExp.eventBind.test(nodeName)) {
            directives.eventBind.apply(this, [nodeName.slice(2, -2).trim()].concat(argList));
            return true
        }

        directives[nodeName.substring(3)].apply(this, [attribute, ...argList]);
    }


}
