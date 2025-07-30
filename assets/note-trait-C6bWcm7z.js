const n=`特征定义了**一组可以被共享的行为，只要实现了特征，你就能使用这组行为**
为同类的事物规范他们的行为，也可以是一组特征约束
\`\`\`Rust
fn add<T: std::ops::Add<Output = T>>(a:T, b:T) -> T {
    a + b
}
\`\`\`
\`add()\`的参数就被要求必须具备了**可相加**的特征
# 孤儿规则
关于特征实现与定义的位置，有一条非常重要的原则：**如果你想要为类型** \`A\` **实现特征** \`T\`**，那么** \`A\` **或者** \`T\` **至少有一个是在当前作用域中定义的！**

意思是，我们可以为某个结构体\`Dog\`实现\`Display\`，也可以为标准库的\`String\`实现\`bark()\`，但不能为\`String\`实现\`Display\`，因为他们都位于标准库中，没有一个是位于当前作用域的

该规则被称为**孤儿规则**，可以确保其它人编写的代码不会破坏你的代码，也确保了你不会莫名其妙就破坏了风马牛不相及的代码。
# Trait Bound（特征约束）

\`\`\`Rust
fn println<T: std::fmt::Display + Debug>(item: &T) {
	println!(*T);
}
\`\`\`
Trait的这个用法才是大放异彩，在此处它限制了传进\`println()\`参数的特征，以确保可以正常使用\`println\`宏

\`\`\`Rust
pub fn println(item: &impl std::fmt::Display + Debug) {
    println!("Breaking news! {}", item.summarize());
}\`
\`\`\`
这种写法是Rust的**语法糖**，适用于单一参数的传入
## Where语法糖
### 原写法
\`\`\`Rust
fn certain_function<T: Display + Clone, U: Clone + Debug>(t: &T, u: &U) -> i32 {}
\`\`\`
对于多重约束，我们可以在函数添加\`where\`来更清晰的表达
### 语法糖写法
\`\`\`Rust
fn certain_function<T, U>(t: &T, u: &U) -> i32
    where T: Display + Clone,
          U: Clone + Debug
{}
\`\`\`
## 使用特征约束去实现方法
\`\`\`Rust
use std::fmt::Display;

struct Pair<T> {
    x: T,
    y: T,
}

impl<T> Pair<T> {
    fn new(x: T, y: T) -> Self {
        Self {
            x,
            y,
        }
    }
}

impl<T: Display + PartialOrd> Pair<T> {
    fn cmp_display(&self) {
        if self.x >= self.y {
            println!("The largest member is x = {}", self.x);
        } else {
            println!("The largest member is y = {}", self.y);
        }
    }
}
\`\`\`
\`cmp_display\` 方法，并不是所有的 \`Pair<T>\` 结构体对象都可以拥有，只有 \`T\` 同时实现了 \`Display + PartialOrd\` 的 \`Pair<T>\` 才可以拥有此方法。 该函数可读性会更好，因为泛型参数、参数、返回值都在一起，可以快速的阅读，同时每个泛型参数的特征也在新的代码行中通过**特征约束**进行了约束。
## 使用特征约束去实现特征
例如，标准库为任何实现了 \`Display\` 特征的类型实现了 \`ToString\` 特征：

\`\`\`Rust
impl<T: Display> ToString for T {
    // --snip--
}
\`\`\`
我们可以对任何实现了 \`Display\` 特征的类型调用由 \`ToString\` 定义的 \`to_string\` 方法。例如，可以将整型转换为对应的 \`String\` 值，因为整型实现了 \`Display\`：
\`\`\`Rust
let s = 3.to_string();
\`\`\`
## 函数返回中的impl Trait
可以通过 \`impl Trait\` 来说明一个函数返回了一个类型，该类型实现了某个特征：
\`\`\`Rust
fn return_animal() -> impl Animal {
    Dog {
        name: String::from("Bubby"),
    }
}
\`\`\`
因为 \`Dog\` 实现了 \`Animal\`，因此这里可以用它来作为返回值。要注意的是，虽然我们知道这里是一个 \`Dog\` 类型，但是对于 \`return_animal\` 的调用者而言，他只知道返回了一个实现了 \`Animal\` 特征的对象，但是并不知道返回了一个 \`Dog\` 类型。

这种 \`impl Trait\` 形式的返回值，在一种场景下非常非常有用，那就是返回的真实类型非常复杂，你不知道该怎么声明时（毕竟 Rust 要求你必须标出所有的类型），此时就可以用 \`impl Trait\` 的方式简单返回。例如，闭包和迭代器就是很复杂，只有编译器才知道那玩意的真实类型，如果让你写出来它们的具体类型，估计内心有一万只草泥马奔腾，好在你可以用 \`impl Iterator\` 来告诉调用者，返回了一个迭代器，因为所有迭代器都会实现 \`Iterator\` 特征。

但是这种返回值方式有一个很大的限制：只能有一个具体的类型，例如：
\`\`\`Rust
fn return_animal(a_boolean: bool) -> impl Animal {
	if a_boolean {
		Dog {
	        name: String::from("Bubby"),
	    }
	} else {
		Cat {
	        name: String::from("Bubby"),
	    }
	}
}
\`\`\`
以上的代码就无法通过编译，因为它返回了两个不同的类型 \`Dog\` 和 \`Cat\`。
\`\`\`
\`if\` and \`else\` have incompatible types
expected struct \`Dog\`, found struct \`Cat\`
\`\`\`

这时候需要引入一个新的概念，叫**特征对象**
## 特征对象
**特征对象**指实现了 \`Animal\` （某）特征的类型的实例，也就是指向了 \`Cat\` 或者 \`Dog\` 的实例，这种映射关系是存储在一张表中，可以在运行时通过特征对象找到具体调用的类型方法。

可以通过 \`&\` 引用或者 \`Box<T>\` 智能指针的方式来创建特征对象。

\`Box<T>\`，大家现在把它当成一个引用即可，只不过它包裹的值会被强制分配在堆上。
\`\`\`Rust
fn main() {
	// 方式一
	let cat: Box<dyn Animal> = Box::new(
		Cat {
			name: String::from("Meow")
		}
	);

	// 方式二
	let cat: &dyn Animal = &Cat {
		name: String::from("Meow")
	};
}
\`\`\`
上面代码，有几个非常重要的点：

- 方式一的类型是 \`Box<dyn Draw>\` 形式的特征对象，该特征对象是通过 \`Box::new(x)\` 的方式创建的
- 方式二的类型是 \`&dyn Draw\` 形式的特征对象，该特征对象是通过 \`&x\` 的方式创建的
- \`dyn\` 关键字只用在特征对象的类型声明上，在创建时无需使用 \`dyn\`

因此，可以使用特征对象来代表泛型或具体的类型。

即上述代码的修复
\`\`\`Rust
fn return_animal(a_boolean: bool) -> Box<dyn Animal> {
	if a_boolean {
		Box::new(
			Dog {
		        name: String::from("Bubby"),
		    }
		)
	} else {
		Box::new(
			Cat {
		        name: String::from("Bubby"),
		    }
		)
	}
}
\`\`\`

在原代码中，编译器在编译时不知道实现了这个 trait 的具体类型会有多大。不同的实现可能有不同的大小：

- Dog 结构体可能是 24 字节
- 其他实现 Animal 的结构体可能是 8 字节或 100 字节

在Rust中，这种不安全的行为，将不能通过编译，所以才需要具体的类型或者用\`Box<T>\`在堆上分配内存管理

### 注意
- \`dyn\` 不能单独作为特征对象的定义，例如下面的代码编译器会报错，原因是特征对象可以是任意实现了某个特征的类型，编译器在编译期不知道该类型的大小，不同的类型大小是不同的。
\`\`\`Rust
fn draw2(x: dyn Draw) {
    x.draw();
}
\`\`\`
\`\`\`
10 | fn draw2(x: dyn Draw) {
   |          ^ doesn't have a size known at compile-time
   |
   = help: the trait \`Sized\` is not implemented for \`(dyn Draw + 'static)\`
help: function arguments must have a statically known size, borrowed types always have a known size
\`\`\`

- 而 \`&dyn\` 和 \`Box<dyn>\` 在编译期都是已知大小，所以可以用作特征对象的定义。

- 当你定义一个特征对象的实例时，它已经不再是原类型的实例，所以只能调用特征对象的方法，而不能调用原类型实现的方法，例如：

\`\`\`Rust
trait Animal {
	fn walk(&self) {};
}

struct Dog {
	name: String,
}

impl Animal for Dog {
	fn walk(&self) {
		println!("{} is walking", self.name);
	}
}

impl Dog {
	fn woof(&self) {
		println!("{} is woofing", self.name);
	}
}

fn main() {
	let dog: Box<dyn Animal> = Box::new(
		Dog {
			name: String::from("Buddy"),
		}
	);
	dog.walk(); // 正常运行
	dog.woof(); // 报错
}
\`\`\`
## 标记Trait
标记性特征常用与在类型上添加元数据或约束，它有助于在不实现任何功能的情况下向编译器传达关于类型的额外信息，例如：
\`\`\`Rust
trait CertainTrait: Debug + PartialEq + Default {}

#[derive(Debug, Default, PartialEq)]
struct CertainStruct {
	name: String,
	info: String,
}

impl Certain for CertainStruct {}

fn certain_fuction() 
	where  T: CertainTrait
{}
\`\`\`
同时这个特性也能帮助在函数的where处减少特征，让代码变得简洁
## 关联类型
这是一个完美使用特征的例子，\`Kmh\`和\`Mph\`都实现了一样的方法
\`\`\`Rust
struct Km {
	value: u32,
}

struct Kmh {
	value: u32,
}

struct Miles {
	value: u32,
}

struct Mph {
	value: u32,
}
  

impl Kmh {
    fn distance_in_three_hours(&self) -> Km {
        return Km { value: self.value * 3 };
    }
}

impl Mph {
    fn distance_in_three_hours(&self) -> Miles {
        return Miles { value: self.value * 3 };
    }
}
\`\`\`
但是当我们为其实现特征时就会遇到以下问题
\`\`\`Rust
trait DistanceInThreeHours {
	fn distance_in_three_hours(&self) -> ?;
}
\`\`\`
\`?\`处，它们返回的类型并不一致，这时候就需要引入关联类型的概念：

> 关联类型在特征中允许我们定义占位符类型，其中具体的类型由实现该特征的类型决定，当具体类型未在特征中定义时，我们会将它们称为关联类型。

直接上代码，一切就都明白了
\`\`\`Rust
trait DistanceInThreeHours {
	type Distance;
	fn distance_in_three_hours(&self) -> Self::Distance;
}

impl DistanceInThreeHours for Kmh {
    type Distance = Km;
    fn distance_in_three_hours(&self) -> Self::Distance {
        return Km { value: self.value * 3 };
    }
}

impl DistanceInThreeHours for Mph {
	type Distance = Miles;
    fn distance_in_three_hours(&self) -> Self::Distance {
        return Miles { value: self.value * 3 };
    }
}
\`\`\`
### 什么时候选择关联类型与泛型
有个很好的例子能说明这个：
\`\`\`Rust
#[derive(Debug)]
struct Point {
	x: i32,
	y: i32,
}

trait Addition {
	type Rhs;
	type Output;
	fn add(&self, rhs: Self::Rhs) -> Self::Output;
}

impl Addition for Point {
	type Rhs = Point;
	type Output = Point;
	fn add(&self, rhs: Self::Rhs) -> Self::Output {
		Point {
			x: self.x + rhs.x,
			y: self.y + rhs.y,
		}
	}
}
\`\`\`
这是一个坐标和另一个坐标相加的例子。但如果我们只想相加其中一个\`x\`坐标的时候，这时候一个实现已经满足不了我们的需求了，我们可以借助泛型：
\`\`\`Rust
#[derive(Debug)]
struct Point {
	x: i32,
	y: i32,
}

trait Addition<Rhs> {
	type Output;
	fn add(&self, rhs: Rhs) -> Self::Output;
}

impl Addition<Point> for Point {
	type Output = Point;
	fn add(&self, rhs: Point) -> Self::Output {
		Point {
			x: self.x + rhs.x,
			y: self.y + rhs.y,
		}
	}
}

impl Addition<i32> for Point {
	type Output = Point;
	fn add(&self, rhs: i32) -> Self::Output {
		Point {
			x: self.x + rhs,
			y: self.y,
		}
	}
}
\`\`\`
在\`main()\`的调用如下：
\`\`\`Rust
fn main() {
    let p1 = Point { x: 1, y: 2 };
    let p2 = Point { x: 3, y: 4 };
    let p3 = p1.add(p2);
    println!("p3: {:?}", p3);
    let p4 = p1.add(1);
    println!("p4: {:?}", p4);
}
\`\`\`
终端输出
\`\`\`
p3: Point { x: 4, y: 6 }
p4: Point { x: 2, y: 2 }
\`\`\`
同样的\`Output\`类型也可以使用泛型
\`\`\`Rust
#[derive(Debug)]
struct Point {
	x: i32,
	y: i32,
}

trait Addition<Rhs, Output> {
	fn add(&self, rhs: Rhs) -> Output;
}

impl Addition<Point, Point> for Point {
	fn add(&self, rhs: Point) -> Point {
		Point {
			x: self.x + rhs.x,
			y: self.y + rhs.y,
		}
	}
}

impl Addition<i32, Point> for Point {
	fn add(&self, rhs: i32) -> Point {
		Point {
			x: self.x + rhs,
			y: self.y,
		}
	}
}

#[derive(Debug)]
struct Line {
	x: i32,
	y: i32,
}

impl Addition<Point, Line> for Point {
	fn add(&self, rhs: Point) -> Line {
		Line {
			x: self.x + rhs.x,
			y: self.y + rhs.y,
		}
	}
}

fn main() {
	let p1 = Point { x: 1, y: 2 };
    let p2 = Point { x: 3, y: 4 };
    let p3: Line = p1.add(p2); // 因为有多个实现匹配，我们需要显示注明类型
    println!("p3: {:?}", p3);
    let p4 = p1.add(1);
    println!("p4: {:?}", p4);
}
\`\`\`
## 特征和泛型的简单对比
- 泛型在编译期会为调用的每个类型生成专门的代码，会导致二进制文件大小增加，但是运行效率高。而特征则不会这样子，它会在运行时判断，动态的运行。`;export{n as default};
