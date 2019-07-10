/* Twitch Filtered Chat Fanfare: Particle */"use strict";/** Particle configuration
 *
 * Particles have the following attributes. Defaults are in brackets.
 *  x             [0] Horizontal offset from the left side of the canvas
 *  dx            [0] Horizontal starting velocity
 *  dvx           [0] Horizontal change in velocity per tick (acceleration)
 *  dxFunc        [Id] Advanced function to calculate x velocity (see below)
 *  dvxFunc       [Id] Advanced function to calculate dvx (see below)
 *  y             [0] Vertical offset from the top of the canvas
 *  dy            [0] Vertical starting velocity
 *  dvy           [0] Vertical change in velocity per tick (acceleration)
 *  dyFunc        [Id] Advanced function to calculate y velocity (see below)
 *  dvyFunc       [Id] Advanced function to calculate dvy (see below)
 *  dv            [0] Directionless change in velocity per tick; can be used
 *                to simulate friction
 *  dvFunc        [Id] Advanced function to calculate dv (see below)
 *  a             [1] Opacity: decrements every tick; particles "die" at 0
 *  image         [null] Image instance or image array (for animated GIFs)
 *  width         [0] Default image width
 *  height        [0] Default image height
 *  canvasWidth   [0] Width of the containing canvas (for "bounce")
 *  canvasHeight  [0] Height of the containing canvas (for "bounce")
 *  lifeTick      [0.01] Amount which particles "decay" per tick
 *  seed          [0] Arbitrary number available to the advanced functions
 *  borderAction  ["default"] Behavior when hitting a screen border: "default"
 *                ignores the border, "bounce" bounces off the screen border
 * [Id]: function(t, v) { return v; }
 *
 * Most of the variables above can be set via one of the following
 * configuration formats:
 *  "X"                 use value directly
 *  "Xmin", "Xmax"      use a random number between "Xmin" and "Xmax"
 *  "Xrange"            use a random number between Xrange[0] and Xrange[1]
 * The attributes supporting this format are:
 *   x, y               position
 *   dx, dy             velocity
 *   dvx, dvy           acceleration
 *   dv                 directionless acceleration
 *
 * Particles support animated images via passing an array to the "image"
 * configuration key. This is used by setting effect.animated to true and
 * using a GIF for the image URL. See FanfareCheerEffect (fanfare/effect.js)
 * for an example.
 *
 * Every "tick", "living" particles are animated according to the following:
 *  p.tick += 1
 *  p.a -= p.lifeTick
 *  p.x += p.dx
 *  p.y += p.dy
 *  p.dx = dxFunc(p.tick, p.dx + p.dvx)
 *  p.dy = dyFunc(p.tick, p.dy + p.dvy)
 *  If p.dv is nonzero:
 *    p.dx += p.dv * Math.hypot(p.x, p.y) * Math.cos(Math.atan2(p.y, p.x))
 *    p.dy += p.dv * Math.hypot(p.x, p.y) * Math.sin(Math.atan2(p.y, p.x))
 *  p.dvx = dvxFunc(p.tick, p.dvx)
 *  p.dvy = dvyFunc(p.tick, p.dvy)
 *  p.dv = dvFunc(p.tick, p.dv)
 */var _slicedToArray=function(){function a(a,b){var c=[],d=!0,e=!1,f=void 0;try{for(var g,h=a[Symbol.iterator]();!(d=(g=h.next()).done)&&(c.push(g.value),!(b&&c.length===b));d=!0);}catch(a){e=!0,f=a}finally{try{!d&&h["return"]&&h["return"]()}finally{if(e)throw f}}return c}return function(b,c){if(Array.isArray(b))return b;if(Symbol.iterator in Object(b))return a(b,c);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),_createClass=function(){function a(a,b){for(var c,d=0;d<b.length;d++)c=b[d],c.enumerable=c.enumerable||!1,c.configurable=!0,"value"in c&&(c.writable=!0),Object.defineProperty(a,c.key,c)}return function(b,c,d){return c&&a(b.prototype,c),d&&a(b,d),b}}();function _classCallCheck(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}var FanfareParticle=function(){function a(b){_classCallCheck(this,a),this._config=b;var c=[0,0];this.x=c[0],this.y=c[1];var d=[0,0];this.dx=d[0],this.dy=d[1];var e=[0,0];this.dvx=e[0],this.dvy=e[1],this.dv=0,this.a=1,this.lifeTick=.01,this.seed=0,this.borderAction=a.BORDER_DEFAULT,this._tick=0,this._dxFunc=function(a,b){return b},this._dyFunc=function(a,b){return b},this._dvxFunc=function(a,b){return b},this._dvyFunc=function(a,b){return b},this._dvFunc=function(a,b){return b};var f=[0,0];this._xmin=f[0],this._xmax=f[1];/* Image information */var g=[0,0];this._ymin=g[0],this._ymax=g[1],this._image=null,this._frames=null,this._framenr=0,this._applyConfig(b)}/* Position */return _createClass(a,null,[{key:"BORDER_DEFAULT",/* exported FanfareParticle */get:function a(){return"default"}},{key:"BORDER_BOUNCE",get:function a(){return"bounce"}},{key:"BORDER_ACTIONS",get:function b(){return[a.BORDER_DEFAULT,a.BORDER_BOUNCE]}},{key:"DEFAULT_FUNC",get:function a(){return function(a,b){return b}}}]),_createClass(a,[{key:"draw",/* Draw the particle to the given context */value:function b(a){this.image&&this.image.complete&&(a.globalAlpha=this.a,a.drawImage(this.image,this.x,this.y))}/* Apply the configuration object (see large comment above) */},{key:"_applyConfig",value:function h(b){var c=b||{},d=function(a){return"number"==typeof c[a]},e=function(a){return Util.IsArray(c[a])&&2===c[a].length},f=function(a,b){return Math.random()*(b-a)+a},g=function(a,b){return d(a)?c[a]:d(a+"min")&&d(a+"max")?f(c[a+"min"],c[a+"max"]):e(a+"range")?f(c[a+"range"][0],c[a+"range"][1]):b};this.x=g("x",0),this.y=g("y",0),this.dx=g("dx",0),this.dy=g("dy",0),this.a=g("a",1),this.dvx=g("dvx",0),this.dvy=g("dvy",0),this.dv=g("dv",0),this.lifeTick=g("lifeTick",.01),this._dxFunc=c.dxFunc||a.DEFAULT_FUNC,this._dyFunc=c.dyFunc||a.DEFAULT_FUNC,this._dvxFunc=c.dvxFunc||a.DEFAULT_FUNC,this._dvyFunc=c.dvyFunc||a.DEFAULT_FUNC,this._dvFunc=c.dvFunc||a.DEFAULT_FUNC,c.seed&&(this.seed=c.seed),c.image&&(this.image=c.image),c.canvasWidth&&(this._xmin=0,this._xmax=c.canvasWidth),c.canvasHeight&&(this._ymin=0,this._ymax=c.canvasHeight),c.borderAction&&(-1<a.BORDER_ACTIONS.indexOf(c.borderAction)?this.borderAction=c.borderAction:Util.Warn("Invalid border action "+c.borderAction+"; ignoring"))}/* Calculate new velocity */},{key:"_calcAccel",value:function n(){var a=Math.sin,b=Math.cos,c=Math.atan2,d=Math.hypot,e=Number.isNaN,f=[this.dx,this.dy],g=f[0],h=f[1],i=e(this.dvx)?0:this.dvx,j=e(this.dvy)?0:this.dvy,k=e(this.dv)?0:this.dv;if(i=this._dvxFunc(this._tick,i),j=this._dvyFunc(this._tick,j),k=this._dvFunc(this._tick,k),g+=i,h+=j,0!==k){var l=k*d(this.x,this.y),m=c(this.y,this.x);g+=l*b(m),h+=l*a(m)}return[this._dxFunc(this._tick,g),this._dyFunc(this._tick,h)]}/* Handle particle movement and decrease opacity by this.lifeTick */},{key:"tick",value:function d(){if(this.alive){this._tick+=1,this.a-=this.lifeTick,this.x+=this.dx,this.y+=this.dy;var b=this._calcAccel(),c=_slicedToArray(b,2);this.dx=c[0],this.dy=c[1],this.borderAction===a.BORDER_BOUNCE&&(this._xmin!==this._xmax&&(0>this.dx&&this.nextLeft<this._xmin?this.dx*=-1:0<this.dx&&this.nextRight>this._xmax&&(this.dx*=-1)),this._ymin!==this._ymax&&(0>this.dy&&this.nextTop<this._ymin?this.dy*=-1:0<this.dy&&this.nextBottom>this._ymax&&(this.dy*=-1)))}}},{key:"top",get:function a(){return this.y}},{key:"left",get:function a(){return this.x}},{key:"bottom",get:function a(){return this.y+this.height}},{key:"right",get:function a(){return this.x+this.width}/* Position at next timestep */},{key:"nextTop",get:function a(){return this.top+this.dy}},{key:"nextLeft",get:function a(){return this.left+this.dx}},{key:"nextBottom",get:function a(){return this.bottom+this.dy}},{key:"nextRight",get:function a(){return this.right+this.dx}/* Size */},{key:"width",get:function a(){return this._image?this._image.width:0}},{key:"height",get:function a(){return this._image?this._image.height:0}/* Get the image to draw: either a static image or the next frame */},{key:"image",get:function b(){var a=this._image;return this._frames&&0<this._frames.length&&(a=this._frames[this._framenr],this._framenr=(this._framenr+1)%this._frames.length),a}/* Set the image to draw: a string (URL), Image instance, or array */,set:function b(a){"string"==typeof a?(this._image=new Image,this._image.src=a):Util.IsArray(a)&&0<a.length?(this._image=a[0],this._frames=a,this._framenr=0):this._image=a}/* Return whether or not the particle is "alive" */},{key:"alive",get:function a(){return 0<this.a}}]),a}();/* vim: set ts=2 sts=2 sw=2 et: */