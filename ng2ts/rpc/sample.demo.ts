console.log('hello ts!');

class Hello {
    @MethodDecorator
    propertyFunction(name: string) {
        return '';
    }
}

function standaloneFunction(input: string) {

}

function MethodDecorator(
    target: Object, // The prototype of the class
    propertyKey: string, // The name of the method
    descriptor: TypedPropertyDescriptor<any>
) {
    console.log("MethodDecorator called on: ", target, propertyKey, descriptor);
}
