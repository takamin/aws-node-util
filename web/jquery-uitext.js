/* global $ */
"use strict";
$.fn.uitext = function() {
    this.each(function() {
        $(this).addClass("ui-spinner-input")
            .css({'margin-right':'.4em'})
            .appendTo(
                $('<span/>')
                    .addClass("ui-spinner")
                    .addClass("ui-widget")
                    .addClass("ui-widget-content")
                    .addClass("ui-corner-all")
                    .insertBefore(this));
    });
};