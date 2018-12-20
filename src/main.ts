/**
 * Created by zhoulongfei on 2018/6/6.
 */
import {Demo1} from './demo1';
import {Demo2} from './demo2';


console.log(Demo1,Demo2);
interface defaults{
    cache:object;
    [key:string]:any;
}
let defaults:defaults={
    cache:{}
};

export class Main{
    //private options:defaults;
    constructor(opt?:object){

    }
    init():void{
        Main.bindEvent();
        Main.initStyle();
        new Demo1().init();
        new Demo2().init();
    }
    static bindEvent(){
        console.log("bindEvent")
    }
    static initStyle():void{
        console.log('initStyle!')
    }
}


new Main().init();