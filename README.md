这是一个简单的编译器例子，包含了编译器的几个主要部分，有助于理解babel是如何工作的。编译可以分成三个阶段：Parsing(解析)，Transformation(转换)， Code Generation(生成代码) 。下面是每个阶段具体工作流程
### compiler分成三个阶段
- **Parsing(解析)**
将最源代码转换为一种更加抽象的表示即抽象语法树(Abstract Syntax Tree,AST)，一般会分成两个阶段：Lexical Analysis(词法分析)和Syntactic Analysis(语法分析) 
  - 词法分析
  将源代码转换为*token*序列的过程，*token*是由*tokenization*从输入字符串流中生成的，词法分析器还会对*token*进行分类，比如数字、标签、标点符号或者其它任何东西
  - 语法分析
    接收之前生成的*token*，把它们转换成一种抽象的表示，这种抽象的表示描述了代码语句中的每一个片段以及他们之间的关系，这被称为抽象语法树（Abstract Syntax Tree， 缩写为AST）,用一种更容易处理的方式代表了代码本身。比如下面的源代码 lisp风格的代码用函数调用表示2 + (4 - 2)为： 
    ``` 
    (add 2 (subtract 4 2))
    ``` 
    下面是该源代码产生的token 序列，type表示token的类型，value表示token有效信息
    ```
    [
      {type: 'paren',  value: '('        },
      {type: 'name',   value: 'add'      },
      {type: 'number', value: '2'        },
      {type: 'paren,   value: '('        },
      {type: 'name,    value: 'subtract' },
      {type: 'number', value: '4'        },
      {type: 'number', value: '2'        },
      {type: 'paren',  value: ')'        },
      {type: 'paren',  value: ')'        },
    ]
    ```
    下面是将这些token序列对源代码的抽象表示为
    ```
    {
      type: 'Program',
      body: [
        {
          type: 'CallExpression',
          name: 'add',
          params: [
            {
              type: 'NumberLiteral ', 
              value:'2'      
            },
            {
              type: 'CallExpression',
              name:'subtract',
              params: [
                {
                  type: 'NumberLiteral',
                  value: '4'
                },
                {
                  type: 'NumberLiteral',
                  value: '2'
                }
              ]
            },
          ]
        }
      ]
    }
    ```

- **Transformation(转换)** 
对这个抽象语法树做一些处理，比如对它进行新增节点，删除节点，移动节点或节点替换，也可以翻译成全新的语言的AST，AST中有很多相似的元素，这些元素都有type属性，它们被称为AST节点。这些节点含有若干个属性，用于描述AST的部分信息，比如下面的*NumberLiteral*节点；
`
    ```
    {
      type: 'NumberLiteral',
      value: '2'
    }
    ```
    又比如下面*CallExpression*节点；
    ```
    {
      type: 'CallExpression',
      name: 'subtract',
      params: [...]
    }
    ```
为了能够处理节点，我们需要使用深度优先遍历它们。对于之前Parsing后的AST的遍历流程是这与的：
1. Program - 从 AST 的顶部节点开始
2. CallExpression (add) - Program 的第一个子元素
3. NumberLiteral (2) - CallExpression (add) 的第一个子元素
4. CallExpression (subtract) - CallExpression (add) 的第二个子元素
5. NumberLiteral (4) - CallExpression (subtract) 的第一个子元素
6. NumberLiteral (2) - CallExpression (subtract) 的第二个子元素

如果要直接在AST内部操作我们需要创建一个“访问者(visitor)”对象，这个对象包含一些方法，这些方法名表示不同的节点，比如：
```
var visitor = {
  NumberLiteral() {},
  CallExpression() {}
}
```
当我们遍历AST的时候，如果遇到匹配type 的节点，我们可以调用 visitor 中的方法

- *Code Generation(生成代码)*
接收处理之后的抽象语法树，然后把它转换为目标代码

