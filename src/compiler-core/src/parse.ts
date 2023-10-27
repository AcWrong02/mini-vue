import { NodeTypes } from "./ast";

const enum TagType{
    Start,
    End
}

export function baseParse(content:string){
    const context = createParseContext(content);
    return createRoot(parseChildren(context,[]));
}

function parseChildren(context, ancestors){

    const nodes:any = [];

    while(!isEnd(context, ancestors)){
        let node;
        const s = context.source
        if(s.startsWith("{{")){
            node = parseInterpolation(context);
        }else if(s[0] === "<"){
            if(/[a-z]/i.test(s[1])){
                node = parseElement(context, ancestors);
            }
        }

        // 解析text功能
        if(!node){
            node = parseText(context);
        }

        nodes.push(node);
    }

    return nodes;
}

// 判断是否解析结束
function isEnd(context, ancestors){
    const s = context.source;

    // 2.遇到结束标签的时候
    if(s.startsWith("</")){
        for (let i = 0; i < ancestors.length; i++) {
            const tag = ancestors[i].tag;
            if(startsWithEndTagOpen(s, tag)){
                return true;
            }
        }
    }
    // 1.source有值的时候
    return !s;
}

function parseInterpolation(context){
    
    console.log("开始解析插值");

    // {{message}}

    const openDelimiter = "{{";
    const closeDelimiter = "}}";

    const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length);

    advanceBy(context, openDelimiter.length)// message}}

    const rawContentLength = closeIndex - openDelimiter.length;

    const rawContent = parseTextData(context, rawContentLength) // message

    const content = rawContent.trim(); //边缘情况，去除插值语法首尾的空格

    console.log("content:",content);

    console.log("context.sourse:",context.source);

    advanceBy(context, closeDelimiter.length);

    console.log("context.sourse:",context.source);

    return  {
        type: NodeTypes.INTERPOLATION,
        content:{
            type:NodeTypes.SIMPLE_INTERPOLATION,
            content:content,
        }
    }
}

function parseElement(context: any, ancestors) {
    console.log("开始解析element标签---");
    const element:any = parseTag(context, TagType.Start);

    // 收集标签信息
    ancestors.push(element);

    console.log("解析element标签后的context",context);


    element.children = parseChildren(context, ancestors);

    ancestors.pop(element);

    if(startsWithEndTagOpen(context.source, element.tag)){
        parseTag(context, TagType.End);
    }else{
        throw new Error(`缺少结束标签:${element.tag}`)
    }

    return element;
}

function startsWithEndTagOpen(source, tag){
    return source.startsWith("</") && source.slice(2, 2 + tag.length).toLowerCase() === tag;
}

function parseTag(context:any, type:TagType){
    console.log("开始解析标签的tag---", context);
    // 1.解析tag
    const match:any = /^<\/?([a-z][^\r\n\t\f />]*)/i.exec(context.source);
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

function parseText(context: any){
    console.log("开始解析text文本---");
    let endIndex = context.source.length;
    let endTokens = ["<","{{"];

    for (let i = 0; i < endTokens.length; i++) {
        const index = context.source.indexOf(endTokens[i]);
        if(index !== -1 && endIndex > index){
            endIndex = index;
        }
    }

    console.log('endIndex---', endIndex);

    const content = parseTextData(context, endIndex);

    console.log("content-----------", content);

    return {
        type:NodeTypes.TEXT,
        content
    }
}

function parseTextData(context:any, length:number){
    // 1.获取content
    const content = context.source.slice(0, length);
    // 2.推进
    advanceBy(context, length);

    return content;
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
