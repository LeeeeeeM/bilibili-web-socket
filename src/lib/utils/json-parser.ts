export function parser(str: string): string[] {
  const result: string[] = [];
  const stack: { index: number }[] = [];

  for (let i = 0; i < str.length; i++) {
    if (str[i] === '{') {
      stack.push({ index: i });
    } else if (str[i] === '}') {
      if (stack.length === 0) {
        console.warn(`${str} 不是正确的对象字符串，多余的 '}' 在位置 ${i}`);
        continue;
      }
      const prev = stack.pop()!;
      if (stack.length === 0) {
        result.push(str.slice(prev.index, i + 1));
      }
    }
  }

  if (stack.length > 0) {
    console.warn(`${str} 不是正确的对象字符串，缺少 '}'`);
  }

  return result;
}