/**
 * Created by zhoulongfei on 2018/12/3.
 * E-mail:36995800@163.com
 */
import Compile from './compile'
import Observe from './observe'

let doc:Document=document;
let win:Window=window;

interface setting{
    [propName:string]:any
}


export default class VM{
    node:unknown|Node|boolean;
    data:any;
    constructor(opt:setting){
        new Observe(opt);
        this.node =<unknown|Node|boolean>(new Compile(opt));
        this.data=opt.data;
    }

}