const n=`# 所有权的简单规则
1. **Each value has a variable that's its "owner".**（**Rust 中每一个值都被一个变量所拥有，该变量被称为值的所有者**）
2. **A value can have only one owner at a time.** （**一个值同时只能被一个变量所拥有，或者说一个值只能拥有一个所有者**）
3. **If the owner goes out of scope, the value is cleaned up.**（**当所有者（变量）离开作用域范围时，这个值将被丢弃(drop)**）
# 借用的简单规则
1. **At any time, you can have either one mutable reference or any number of immutable references.**（**同一时刻，你只能拥有要么一个可变引用，要么任意多个不可变引用**）
2. **References must always be valid.**（**引用必须总是有效的**）
## 为什么
- 数据竞争
- 悬垂引用
### 数据竞争例子
#### 例子1
\`\`\`Rust
fn main() {
	  let mut vec = vec![4, 5 ,6];
	  let ref1 = &mut vec;
	  let ref2 = &mut vec;
	  println!("ref1: {:?}, ref2: {:?}", ref1, ref2);
}
\`\`\`
这块代码违反了借用的第一条规则中的 **无法拥有多个可变引用**，我们只能去掉其中一个引用的使用来修复
#### 例子2
\`\`\`Rust
fn main() {
	  let mut vec = vec![4, 5 ,6];
	  let ref1 = &vec;
	  let ref2 = &mut vec;
	  println!("ref1: {:?}, ref2: {:?}", ref1, ref2);
}
\`\`\`
这次违反了 **同时借用可变和不可变**。因为如果修改了可变引用中的数据，那么不可变引用的数据将跟随发生变化，正如官方文档所举的生动例子：
> 正在借用不可变引用的用户，肯定不希望他借用的东西，被另外一个人莫名其妙改变了。多个不可变借用被允许是因为没有人会去试图修改数据，每个人都只读这一份数据而不做修改，因此不用担心数据被污染。
#### 例子3
Rust 的编译器一直在优化，早期的时候，引用的作用域跟变量作用域是一致的，这对日常使用带来了很大的困扰，你必须非常小心的去安排可变、不可变变量的借用，免得无法通过编译，例如以下代码：
\`\`\`Rust
fn main() {
   let mut s = String::from("hello");

    let r1 = &s;
    let r2 = &s;
    println!("{} and {}", r1, r2);
    // 新编译器中，r1,r2作用域在这里结束

    let r3 = &mut s;
    println!("{}", r3);
} // 老编译器中，r1、r2、r3作用域在这里结束
  // 新编译器中，r3作用域在这里结束
\`\`\`
在老版本的编译器中（Rust 1.31 前），将会报错，因为 \`r1\` 和 \`r2\` 的作用域在花括号 \`}\` 处结束，那么 \`r3\` 的借用就会触发 **无法同时借用可变和不可变** 的规则。

但是在新的编译器中，该代码将顺利通过，因为 **引用作用域的结束位置从花括号变成最后一次使用的位置**，因此 \`r1\` 借用和 \`r2\` 借用在 \`println!\` 后，就结束了，此时 \`r3\` 可以顺利借用到可变引用。`;export{n as default};
