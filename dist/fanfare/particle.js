/* Twitch Filtered Chat Fanfare: Particle */"use strict";/** Particle configuration
 *
 * Particles have the following attributes:
 *  x             Horizontal offset from the left side of the canvas
 *  y             Vertical offset from the top of the canvas
 *  dx            Horizontal starting velocity
 *  dy            Vertical starting velocity
 *  xforce        Horizontal deceleration (i.e. gravity/drag) factor
 *  yforce        Vertical deceleration (i.e. gravity/drag) factor
 *  force         Directionless force (i.e. drag) coefficient
 *  xforceFunc    Advanced function to calculate xforce (see below)
 *  yforceFunc    Advanced function to calculate yforce (see below)
 *  forceFunc     Advanced function to calculate linear force (see below)
 *  a             Opacity: decrements every tick and particles "die" at 0
 *  image         Image instance or array of image instances (for animated GIFs)
 *  width         Default image width
 *  height        Default image height
 *  canvasWidth   Width of the containing canvas (for "bounce" calculation)
 *  canvasHeight  Height of the containing canvas (for "bounce" calculation)
 *  lifeTick      Amount which particles "decay" per tick (default: 0.01)
 *
 * Most of the variables above can be set via one of the following
 * configuration formats:
 *   "X"                use value directly
 *   "Xmin", "Xmax"     use a random number between "Xmin" and "Xmax"
 *   "Xrange"           use a random number between Xrange[0] and Xrange[1]
 * The attributes supporting this format are:
 *   x, y               position
 *   dx, dy             velocity
 *   xforce, yforce     "acceleration"
 *   force              directionless force coefficient
 * Other attributes:
 *   a                  particle opacity (also lifetime)
 *   lifeTick           decrease in opacity per tick
 *   image              DOM Image object
 *   width              image width (or 0 if no image is set/loaded)
 *   height             image height (or 0 if no image is set/loaded)
 *   left, top          particle's x, y
 *   right, bottom      particle's x + width, y + height
 *   borderAction       behavior when hitting a screen border: "default",
 *                      "bounce" (default: "default")
 *
 * The advanced force functions "xforceFunc", "yforceFunc", and "forceFunc"
 * allow special handling of the particle's acceleration:
 *   new_xforce = xforceFunc(tick, xforce)
 *   new_yforce = yforceFunc(tick, yforce)
 *   new_force = forceFunc(tick, force)
 * See below for how this is used.
 *
 * Particles support animated images via passing an array to the "image"
 * configuration key. This is used by setting effect.animated to true and
 * using a GIF for the image URL. See the FanfareCheerEffect class
 * (fanfare/effect.js) for an example.
 *
 * Every "tick", "living" particles are animated according to the following:
 *  p.tick += 1
 *  p.a -= p.lifeTick
 *  p.x += p.dx
 *  p.y += p.dy
 *  p.dx += p.xforce
 *  p.dy += p.yforce
 *  If p.force is nonzero:
 *    p.dx += p.force * Math.hypot(p.x, p.y) * Math.cos(Math.atan2(p.y, p.x))
 *    p.dy += p.force * Math.hypot(p.x, p.y) * Math.sin(Math.atan2(p.y, p.x))
 *  p.xforce = xforceFunc(p.tick, p.xforce)
 *  p.yforce = yforceFunc(p.tick, p.yforce)
 *  p.force = forceFunc(p.tick, p.force)
 *
 * Particles "die" if any of the following are true:
 *  p.a <= 0
 *  p.x + p.width < 0
 *  p.y + p.height < 0
 *  p.x > canvas width
 *  p.y > canvas height
 * Particles are "alive" if their opacity is greater than 0.
 */var _slicedToArray=function(){function a(a,b){var c=[],d=!0,e=!1,f=void 0;try{for(var g,h=a[Symbol.iterator]();!(d=(g=h.next()).done)&&(c.push(g.value),!(b&&c.length===b));d=!0);}catch(a){e=!0,f=a}finally{try{!d&&h["return"]&&h["return"]()}finally{if(e)throw f}}return c}return function(b,c){if(Array.isArray(b))return b;if(Symbol.iterator in Object(b))return a(b,c);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),_createClass=function(){function a(a,b){for(var c,d=0;d<b.length;d++)c=b[d],c.enumerable=c.enumerable||!1,c.configurable=!0,"value"in c&&(c.writable=!0),Object.defineProperty(a,c.key,c)}return function(b,c,d){return c&&a(b.prototype,c),d&&a(b,d),b}}();function _classCallCheck(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}var FanfareParticle=function(){function a(b){_classCallCheck(this,a),this._config=b,this.x=0,this.y=0,this.dx=0,this.dy=0,this.xforce=0,this.yforce=0,this.force=0,this.a=1,this.lifeTick=.01,this.borderAction=a.BORDER_DEFAULT,this._tick=0,this._xforceFunc=function(a,b){return b},this._yforceFunc=function(a,b){return b},this._forceFunc=function(a,b){return b},this._xmin=0,this._xmax=0,this._ymin=0,this._ymax=0,this._image=null,this._frames=null,this._framenr=0,this._applyConfig(b)}/* Position */return _createClass(a,null,[{key:"BORDER_DEFAULT",/* exported FanfareParticle */get:function a(){return"default"}},{key:"BORDER_BOUNCE",get:function a(){return"bounce"}},{key:"BORDER_ACTIONS",get:function b(){return[a.BORDER_DEFAULT,a.BORDER_BOUNCE]}},{key:"DEFAULT_FORCE_FUNC",get:function a(){return function(a,b){return b}}}]),_createClass(a,[{key:"draw",/* Draw the particle to the given context */value:function b(a){this.image&&this.image.complete&&(a.globalAlpha=this.a,a.drawImage(this.image,this.x,this.y))}/* Apply the configuration object (see large comment above) */},{key:"_applyConfig",value:function h(b){var c=b||{},d=function(a){return"number"==typeof c[a]},e=function(a){return Util.IsArray(c[a])&&2===c[a].length},f=function(a,b){return Math.random()*(b-a)+a},g=function(a,b){return d(a)?c[a]:d(a+"min")&&d(a+"max")?f(c[a+"min"],c[a+"max"]):e(a+"range")?f(c[a+"range"][0],c[a+"range"][1]):b};this.x=g("x",0),this.y=g("y",0),this.dx=g("dx",0),this.dy=g("dy",0),this.a=g("a",1),this.xforce=g("xforce",0),this.yforce=g("yforce",0),this.force=g("force",0),this.lifeTick=g("lifeTick",.01),this._xforceFunc=c.xforceFunc||a.DEFAULT_FORCE_FUNC,this._yforceFunc=c.yforceFunc||a.DEFAULT_FORCE_FUNC,this._forceFunc=c.forceFunc||a.DEFAULT_FORCE_FUNC,c.image&&(this.image=c.image),c.canvasWidth&&(this._xmin=0,this._xmax=c.canvasWidth),c.canvasHeight&&(this._ymin=0,this._ymax=c.canvasHeight),c.borderAction&&(-1<a.BORDER_ACTIONS.indexOf(c.borderAction)?this.borderAction=c.borderAction:Util.Warn("Invalid border action "+c.borderAction+"; ignoring"))}/* Calculate change in velocity */},{key:"_calcAccel",value:function n(){var a=Math.sin,b=Math.cos,c=Math.atan2,d=Math.hypot,e=Number.isNaN,f=[this.dx,this.dy],g=f[0],h=f[1],i=e(this.xforce)?0:this.xforce,j=e(this.yforce)?0:this.yforce,k=e(this.force)?0:this.force;if(i=this._xforceFunc(this._tick,i),j=this._yforceFunc(this._tick,j),k=this._forceFunc(this._tick,k),g+=i,h+=j,0!==k){var l=k*d(this.x,this.y),m=c(this.y,this.x);g+=l*b(m),h+=l*a(m)}return[g,h]}/* Handle particle movement and decrease opacity by this.lifeTick */},{key:"tick",value:function d(){if(this.alive){this._tick+=1,this.a-=this.lifeTick,this.x+=this.dx,this.y+=this.dy;var b=this._calcAccel(),c=_slicedToArray(b,2);this.dx=c[0],this.dy=c[1],this.borderAction===a.BORDER_BOUNCE&&(this._xmin!==this._xmax&&(0>this.dx&&this.nextLeft<this._xmin?this.dx*=-1:0<this.dx&&this.nextRight>this._xmax&&(this.dx*=-1)),this._ymin!==this._ymax&&(0>this.dy&&this.nextTop<this._ymin?this.dy*=-1:0<this.dy&&this.nextBottom>this._ymax&&(this.dy*=-1)))}}},{key:"top",get:function a(){return this.y}},{key:"left",get:function a(){return this.x}},{key:"bottom",get:function a(){return this.y+this.height}},{key:"right",get:function a(){return this.x+this.width}/* Position at next timestep */},{key:"nextTop",get:function a(){return this.top+this.dy}},{key:"nextLeft",get:function a(){return this.left+this.dx}},{key:"nextBottom",get:function a(){return this.bottom+this.dy}},{key:"nextRight",get:function a(){return this.right+this.dx}/* Size */},{key:"width",get:function a(){return this._image?this._image.width:0}},{key:"height",get:function a(){return this._image?this._image.height:0}/* Get an image to draw: either a static image or the next frame */},{key:"image",get:function b(){var a=this._image;return this._frames&&0<this._frames.length&&(a=this._frames[this._framenr],this._framenr+=1,this._framenr>=this._frames.length&&(this._framenr=0)),a}/* Set the image to draw: a string (URL), Image instance, or array */,set:function b(a){"string"==typeof a?(this._image=new Image,this._image.src=a):Util.IsArray(a)&&0<a.length?(this._image=a[0],this._frames=a,this._framenr=0):this._image=a}/* Return whether or not the particle is "alive" */},{key:"alive",get:function a(){return 0<this.a}}]),a}();/* vim: set ts=2 sts=2 sw=2 et: */