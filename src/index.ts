class MyClass {
    constructor(public prop1: string, public prop2: number) { }

    method1(): void {
        console.log(`This is method 1 and here the prop1: ${this.prop1} and prop2: ${this.prop2}`);
    }

    method2(): void {
        console.log("This is method 2");
    }
}

const myObject = new MyClass("Hello", 42);

myObject.method1();
myObject.method2();