/**
 * Created by zhoulongfei on 2018/6/6.
 */
import VM from './vm/vm';


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
        new VM({
            template:`
                原数据：
                data:{
                    text:'仅仅是测试',
                    num:3,
                    list:[1,2]
                } <br>
                <div *ngIf="num < 6">if num<6</div>{{num}}
                <input type="number" [(input)]="num"> 双向数据绑定：num<br>
                <input type="text" [value]="text" disabled> 单向数据绑定：text<br>
                插值表达式：{{text}}:text <br>
                <input type="text" [(input)]="text"> 双向数据绑定：text<br>
                for 循环
                <select name="" id="">
                <option *ngFor="let v of list" data-index="{{index}}" [value]="v" title="{{v}}">{{v}}</option></select>
`,
            container:'body',
            data:{
                text:'仅仅是测试',
                num:3,
                list:[1,2]
            }
        });
    }
    static bindEvent(){

    }
    static initStyle():void{

    }
}


new Main().init();