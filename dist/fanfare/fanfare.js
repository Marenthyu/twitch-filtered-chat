/** Fanfare
 *
 * Commands: (both //fanfare and //ff refer to the same command)
 *   //ff           Displays //ff usage and whether or not fanfare is enabled
 *   //ff help      Displays //ff usage
 *   //ff on        Enables fanfare
 *   //ff off       Disables fanfare
 *   //ff demo      Demonstrates available fanfares
 *   //ff cheerdemo Demonstrates the cheer effect (see //ff help for more)
 *   //ff subdemo   Demonstrates the sub effect (see //ff help for more)
 *
 * Configuration keys:
 *   Query string key:  "fanfare": `&fanfare=<config>`
 *   Config object key: "Fanfare": `{Fanfare: <config>}`
 *
 * The <config> value is either a number (non-zero for enable), a boolean, or
 * a JSON-encoded object with any of the following attributes:
 *   enable         boolean; whether or not fanfares are enabled (false)
 *   suburl         (sub) URL to the image to use for sub fanfares; overrides
 *                  all other image settings
 *   cheerurl       (cheer) URL to the image to use for cheer fanfares;
 *                  overrides all other image settings
 *   imageurl       URL to the image to use for all fanfares; overrides all
 *                  other image settings other than "suburl" and "cheerurl"
 *   cheerbg        (cheer) background: either "light" or "dark" ("dark")
 *   cheermote      (cheer) cheermote prefix ("Cheer")
 *   cheerscale     (cheer) image scale: 1, 1.5, 2, etc. ("2")
 *   subemote       (sub) emote to use for sub events
 *   emote          fallback emote if no other image is defined
 *   numparticles   number of particles (window.width / image.width)
 *   static         render static images only (false)
 * Default values are given in parentheses.
 * "(cheer)" denotes a FanfareCheerEffect-only attribute.
 * "(sub)" denotes a FanfareSubEffect-only attribute.
 *
 * Example configuration items:
 *  The following are all identical; they all enable fanfares:
 *   &fanfare=1
 *   &fanfare=true
 *   &fanfare=%7B%22enable%22%3Atrue%7D
 *
 *  The following enable fanfares and set specific emotes:
 *   &fanfare=%7B%22subemote%22%3A%22FrankerZ%22%7D
 *   {Fanfare: {subemote: "FrankerZ"}}
 *                  Use the emote "FrankerZ" for all sub fanfares
 *   &fanfare=%7B%22emote%22%3A%22FrankerZ%22%7D
 *   {Fanfare: {emote: "FrankerZ"}}
 *                  Use the emote "FrankerZ" for all fanfares
 *   &fanfare=%7B%22cheermote%22%3A%22Kappa%22%2C%22cheerscale%22%3A%221%22%7D
 *   {Fanfare: {cheermote: "Kappa", cheerscale: "1"}}
 *                  Use the "Kappa" cheeremote at 1x scale (normal chat size)
 */"use strict";var _slicedToArray=function(){function a(a,b){var c=[],d=!0,e=!1,f=void 0;try{for(var g,h=a[Symbol.iterator]();!(d=(g=h.next()).done)&&(c.push(g.value),!(b&&c.length===b));d=!0);}catch(a){e=!0,f=a}finally{try{!d&&h["return"]&&h["return"]()}finally{if(e)throw f}}return c}return function(b,c){if(Array.isArray(b))return b;if(Symbol.iterator in Object(b))return a(b,c);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),_createClass=function(){function a(a,b){for(var c,d=0;d<b.length;d++)c=b[d],c.enumerable=c.enumerable||!1,c.configurable=!0,"value"in c&&(c.writable=!0),Object.defineProperty(a,c.key,c)}return function(b,c,d){return c&&a(b.prototype,c),d&&a(b,d),b}}();function _classCallCheck(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}var Fanfare=function(){function a(b,c){_classCallCheck(this,a),this._client=b,this._config=c.Fanfare||{enable:!1},this._on=this._config.enable,this._tick=this._config.tick||a.DEFAULT_TPS,this._running=[],this._timer=null,this._canvas=this.elem("canvas","ff-canvas",{id:"ff-canvas",style:"pointer-events: none; position: absolute; top: 0; left: 0; z-index: 100;"}),this._cWidth=window.innerWidth,this._cHeight=window.innerHeight,this._canvas.width=this._cWidth,this._canvas.height=this._cHeight,this._context=this._canvas.getContext("2d"),document.body.appendChild(this._canvas),ChatCommands.add("fanfare",this._onCmd,"Enable or disable fanfare",this),ChatCommands.configureCommand("fanfare",{disableClone:!0}),ChatCommands.addUsage("fanfare",null,"Show fanfare status and help"),ChatCommands.addUsage("fanfare","help","Show fanfare help"),ChatCommands.addUsage("fanfare","on","Enable fanfare"),ChatCommands.addUsage("fanfare","off","Disable fanfare"),ChatCommands.addUsage("fanfare","demo","Demonstrate fanfare"),ChatCommands.addUsage("fanfare","cheerdemo","Demonstrate cheer fanfare"),ChatCommands.addUsage("fanfare","subdemo","Demonstrate sub fanfare"),ChatCommands.addUsage("fanfare","config","Manage fanfare configuration"),ChatCommands.addAlias("ff","fanfare"),b.bind("twitch-chat",this._onChatEvent.bind(this,b)),b.bind("twitch-sub",this._onSubEvent.bind(this,b)),b.bind("twitch-resub",this._onSubEvent.bind(this,b)),b.bind("twitch-giftsub",this._onSubEvent.bind(this,b)),b.bind("twitch-anongiftsub",this._onSubEvent.bind(this,b))}/* Enable switch */return _createClass(a,null,[{key:"DEFAULT_NUM_PARTICLES",/* exported Fanfare *//* Defaults */get:function a(){return 25}},{key:"DEFAULT_TPS",get:function a(){return 30}}]),_createClass(a,[{key:"bindClient",/* Listen to a twitch event */value:function c(a,b){this._client.bind(a,b)}/* Create an element with some default attributes */},{key:"elem",value:function z(a,b){var c=document.createElement(a),d=function(a,b){"innerHTML"===a?c.innerHTML=b:"innerText"===a?c.innerText=b:c.setAttribute(a,b)};d("class",("ff "+b).trim()),d("data-from","fanfare");for(var e=arguments.length,f=Array(2<e?e-2:0),g=2;g<e;g++)f[g-2]=arguments[g];var h=!0,i=!1,j=void 0;try{for(var l,m,n=f[Symbol.iterator]();!(h=(l=n.next()).done);h=!0)/* FIXME: Check for any kind of "pair", not just Array[2] */if(m=l.value,Util.IsArray(m)&&2===m.length){var o=_slicedToArray(m,2),p=o[0],k=o[1];d(p,k)}else{var q=!0,r=!1,s=void 0;try{for(var t,u=Object.entries(m)[Symbol.iterator]();!(q=(t=u.next()).done);q=!0){var v=t.value,w=_slicedToArray(v,2),x=w[0],y=w[1];d(x,y)}}catch(a){r=!0,s=a}finally{try{!q&&u.return&&u.return()}finally{if(r)throw s}}}}catch(a){i=!0,j=a}finally{try{!h&&n.return&&n.return()}finally{if(i)throw j}}return c}/* Construct an img element */},{key:"image",value:function d(a){var b=1<arguments.length&&void 0!==arguments[1]?arguments[1]:null,c=b?Util.JSONClone(b):{};return c.src=a,this.elem("img","ff-image ff-emote",c)}/* Construct an img element of a Twitch emote */},{key:"twitchEmote",value:function c(a){var b=1<arguments.length&&void 0!==arguments[1]?arguments[1]:null;return this.image(this._client.GetEmote(a),b)}/* Clears the canvas */},{key:"clearCanvas",value:function a(){this._context.clearRect(0,0,this.width,this.height)}/* Start a new animation */},{key:"addEffect",value:function c(a){var b=this;a.load().then(function(){Util.LogOnly("Loaded effect "+a),b._running.push(a),b.startAnimation()}).catch(function(b){Util.Error("Failed to load effect "+a),Content.addErrorText(""+b),Util.DebugOnly(b)})}/* Begin animating */},{key:"startAnimation",value:function d(){var a=this;if(null===this._timer){var b=function(){var b=[];a.clearCanvas();var c=!0,d=!1,e=void 0;try{for(var f,g,h=a._running[Symbol.iterator]();!(c=(f=h.next()).done);c=!0)g=f.value,g.tick()?(g.draw(a._context),b.push(g)):Util.LogOnly("Completed effect "+g)}catch(a){d=!0,e=a}finally{try{!c&&h.return&&h.return()}finally{if(d)throw e}}a._running=b,0===a._running.length&&a.stopAnimation()},c=1e3/this._tick;this._timer=window.setInterval(b,c)}}/* Terminate animations */},{key:"stopAnimation",value:function a(){null!==this._timer&&(window.clearInterval(this._timer),this._timer=null,this._running=[])}/* Handle //fanfare (or //ff) command */},{key:"_onCmd",value:function L(a,b,c,d){/* Note: called as a command; `this` refers to a command object */var e=0===b.length?null:b[0];if(null===e||"help"===e){null===e&&Content.addHelpText("Fanfare is "+(d._on?"en":"dis")+"abled"),this.printUsage(),Content.addHelpText("Modifications made via \"//"+a+" config\" are lost on reload"),Content.addHelpText("Add a number to cheerdemo to simulate that number of bits"),Content.addHelpText("Available arguments for subdemo:");var f=!0,g=!1,h=void 0;try{for(var i,j,l=TwitchSubEvent.KINDS[Symbol.iterator]();!(f=(i=l.next()).done);f=!0)j=i.value,Content.addHelpLineE(j,"Demonstrate the "+j+" type of subscription")}catch(a){g=!0,h=a}finally{try{!f&&l.return&&l.return()}finally{if(g)throw h}}var m=!0,n=!1,o=void 0;try{for(var q,r=TwitchSubEvent.PLANS[Symbol.iterator]();!(m=(q=r.next()).done);m=!0){var s=q.value,t=TwitchSubEvent.PlanName(s);Content.addHelpLineE(s,"Demonstrate a "+t+" subscription")}}catch(a){n=!0,o=a}finally{try{!m&&r.return&&r.return()}finally{if(n)throw o}}Content.addHelpText("Available \"//"+a+" config\" arguments:"),Content.addHelpLineE("config set <k> <v>","Set key <k> to value <v>"),Content.addHelpLineE("config unset <k>","Unset key <k>")}else if("on"===e)d._on=!0,Content.addInfoText("Fanfare is now enabled");else if("off"===e)d._on=!1,Content.addInfoText("Fanfare is now disabled");else if("demo"===e)d._onChatEvent(d._client,{bits:1e3},!0),d._onSubEvent(d._client,{kind:TwitchSubEvent.KIND_SUB,plan:TwitchSubEvent.PLAN_TIER1},!0);else if("cheerdemo"===e){var M=1e3;2===b.length&&Util.IsNumber(b[1])&&(M=Util.ParseNumber(b[1])),d._onChatEvent(d._client,{bits:M},!0)}else if("subdemo"===e){var u=TwitchSubEvent.KIND_SUB,v=TwitchSubEvent.PLAN_TIER1;if(1<b.length){var w=!0,x=!1,y=void 0;try{for(var z,A,B=TwitchSubEvent.KINDS[Symbol.iterator]();!(w=(z=B.next()).done);w=!0)A=z.value,b.includes(A)&&(u=A)}catch(a){x=!0,y=a}finally{try{!w&&B.return&&B.return()}finally{if(x)throw y}}var C=!0,D=!1,E=void 0;try{for(var F,G,H=TwitchSubEvent.PLANS[Symbol.iterator]();!(C=(F=H.next()).done);C=!0)G=F.value,b.includes(G)&&(v=G)}catch(a){D=!0,E=a}finally{try{!C&&H.return&&H.return()}finally{if(D)throw E}}}d._onSubEvent(d._client,{kind:u,plan:v},!0)}else if("config"!==e)Content.addErrorText("Fanfare: unknown argument "+e),this.printUsage();else if(Content.addHelpLineE("config",JSON.stringify(d._config)),2<b.length){var I=b[1],J=b[2],K=b.slice(3).join(" ");"set"===I?d._config[J]=K:"unset"===I?delete d._config[J]:(Content.addErrorText("Fanfare: unknown config argument "+I),Content.addHelpText("Available arguments:"),Content.addHelpLineE("config set <k> <v>","Set key <k> to value <v>"),Content.addHelpLineE("config unset <k>","Unset key <k>"))}}/* Received a message from the client */},{key:"_onChatEvent",value:function d(a,b){var c=!!(2<arguments.length&&void 0!==arguments[2])&&arguments[2];(this._on||c)&&0<b.bits&&this.addEffect(new FanfareCheerEffect(this,this._config,b))}/* Received a subscription event from the client */},{key:"_onSubEvent",value:function d(a,b){var c=!!(2<arguments.length&&void 0!==arguments[2])&&arguments[2];(this._on||c)&&this.addEffect(new FanfareSubEffect(this,this._config,b))}},{key:"enable",get:function a(){return this._on},set:function b(a){this._on=a}/* Animation speed */},{key:"tps",get:function a(){return this._tick},set:function b(a){this._tick=a}},{key:"tickTime",set:function b(a){this._tick=1e3*a}/* Canvas attributes */},{key:"canvas",get:function a(){return this._canvas}},{key:"context",get:function a(){return this._context}},{key:"width",get:function a(){return this._canvas.width}},{key:"height",get:function a(){return this._canvas.height}}]),a}();/* globals FanfareCheerEffect FanfareSubEffect *//* vim: set ts=2 sts=2 sw=2 et: */
