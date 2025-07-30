const n=`# TypeScript 最佳实践指南\r
\r
TypeScript 为 JavaScript 添加了静态类型检查，让我们的代码更加健壮。\r
\r
## 基本类型\r
\r
\`\`\`typescript\r
// 基本类型定义\r
const name: string = 'John'\r
const age: number = 30\r
const isActive: boolean = true\r
\r
// 数组类型\r
const numbers: number[] = [1, 2, 3]\r
const names: Array<string> = ['Alice', 'Bob']\r
\`\`\`\r
\r
## 接口定义\r
\r
\`\`\`typescript\r
interface User {\r
  id: number\r
  name: string\r
  email?: string // 可选属性\r
}\r
\r
const user: User = {\r
  id: 1,\r
  name: 'John Doe'\r
}\r
\`\`\`\r
\r
## 泛型使用\r
\r
\`\`\`typescript\r
function identity<T>(arg: T): T {\r
  return arg\r
}\r
\r
const result = identity<string>('hello')\r
\`\`\`\r
\r
## 最佳实践\r
\r
1. **严格模式配置**\r
2. **合理使用类型断言**\r
3. **善用工具类型**\r
4. **避免 any 类型**\r
\r
TypeScript 能够显著提升开发体验和代码质量。`;export{n as default};
