// Компоненты и библиотеки
var helpers = require('_helper');
var Controller = require('_controller');

var MainController = Controller.create({
  elements: {
    "div.somediv": "hoverElement",
    "div.tooltipster-btn": "tooltip",
    "div.raty": "ratyElement"
  },

  events: {
    "mouseenter p": "toggleClass",
    "mouseleave p": "toggleClass"
  },

  init: function(){
    //console.log(arguments);
    this.tooltip.tooltipster();
    this.ratyElement.raty();
  },

  toggleClass: function(e){
    console.log(this.hoverElement);
    this.hoverElement.toggleClass('over', e.data);
    return false;
  }
});

new MainController({el: $('.element')});