import { NodeTypes } from "./ast";

const enum TagType{
    Start,
    End
}

export function baseParse(content:string){
    const context = createParseContext(content);
    return createRoot(parseChildren(context));
}

function parseChildren(context){

    const nodes:any = [];

    let node;
    const s = context.source
    if(s.startsWith("{{")){
        node = parseInterpolation(context);
    }else if(s[0] === "<"){
        if(/[a-z]/i.test(s[1])){
            node = parseElement(context);
        }
    }

    nodes.push(node);

    return nodes;
}

function parseInterpolation(context){

    // {{message}}

    const openDelimiter = "{{";
    const closeDelimiter = "}}";

    const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length);

    advanceBy(context, openDelimiter.length)// message}}

    const rawContentLength = closeIndex - openDelimiter.length;

    const rawContent = context.source.slice(0, rawContentLength); // message

    const content = rawContent.trim(); //边缘情况，去除插值语法首尾的空格

    console.log("content:",content);

    advanceBy(context, rawContentLength + closeDelimiter.length);

    console.log("context.sourse:",context.source);

    return  {
        type: NodeTypes.INTERPOLATION,
        content:{
            type:NodeTypes.SIMPLE_INTERPOLATION,
            content:content,
        }
    }
}

function parseElement(context: any) {
    const element = parseTag(context, TagType.Start);

    parseTag(context, TagType.End);

    console.log("-----", context.source);

    return element;
}

function parseTag(context:any, type:TagType){
    // 1.解析tag
    const match:any = /^<\/?([a-z]*)/.exec(context.source);
    console.log(match);
    const tag = match[1];
    // 2. 删除处理完成的代码
    advanceBy(context, match[0].length);
    advanceBy(context, 1);

    if(type === TagType.End)return;

    return {
        type:NodeTypes.ELEMENT,
        tag,
    }
}


function advanceBy(context: any, length: number){
    context.source = context.source.slice(length);
}

function createRoot(children){
    return {
        children,
    }
}

function createParseContext(content: string) {
    return {
        source:content,
    }
}
