import { NodeTypes } from "./ast";

export function baseParse(content:string){
    const context = createParseContext(content);
    return createRoot(parseChildren(context));
}

function parseChildren(context){

    const nodes:any = [];

    let node;
    if(context.source.startsWith("{{")){
        node = parseInterpolation(context);
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
