"use strict";
var dog_1 = require('../app/dog');
var Cat = (function () {
    function Cat() {
        this.dog = new dog_1.Dog();
    }
    return Cat;
}());
exports.Cat = Cat;
//# sourceMappingURL=cat.js.map