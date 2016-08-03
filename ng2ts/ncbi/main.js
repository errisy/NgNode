"use strict";
var platform_browser_dynamic_1 = require('@angular/platform-browser-dynamic');
var http_1 = require('@angular/http');
var ncbi_component_1 = require('./ncbi.component');
console.log('bootstrap NCBI');
platform_browser_dynamic_1.bootstrap(ncbi_component_1.NCBIComponent, [http_1.HTTP_PROVIDERS]);
//# sourceMappingURL=main.js.map