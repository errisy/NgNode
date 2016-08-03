import {bootstrap}    from '@angular/platform-browser-dynamic';
import {HTTP_PROVIDERS} from '@angular/http';
import {NCBIComponent} from './ncbi.component';
console.log('bootstrap NCBI');
bootstrap(NCBIComponent, [HTTP_PROVIDERS]);
