/**
 * Created by zhoulongfei on 2018/12/5.
 * E-mail:36995800@163.com
 */
import Utils from './utils';
let utils=new Utils();

interface parseRegExp {
    [index: string]: RegExp;
}

const REGEXP: parseRegExp = {
    compute: /([\w\.'"]+)\s*(={1,3})\s*([\w\.'"]+)/,
    operator: /([\w\.'"]+)(?:\s*([\|\&]{2})\s*)?/g,
    three: /([\w\.\s]+)\?([\w\:\?\.'"\s]+)\:([\w\.\:\?'"\s]+)/,
    ngClass:/\{(['\w\s]+)\:([\w\s]+)\}/,
    isString: /^['"]\w+['"]$/,
    isNumber: /\d+(\.\d+)?$/,
    singleVar:/^[\w_$\.\[\]]+$/
};

export default class SA {
    static regExp: parseRegExp = REGEXP;
    result:any;
    scope:any[];
    node:Node;
    varList:any[]=[];
    constructor(expression: string, scope: any[],node:Node) {
         this.scope=scope;
         this.node=node;
         this.result=this.parse(expression)
    }


    parse(expression: string):any {
        let match = expression.match(SA.regExp.compute);
        let varA, varB, operator;
        let str="";
        let temp:any[]=[];
        this.varList=[];
        this.result=null;
        if (SA.regExp.three.test(expression)) {
            console.log('three');
        } else if (SA.regExp.compute.test(expression)) {
            console.log('compute');
            match = expression.match(SA.regExp.compute);
            if (match) {
                varA = match[1];
                varB = match[3];
                operator = match[2];
                if (!REGEXP.isNumber.test(varA)) {

                }
                [varA, varB].forEach((v, i, a) => {
                    if(REGEXP.isNumber.test(v)||REGEXP.isString.test(v)){
                        temp.push(v)
                    }else{
                        this.varList.push(v);
                        let value=this.getValue(this.scope,v).value;
                        temp.push(value);

                    }
                });
                return  (new Function('', `return ${temp[0]}${operator}${temp[1]}`)());
            }
        }else if(REGEXP.singleVar.test(expression)){

            if(REGEXP.isNumber.test(expression)||REGEXP.isString.test(expression)){
                temp.push(expression)
            }else{
                this.varList.push(expression);
                let value=this.getValue(this.scope,expression).value;
                temp.push(value);

            }
            return  (new Function('', `return ${temp[0]}`)());
        }


    }
    getValue(scope: any, str: string) {
        return utils.getValue(scope,str,this.node)
    }
}