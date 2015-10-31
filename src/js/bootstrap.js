'use strict';
var jQuery = require('jquery');

if (process.env.NODE_ENV === "development") {
  console.log('development only')
}

console.log('test6');

// Глобальные модули
window['jQuery'] = window['$'] = jQuery;
require('tooltipster');
require('raty/lib/jquery.raty');

jQuery(function(){
  require('./controllers/controller1');
  require('./controllers/controller2');
});