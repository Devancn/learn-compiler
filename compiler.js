// 词法分析
function tokenizer(input) {
  // 用于跟踪代码位置
  let current = 0;
  // 存放 token
  let tokens = [];

  while (current < input.length) {
    let char = input[current];

    if (char === "(") {
      tokens.push({
        type: "paren",
        value: "(",
      });
      current++;
      continue;
    }

    if (char === ")") {
      tokens.push({
        type: "paren",
        value: ")",
      });
      current++;
      continue;
    }

    const WHITESPACE = /\s/;
    if (WHITESPACE.test(char)) {
      current++;
      continue;
    }

    const NUMBERS = /[0-9]/;
    if (NUMBERS.test(char)) {
      let value = "";
      while (NUMBERS.test(char)) {
        value += char;
        char = input[++current];
      }
      tokens.push({
        type: "number",
        value,
      });
      continue;
    }

    const LETTERS = /[a-z]/i;
    if (LETTERS.test(char)) {
      let value = "";
      while (LETTERS.test(char)) {
        value += char;
        char = input[++current];
      }
      tokens.push({
        type: "name",
        value,
      });
      continue;
    }
    throw new TypeError("I dont know what this character is:" + char);
  }
  return tokens;
}

function parser(tokens) {
  let current = 0;
  function walk() {
    let token = tokens[current];

    if(token.type === 'number') {
      current++;
      return {
        type: 'NumberLiteral',
        value: token.value
      }
    }

    if(token.type === 'paren' && token.value === '(') {
      token = tokens[++current];
      const node = {
        type: 'CallExpression',
        name: token.value,
        params: []
      }
      token = tokens[++current];

      while(
        (token.type !== 'paren') ||
        (token.type === 'paren' && token.value !== ')')
      ) {
        node.params.push(walk());
        token = tokens[current];
      }
      current++;
      return node;
    }
    throw new TypeError(token.type);
  }

  const ast = {
    type: 'Program',
    body: []
  }

  while(current < tokens.length) {
    ast.body.push(walk())
  }
  return ast;
}
module.exports = {
  tokenizer,
  parser
};
