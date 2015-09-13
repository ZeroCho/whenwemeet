/**
 * Created by Zero on 2015-07-25.
 */
window.onerror = function(errorMsg, url, lineNumber, column, errorObj) {
	if (typeof errorMsg === 'string' && errorMsg.indexOf('Script error.') > -1) {
		return;
	}
	console.log('Error: ', errorMsg, ' Script: ' + url + ' Line: ' + lineNumber + ' Column: ' + column + ' StackTrace: ' + errorObj);
};
window.oncontextmenu = function(event) {
	event.preventDefault();
	event.stopPropagation();
	return false;
};
$.fn.showSVGLogo = function(width) {
	var $logo = $($('#wwm-svg-logo').html());
	$logo.width(width || '100%');
	this.prepend($logo);
	return this;
};
$.fn.showCanvasLogo = function(width) {
	var $logo = $($('#wwm-canvas-logo').html());
	var canvas = $logo[0];
	var ctx = canvas.getContext('2d');
	var drawEqTriangle = function(ctx, side, cx, cy, color){
		var h = side * (Math.sqrt(3)/2);    
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.moveTo(cx, cy - h / 2);
		ctx.lineTo(cx - side / 2, cy + h / 2);
		ctx.lineTo(cx + side / 2, cy + h / 2);
		ctx.lineTo(cx, cy - h / 2);
		ctx.shadowOffsetX = 1;
		ctx.shadowOffsetY = 3;
		ctx.shadowBlur    = 1;
		ctx.shadowColor   = 'rgb(204, 204, 204)';      
		ctx.fill(); 
	};
	var drawRevEqTriangle = function(ctx, side, cx, cy, color){
		var h = side * (Math.sqrt(3)/2); 
		ctx.fillStyle = color;
		ctx.beginPath(); 
		ctx.moveTo(cx, cy - h / 2);
		ctx.lineTo(cx - side, cy - h / 2);
		ctx.lineTo(cx - side / 2, cy + h / 2);
		ctx.lineTo(cx, cy - h / 2);
		ctx.shadowOffsetX = 1;
		ctx.shadowOffsetY = 3;
		ctx.shadowBlur    = 1;
		ctx.shadowColor   = 'rgb(204, 204, 204)'; 
		ctx.fill(); 
	};
	drawEqTriangle(ctx, 50, canvas.width/2 + 13, canvas.height/2, 'magenta');
	drawRevEqTriangle(ctx, 50, canvas.width/2 + 7, canvas.height/2, 'cyan');
	drawEqTriangle(ctx, 50, canvas.width/2 - 16, canvas.height/2 - 49, 'yellow');
	drawRevEqTriangle(ctx, 50, canvas.width/2 + 36, canvas.height/2 + 49, 'greenyellow');
	$logo.width(width || '100%');
	this.prepend($logo);
	return this;
};
var eval_dust_string = function(str, chunk, context) {
	var buf;
	if (typeof str === "function") {
		if (str.length === 0) {
			str = str();
		} else {
			buf = '';
			(chunk.tap(function(data) {
				buf += data;
				return '';
			})).render(str, context).untap();
			str = buf;
		}
	}
	return str;
};
if (!dust.helpers) { dust.helpers = {}; }
dust.helpers.repeat = function(chunk, context, bodies, params) {
	var i, times;
	times = parseInt(eval_dust_string(params.times, chunk, context), 10);
	if ((times !== null) && !isNaN(times)) {
		if (context.stack.head !== null) {
			context.stack.head.$len = times;
		}
		for (i = 0; i < times; i++) {
			if (context.stack.head !== null) {
				context.stack.head.$idx = i;
			}
			chunk = bodies.block(chunk, context.push(i, i, times));
		}
		if (context.stack.head !== null) {
			context.stack.head.$idx = 0;
		}
		if (context.stack.head !== null) {
			context.stack.head.$len = 0;
		}
	}
	return chunk;
};
var wwm = (function () {
	'use strict';
	var initModule;
	initModule = function() {
		wwm.model.initModule();
		wwm.shell.initModule();
	};
	return {
		initModule: initModule
	};
}());
