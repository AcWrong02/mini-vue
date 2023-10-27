import { NodeTypes } from '../src/ast';
import {baseParse} from '../src/parse';

describe("Parse", ()=>{

    // 插值
    describe("interpolation", ()=>{
        test('simple interpolation', ()=>{

            const ast = baseParse("{{message}}");

            expect(ast.children[0]).toStrictEqual({
                type:NodeTypes.INTERPOLATION,
                content:{
                    type:NodeTypes.SIMPLE_INTERPOLATION,
                    content:"message",
                }
            })
        })
    })

    // 解析element标签
    describe('element', () => { 
        it("simple element div", ()=>{
            const ast = baseParse("<div></div>");

            expect(ast.children[0]).toStrictEqual({
                type:NodeTypes.ELEMENT,
                tag:"div",
                children:[]
            })
        })
    })

    // 解析text功能
    describe('text', ()=>{
        it("simple text",()=>{
            const ast = baseParse("some text");

            expect(ast.children[0]).toStrictEqual({
                type:NodeTypes.TEXT,
                content:"some text"
            })
        })
    })

    // 实现解析三种联合类型
    test("element with interpolation and text", () => {
        const ast = baseParse("<p>hi,{{ message }}</p>");
        const element = ast.children[0];
  
        expect(element).toStrictEqual({
          type: NodeTypes.ELEMENT,
          tag: "p",
          children: [
            {
              type: NodeTypes.TEXT,
              content: "hi,",
            },
            {
              type: NodeTypes.INTERPOLATION,
              content: {
                type: NodeTypes.SIMPLE_INTERPOLATION,
                content: "message",
              },
            },
          ],
        });
      });

      test("nested element", ()=>{
        const ast = baseParse("<div><p>hi,</p>{{ message }}</div>");
        const element = ast.children[0];
  
        expect(element).toStrictEqual({
          type: NodeTypes.ELEMENT,
          tag: "div",
          children: [
            {
                type: NodeTypes.ELEMENT,
                tag: "p",
                children:[
                    {
                        type:NodeTypes.TEXT,
                        content:"hi,"
                    }
                ]
            },
            {
              type: NodeTypes.INTERPOLATION,
              content: {
                type: NodeTypes.SIMPLE_INTERPOLATION,
                content: "message",
              },
            },
          ],
        });
      })


      // 没有结束标签的错误处理情况
      test('should throw err when lack end tag', () => { 
        expect(()=>{
            baseParse("<div><span></div>")
        }).toThrow("缺少结束标签:span");
       })
})