import * as cgi from '../cgi/cgi';
import * as path from 'path';
import * as pathreducer from 'pathreducer';

/**
 * You must provide a Module Name for the this Serializable decorator. It uses the Module Name to deserialize the object.
 * @param moduleName
 */
export function Serializable (moduleName: string) {
    return (target: any) => {
        // save a reference to the original constructor
        var original: Function = target;
        // a utility function to generate instances of a class
        function construct(constructor: Function, args: any[]) {
            var c: any = function () {
                return constructor.apply(this, args);
            }
            c.prototype = constructor.prototype;
            let instance: { [id: string]: string } = new c();
            instance['@Serializable.ModuleName'] = moduleName;
            instance['@Serializable.TypeName'] = original.name;
            return instance;
        }
        // the new constructor behaviour
        var f: any = function (...args:any[]) {
            console.log("New: " + original.name + " : Serializable");
            return construct(original, args);
        }
        // copy prototype so intanceof operator still works
        f.prototype = original.prototype;

        // return new constructor (will override original)
        return f;
    }
}

// References is the dictionary that hold all loaded library;
var References: { [id: string]: { [id: string]: ObjectConstructor } } = {};
var __moduleRoot: string;
/**
 * This path is determined by path.dirname(require.main.filename). If you want to changed the default value, set a new value to it after require/import.
 */
export var __relativeRoot: string = path.dirname(require.main.filename);

export function Deserialize(jsonObject: any): any {
    if (typeof jsonObject != 'object') return jsonObject;
    if (Array.isArray(jsonObject)) {
        console.log('Deserialize Array: ', JSON.stringify(jsonObject));
        for (let i = 0; i < (<any[]>jsonObject).length; i++) {
            (<any[]>jsonObject).push(Deserialize((<any[]>jsonObject)[i]));
        }
    }
    if (jsonObject['@Serializable.ModuleName'] && jsonObject['@Serializable.TypeName']) {
        console.log('Deserialize Object: ', JSON.stringify(jsonObject));
        let moduleName:string = jsonObject['@Serializable.ModuleName'];
        let typeName:string = jsonObject['@Serializable.TypeName'];
        //load module to References
        if (moduleName.charAt(0) == '.') {
            //this is a relative file;
            // if the module was not loaded, load it from the module file;
            if (!References[moduleName]) {
                let $file = pathreducer.reduce(__relativeRoot + '\/' + moduleName + '.js');
                console.log('Deserialize->Load Type Def from: ', $file);
                References[moduleName] = cgi.DynamicRequire(pathreducer.filename($file), pathreducer.pathname($file));
            }
        }
        else {
            //this is a module
        }
        
        //how to obtain the module and type from it?
        let obj = new References[moduleName][typeName]();
        for (let key in jsonObject) {
            if (key != '$$hashKey')
                obj[key] = jsonObject[key];
        }
        return obj;
    }
    return jsonObject; 
}