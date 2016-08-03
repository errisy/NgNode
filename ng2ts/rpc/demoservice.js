"use strict";
var dog_ts_1 = require("../app/dog.ts");
var Demo = (function () {
    function Demo() {
    }
    Demo.prototype.Dogs = function () {
        var list = [];
        {
            var d = new dog_ts_1.Dog();
            d.Name = 'labrador';
            list.push(d);
        }
        {
            var d = new dog_ts_1.Dog();
            d.Name = 'golden retriever';
            list.push(d);
        }
        return list;
    };
    Demo.prototype.test = function () {
        return 'hello';
    };
    return Demo;
}());
exports.Demo = Demo;
//# sourceMappingURL=demoservice.js.map