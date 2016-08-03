/**
 * System configuration for Angular 2 apps
 * Adjust as necessary for your application needs.
 */
(function(global) {

  // map tells the System loader where to look for things
  var map = {
    'app':                          'app', // 'dist',
    'ncbi':                         'ncbi',// 'dist',
    'lib' :                         'lib',
    'Serializable':                 'node_modules/Serializable',
    'ace':                          'node_modules/ace',
    'jquery':                       'node_modules/jquery',
    '@angular':                     'node_modules/@angular',
    'angular2-in-memory-web-api':   'node_modules/angular2-in-memory-web-api',
    'rxjs':                         'node_modules/rxjs'
  };
  // packages tells the System loader how to load when no filename and/or no extension
  var packages = {
    'app':                          { main: 'main.js', defaultExtension: 'js' },
    'ncbi':                         { main: 'main.js', defaultExtension: 'js' },
    'lib':                          { defaultExtension: 'js' },
    'Serializable':                 { main: 'index.js', defaultExtension: 'js' },
    'rpc':                          { defaultExtension: 'js' },
    'rxjs':                         { defaultExtension: 'js' },
    'angular2-in-memory-web-api':   { main: 'index.js', defaultExtension: 'js' },
    'ace':                          { main: 'ace.js' },
    'jquery':                       {main: 'jquery.js'}
  };

  var ngPackageNames = [
    'common',
    'compiler',
    'core',
    'http',
    'platform-browser',
    'platform-browser-dynamic',
    'router',
    'router-deprecated',
    'upgrade',
  ];

  // Individual files (~300 requests):
  function packIndex(pkgName) {
    packages['@angular/'+pkgName] = { main: 'index.js', defaultExtension: 'js' };
  }

  // Bundled (~40 requests):
  function packUmd(pkgName) {
    packages['@angular/'+pkgName] = { main: '/bundles/' + pkgName + '.umd.js', defaultExtension: 'js' };
  }

  var setPackageConfig = System.packageWithIndex ? packIndex : packUmd;

  // Add package entries for angular packages
  ngPackageNames.forEach(setPackageConfig);

  var config = {
    map: map,
    packages: packages
  };
  System.config(config);
})(this);