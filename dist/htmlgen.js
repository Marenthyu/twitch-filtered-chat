/* HTML Generator for the Twitch Filtered Chat */"use strict";/* TODO:
 * Format clip information
 * USERNOTICEs:
 *   rewardgift
 *   submysterygift
 *   primepaidupgrade
 *   giftpaidupgrade
 *     msg-param-promo-gift-total
 *     msg-param-promo-name
 *   anongiftpaidupgrade
 *     msg-param-promo-gift-total
 *     msg-param-promo-name
 *   unraid
 *   bitsbadgetier
 */var _slicedToArray=function(){function a(a,b){var c=[],d=!0,e=!1,f=void 0;try{for(var g,h=a[Symbol.iterator]();!(d=(g=h.next()).done)&&(c.push(g.value),!(b&&c.length===b));d=!0);}catch(a){e=!0,f=a}finally{try{!d&&h["return"]&&h["return"]()}finally{if(e)throw f}}return c}return function(b,c){if(Array.isArray(b))return b;if(Symbol.iterator in Object(b))return a(b,c);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(a){return typeof a}:function(a){return a&&"function"==typeof Symbol&&a.constructor===Symbol&&a!==Symbol.prototype?"symbol":typeof a},_createClass=function(){function a(a,b){for(var c,d=0;d<b.length;d++)c=b[d],c.enumerable=c.enumerable||!1,c.configurable=!0,"value"in c&&(c.writable=!0),Object.defineProperty(a,c.key,c)}return function(b,c,d){return c&&a(b.prototype,c),d&&a(b,d),b}}();function _classCallCheck(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}var HTMLGenerator=function(){/* exported HTMLGenerator */function HTMLGenerator(a){var b=1<arguments.length&&void 0!==arguments[1]?arguments[1]:null;_classCallCheck(this,HTMLGenerator),this._client=a,this._config=b||{},this._default_colors=["lightseagreen","forestgreen","goldenrod","dodgerblue","darkorchid","crimson"],this._user_colors={},this._shadow_colors=["#1d1d1d","#0a0a0a","#d1d1d1"],this._highlights=[],this._config.Layout||(this._config.Layout={}),this._config.ShowClips||(this._config.ShowClips=!1)}/* Set the configuration key to the value given */return _createClass(HTMLGenerator,[{key:"setValue",value:function c(a,b){this._config[a]=b}/* Return configuration for the given key */},{key:"getValue",value:function b(a){return this._config[a]}/* Return whether or not mod antics are enabled */},{key:"addHighlightMatch",/* Add one highlight match pattern */value:function b(a){this._highlights.push(a)}/* Obtain highlight match patterns */},{key:"getColorFor",/* Calculate (and cache) a color for the given username */value:function e(a){var b=""+a;if("string"!=typeof a){var f=("undefined"==typeof a?"undefined":_typeof(a))+", "+JSON.stringify(a);Util.Error("Expected string, got "+f)}if(!this._user_colors.hasOwnProperty(b)){for(var c=0,d=0;d<b.length;++d)c=(c<<5)-c+b.charCodeAt(d);/* Taken from Twitch vendor javascript */c%=this._default_colors.length,0>c&&(c+=this._default_colors.length),this._user_colors[b]=this._default_colors[c]}return this._user_colors[b]}/* Returns array of [css attr, css value] */},{key:"genBorderCSS",value:function c(a){var b=Util.GetMaxContrast(a,this._shadow_colors);return["text-shadow","-0.8px -0.8px 0 "+b+","+(" 0.8px -0.8px 0 "+b+",")+("-0.8px  0.8px 0 "+b+",")+(" 0.8px  0.8px 0 "+b)]}/* Returns jquery node */},{key:"genName",value:function h(a,b){var c=$("<span class=\"username\" data-username=\"1\"></span>");c.css("color",b||this.getColorFor(a)||"#ffffff");/* Determine the best border color to use */var d=this.genBorderCSS(c.css("color")),e=_slicedToArray(d,2),f=e[0],g=e[1];return c.css(f,g),c.text(a),c}/* Returns string */},{key:"twitchEmote",value:function d(a){var b=1<arguments.length&&void 0!==arguments[1]?arguments[1]:null,c={id:a};return b&&(c.name=b),this._emote("twitch",this._client.GetEmote(a),c)}/* Ensure the wrapper message does not contain "undefined" */},{key:"_checkUndefined",value:function c(a,b){-1<b[0].outerHTML.indexOf("undefined")&&(Util.Error("msg contains undefined"),Util.ErrorOnly(a,b,b[0].outerHTML))}/* Returns string */},{key:"_emote",value:function g(a,b){var c=2<arguments.length&&void 0!==arguments[2]?arguments[2]:null,d=$("<span class=\"emote-wrapper\"></span>"),e=$("<img class=\"emote\" />");d.addClass(a+"-emote"),d.attr("data-is-emote-wrapper","1"),e.addClass(a+"-emote"),e.attr("data-is-emote","1"),e.attr("src",b),e.attr("data-emote-src",a),c&&(c.id&&(e.attr("data-emote-id",c.id),e.attr("alt",c.id),e.attr("title",c.id),d.attr("data-emote-name",c.id)),c.name&&(e.attr("data-emote-name",c.name),e.attr("alt",c.name),e.attr("title",c.name),d.attr("data-emote-name",c.name)),(c.w||c.width)&&e.attr("width",c.w||c.width),(c.h||c.height)&&e.attr("height",c.h||c.height),c.def&&e.attr("data-emote-def",JSON.stringify(c.def)));var f=[];return e.attr("data-emote-name")&&f.push(e.attr("data-emote-name")),"twitch"===a?f.push("Twitch"):"ffz"===a?f.push("FFZ"):"bttv"===a?f.push("BTTV"):f.push(a),d.attr("data-text",f.map(function(a){return a.replace(/ /g,"\xA0")}).join("\n")),d.append(e),d[0].outerHTML}/* Returns string */},{key:"_getCheerImage",value:function f(a,b){var c=$("body").hasClass("light")?"light":"dark",d=a.images[c]||a.images.dark,e=this._config.NoAnim?d.static:d.animated;return e[b]}/* Returns string */},{key:"_genCheer",value:function h(a,b){var c=$("<img class=\"cheer-image\" />"),d=$("<span class=\"cheer cheermote\"></span>"),e=a.tiers.filter(function(a){return b>=a.min_bits}),f=e.max(function(a){return a.min_bits}),g=this._getCheerImage(f,a.scales.min(function(a){return+a}));/* Use the highest tier image that doesn't exceed the cheered bits *//* Use the smallest scale available */return c.attr("alt",a.prefix+" "+b+" bits"),c.attr("title",a.prefix+" "+b+" bits"),c.attr("src",g),d.css("color",f.color),d.attr("data-cheer-def",JSON.stringify(f)),d.attr("data-cheer",JSON.stringify(a)),d.append(c),d.append(b),d[0].outerHTML}/* Returns jquery node */},{key:"_wrapBadge",value:function w(a){var b=function(b){return a.attr("data-"+b)||""},c=$(a),d=$("<span class=\"badge\"></span>"),f=[],g=b("badge"),h=""+b("badge-name"),i=Util.ParseNumber(""+b("badge-num")),j=Util.ParseNumber(""+b("badge-submonths")),k=b("badge-scope"),l=!0,m=!1,n=void 0;/* Copy all data attributes from elem to $s */try{for(var o,p=c[Symbol.iterator]();!(l=(o=p.next()).done);l=!0){var q=o.value,e=!0,r=!1,s=void 0;try{for(var t,u,v=q.getAttributeNames()[Symbol.iterator]();!(e=(t=v.next()).done);e=!0)u=t.value,u.startsWith("data-")&&d.attr(u,q.getAttribute(u))}catch(a){r=!0,s=a}finally{try{!e&&v.return&&v.return()}finally{if(r)throw s}}}/* Store image information */}catch(a){m=!0,n=a}finally{try{!l&&p.return&&p.return()}finally{if(m)throw n}}if(0<g.length){var x=JSON.parse(g);x.image_url_4x?d.attr("data-icon-large-src",x.image_url_4x):x.image_url_2x&&d.attr("data-icon-large-src",x.image_url_2x)}/* Append badge number */return i&&1!==i&&(h+=" ("+i+")"),f.push(h.toTitleCase()),j&&f.push(j+" month"+(1===j?"":"s")),"global"===k?f.push("Global Badge"):"channel"===k?(f.push("Channel Badge"),f.push("#"+b("badge-channel"))):"ffz"===k?f.push("FFZ Badge"):"bttv"===k&&f.push("BTTV Badge"),d.attr("data-text",f.map(function(a){return a.replace(/ /g,"\xA0")}).join("\n")),d.append(a)}/* Returns jquery node */},{key:"_genBadges",value:function z(a){function b(a){return $("<img class=\"badge\" width=\"18px\" height=\"18px\" />").addClass(a)}/* Add Twitch-native badges */var c=$("<span class=\"badges\" data-badges=\"1\"></span>"),d=0;if(a.flags.badges&&(d+=18*a.flags.badges.length),a.flags["ffz-badges"]&&(d+=18*a.flags["ffz-badges"].length),a.flags["bttv-badges"]&&(d+=18*a.flags["bttv-badges"].length),c.css("overflow","hidden"),c.css("width",d+"px"),c.css("max-width",d+"px"),a.flags.badges){var e=!0,f=!1,g=void 0;try{for(var h,i=a.flags.badges[Symbol.iterator]();!(e=(h=i.next()).done);e=!0){var j=h.value,k=_slicedToArray(j,2),l=k[0],m=k[1],n=b("twitch-badge");if(n.attr("data-badge-name",l),n.attr("data-badge-num",m),n.attr("data-badge-cause",JSON.stringify([l,m])),n.attr("data-badge","1"),n.attr("title",l+"/"+m),n.attr("alt",l+"/"+m),this._client.IsChannelBadge(a.channel,l,m)){/* Format a channel-specific badge */var o=a.channel,p=this._client.GetChannelBadge(o,l,m),q=p.image_url_1x,r=a.channelString.replace(/^#/,"");n.attr("src",q),n.attr("data-badge",JSON.stringify(p)),n.attr("data-badge-scope","channel"),n.attr("data-badge-channel",r)}else if(this._client.IsGlobalBadge(l,m)){/* Format a global badge */var A=this._client.GetGlobalBadge(l,m);n.attr("src",A.image_url_1x),n.attr("data-badge-scope","global"),n.attr("data-badge",JSON.stringify(A))}else{Util.Warn("Unknown badge",l,m,"for",a);continue}/* Store the precise number of months subscribed */"subscriber"===l&&a.subMonths&&n.attr("data-badge-submonths",a.subMonths),c.append(this._wrapBadge(n))}}catch(a){f=!0,g=a}finally{try{!e&&i.return&&i.return()}finally{if(f)throw g}}}/* Add FFZ badges */if(a.flags["ffz-badges"]){var s=!0,t=!1,u=void 0;try{for(var v,w=Object.values(a.flags["ffz-badges"])[Symbol.iterator]();!(s=(v=w.next()).done);s=!0){var x=v.value,y=b("ffz-badge");y.attr("data-badge","1"),y.attr("data-ffz-badge","1"),y.attr("data-badge-scope","ffz"),y.attr("data-badge-name",x.title),y.attr("src",Util.URL(x.image)),y.attr("alt",x.name),y.attr("title",x.title),c.append(this._wrapBadge(y))}}catch(a){t=!0,u=a}finally{try{!s&&w.return&&w.return()}finally{if(t)throw u}}}/* For if BTTV ever adds badges
    if (event.flags["bttv-badges"]) {
      for (let badge of Object.values(event.flags["bttv-badges"])) {
        let $b = makeBadge("bttv-badge");
        $b.attr("data-badge", "1");
        $b.attr("data-ffz-badge", "1");
        $b.attr("data-badge-scope", "bttv");
        $b.attr("data-badge-name", "Unknown BTTV Badge");
        $b.attr("src", Util.URL(badge.image));
        $b.attr("alt", "Unknown BTTV Badge");
        $b.attr("title", "Unknown BTTV Badge");
        $bc.append(this._wrapBadge($b));
      }
    } */return c}/* Returns jquery node */},{key:"_genName",value:function d(a){/* Display upper-case name, assign color to lower-case name */var b=a.name||a.user,c=a.flags.color||this.getColorFor(a.user)||"#ffffff";return this.genName(b,c)}/* Adjust the replacement map between [start,end] by len */},{key:"_remap",value:function h(a,b,c,d){for(var e=a[b],f=a[c],g=b;g<c;++g)/* Set values within the range to the end */a[g]=f+d;/* IDEA BEHIND MAP ADJUSTMENT:
     * 1) Maintain two parallel strings, `msg0` (original) and `msg` (final).
     * 2) Maintain the following invariant:
     *  a) msg0.indexOf("substr") === map[msg.indexOf("substr")]
     *  b) msg0[idx] === msg1[map[idx]]
     * Exceptions:
     *  If msg0[idx] is part of a formatted entity; msg[map[idx]] may not be
     *  the same character.
     * Usage:
     *  The map allows for formatting the final message based on where items
     *  appear in the original message.
     */for(var i=c;i<a.length;++i)/* Adjust values beyond the range by length */a[i]+=d-(f-e)}/* Format cheermotes */},{key:"_msgCheersTransform",value:function o(a,b,c,d,e){var f=b;if(a.flags.bits&&0<a.flags.bits){var g=a.flags.bits,h=this._client.FindCheers(a.channel,a.message);/* Sort the cheer matches from right-to-left */for(h.sort(function(c,a){return c.start-a.start});0<h.length;){var i=h.pop(),j=[c[i.start],c[i.end]],k=j[0],l=j[1],m=this._genCheer(i.cheer,i.bits),n=k+m.length;/* Insert the cheer HTML and adjust the map */for(f=f.substr(0,k)+m+f.substr(l),this._remap(c,i.start,i.end,m.length),k=l=n;n<f.length;){var p="";if(f[n].match(/\s/))n+=1;else{l=f.substr(n).search(/\s/),l=-1===l?f.length:n+l,p=f.substring(n,l);var q=GetCheerStyle(p.toLowerCase());if(q&&!q._disabled&&g>=q.cost)e.push(q),g-=q.cost;else{l=n;break}n=l}}k!==l&&(f=f.substr(0,k)+" "+f.substr(l),this._remap(c,k,l,0))}}return f}/* Format Twitch emotes */},{key:"_msgEmotesTransform",value:function j(a,b,c){var d=b;if(a.flags.emotes){var k=a.flags.emotes.map(function(b){return{id:b.id,name:b.name||a.message.substring(b.start,b.end+1),start:b.start,end:b.end,def:b}});for(k.sort(function(d,a){return c[d.start]-c[a.start]});0<k.length;){var e=k.pop(),f=this._client.GetEmote(e.id),g=d.substr(0,c[e.start]),h=d.substr(c[e.end]+1),i=this._emote("twitch",f,e);d=""+g+i+h,this._remap(c,e.start,e.end,i.length-1)}}return d}/* Format FFZ emotes */},{key:"_msgFFZEmotesTransform",value:function w(a,b,c){var d=b,e=this._client.GetFFZEmotes(a.channel);if(e&&e.emotes){var f=[],g=!0,h=!1,i=void 0;try{for(var j,l=Object.entries(e.emotes)[Symbol.iterator]();!(g=(j=l.next()).done);g=!0){var m=j.value,n=_slicedToArray(m,2),o=n[0],k=n[1];f.push([k,o])}}catch(a){h=!0,i=a}finally{try{!g&&l.return&&l.return()}finally{if(h)throw i}}var x=Twitch.ScanEmotes(a.message,f);for(x.sort(function(c,a){return c.start-a.start});0<x.length;){var p=x.pop(),q=p.id,r=q.urls[Object.keys(q.urls).min()],s={id:q.id,w:q.width,h:q.height,def:q},t=this._emote("ffz",r,s),u=d.substr(0,c[p.start]),v=d.substr(c[p.end+1]);d=""+u+t+v,this._remap(c,p.start,p.end+1,t.length)}}return d}/* Format BTTV emotes */},{key:"_msgBTTVEmotesTransform",value:function N(a,b,c){var d=b,e=this._client.GetGlobalBTTVEmotes(),f=this._client.GetBTTVEmotes(a.channel),g={},h=!0,i=!1,j=void 0;try{for(var l,m=Object.entries(e)[Symbol.iterator]();!(h=(l=m.next()).done);h=!0){var n=l.value,o=_slicedToArray(n,2),p=o[0],k=o[1];g[p]=k}/* Channel emotes override global emotes */}catch(a){i=!0,j=a}finally{try{!h&&m.return&&m.return()}finally{if(i)throw j}}var q=!0,r=!1,s=void 0;try{for(var t,u=Object.entries(f)[Symbol.iterator]();!(q=(t=u.next()).done);q=!0){var v=t.value,w=_slicedToArray(v,2),x=w[0],y=w[1];g[x]=y}}catch(a){r=!0,s=a}finally{try{!q&&u.return&&u.return()}finally{if(r)throw s}}var z=[],A=!0,B=!1,C=void 0;try{for(var D,E,F=Object.keys(g)[Symbol.iterator]();!(A=(D=F.next()).done);A=!0)E=D.value,z.push([E,RegExp.escape(E)])}catch(a){B=!0,C=a}finally{try{!A&&F.return&&F.return()}finally{if(B)throw C}}var G=Twitch.ScanEmotes(a.message,z);for(G.sort(function(c,a){return c.start-a.start});0<G.length;){var H=G.pop(),I=g[H.id],J={id:I.id,name:I.code,def:I},K=this._emote("bttv",I.url,J),L=d.substr(0,c[H.start]),M=d.substr(c[H.end+1]);d=""+L+K+M,this._remap(c,H.start,H.end+1,K.length)}return d}/* Format @user highlights */},{key:"_msgAtUserTransform",value:function p(a,b,c,d){for(var e=b,f=/(?:^|\b\s*)(@\w+)(?:\s*\b|$)/g,g=[],h=null;null!==(h=f.exec(a.message));){var i=h.index+h[0].indexOf(h[1]),j=i+h[1].length;g.push({part:h[1],start:i,end:j})}/* Ensure the locations array is indeed sorted */for(g.sort(function(c,a){return c.start-a.start});0<g.length;){var k=g.pop(),l=$("<em class=\"at-user\"></em>").text(k.part);k.part.substr(1).equalsLowerCase(this._client.GetName())&&(d.addClass("at-self"),l.addClass("at-self"));var m=e.substr(0,c[k.start]),n=l[0].outerHTML,o=e.substr(c[k.end]);e=m+n+o,this._remap(c,k.start,k.end,n.length)}return e}/* Format other highlight matches */},{key:"_msgHighlightTransform",value:function x(a,b,c,d){var e=b,f=!0,g=!1,h=void 0;try{for(var i,j=this._highlights[Symbol.iterator]();!(f=(i=j.next()).done);f=!0){var k=i.value,l=k,m=[],n=null;/* Ensure pattern has "g" flag */for(-1===k.flags.indexOf("g")&&(l=new RegExp(k,k.flags+"g"));null!==(n=l.exec(a.message));){d.hasClass("highlight")||d.addClass("highlight");var o=n[0],p=1<n.length?n[1]:n[0],q=n.index+o.indexOf(p),r=q+p.length;m.push({part:p,start:q,end:r})}/* Ensure the locations array is indeed sorted */for(m.sort(function(c,a){return c.start-a.start});0<m.length;){var s=m.pop(),t=$("<em class=\"highlight\"></em>").text(s.part),u=e.substr(0,c[s.start]),v=t[0].outerHTML,w=e.substr(c[s.end]);d.addClass("highlight"),e=u+v+w,this._remap(c,s.start,s.end,v.length)}}}catch(a){g=!0,h=a}finally{try{!f&&j.return&&j.return()}finally{if(g)throw h}}return e}/* Format URLs */},{key:"_msgURLTransform",value:function p(a,b,c,d){for(var e=b,f=[],g=null;null!==(g=Util.URL_REGEX.exec(a.message));){/* arr = [wholeMatch, matchPart] */var h=g.index+g[0].indexOf(g[1]),i=h+g[1].length;f.push({whole:g[0],part:g[1],start:h,end:i})}/* Ensure the locations array is indeed sorted */for(f.sort(function(c,a){return c.start-a.start});0<f.length;){var j=f.pop(),k=null;try{k=new URL(Util.URL(j.part))}catch(a){Util.Error("Invalid URL",j,a);continue}this._config.ShowClips&&"clips.twitch.tv"===k.hostname&&d.attr("data-clip",k.pathname.strip("/"));var l=Util.CreateNode(k),m=e.substr(0,c[j.start]),n=l.outerHTML,o=e.substr(c[j.end]);e=m+n+o,this._remap(c,j.start,j.end,n.length)}return e}/* Returns msginfo object */},{key:"_genMsgInfo",value:function _genMsgInfo(event){var $msg=$("<span class=\"message\" data-message=\"1\"></span>"),$effects=[],_Util$EscapeWithMap=Util.EscapeWithMap(event.message),_Util$EscapeWithMap2=_slicedToArray(_Util$EscapeWithMap,2),message=_Util$EscapeWithMap2[0],map=_Util$EscapeWithMap2[1];/* Escape the message, keeping track of how characters move *//* Prevent off-the-end mistakes *//* Handle early mod-only antics */if(map.push(message.length),this.enableAntics&&event.ismod){var t0=event.message.split(" ")[0];switch(t0.replace(/-/g,"")){case"force":case"!tfcforce":event.flags.force=!0,event.flags.force_kind="force";break;case"forceeval":case"!tfceval":case"!tfcforceeval":event.flags.force=!0,event.flags.force_kind="forceeval";break;case"forcejs":case"!tfcjs":case"!tfcforcejs":event.flags.force=!0,event.flags.force_kind="forcejs";break;case"forceevalonly":case"!tfcevalonly":case"!tfcforceevalonly":event.flags.force=!0,event.flags.force_kind="forceeval",event.flags.force_only=!0;break;case"forcejsonly":case"!tfcjsonly":case"!tfcforcejsonly":event.flags.force=!0,event.flags.force_kind="forcejs",event.flags.force_only=!0;break;case"forcebits":case"forcecheer":event.flags.force=!0,event.flags.force_kind="bits";break;default:event.flags.force=!1;}if("bits"===event.flags.force_kind){for(var wordlen=t0.length,msgprefix="cheer1000";msgprefix.length<t0.length;)msgprefix+=" ";/* Modify message and event.message, as they're both used below */event.values.message=msgprefix+event.message.substr(wordlen),message=msgprefix+message.substr(wordlen),event.flags.bits=1e3}}else/* Prevent unauthorized access */event.flags.force=!1;var logMessage=function(){};if(Util.DebugLevel===Util.LEVEL_TRACE){var idx=1;logMessage=function(){for(var a,b=arguments.length,c=Array(b),d=0;d<b;d++)c[d]=arguments[d];(a=Util).LogOnly.apply(a,[idx++,message].concat(c))}}/* Apply message transformations *//* Handle mod-only antics */if(logMessage(event),message=this._msgEmotesTransform(event,message,map,$msg,$effects),logMessage(),message=this._msgCheersTransform(event,message,map,$msg,$effects),logMessage(),message=this._msgFFZEmotesTransform(event,message,map,$msg,$effects),logMessage(),message=this._msgBTTVEmotesTransform(event,message,map,$msg,$effects),logMessage(),message=this._msgURLTransform(event,message,map,$msg,$effects),logMessage(),message=this._msgAtUserTransform(event,message,map,$msg,$effects),logMessage(),message=this._msgHighlightTransform(event,message,map,$msg,$effects),logMessage(),event.ismod&&this.enableAntics&&event.flags.force){/* NOTE: These will run twice for layout=double */var ts=event.message.split(" ").slice(1).join(" "),tagMatch=!0;if(!0===event.flags.force_only&&0<ts.length){tagMatch=!1;var tag=this.getValue("tag")||"",toks=ts.split(" "),t1=toks[0];ts=toks.slice(1).join(" "),t1===tag&&(tagMatch=!0),t1.startsWith("?")&&-1<tag.indexOf(t1.substr(1))&&(tagMatch=!0)}if(!tagMatch);else if("force"===event.flags.force_kind)/* force: use raw message with no formatting */message=ts;else if("forceeval"===event.flags.force_kind)/* forceeval: evaluate ts as a function */try{message=JSON.stringify(eval(ts))}catch(a){message=("Can't let you do that, "+event.user+": "+a).escape(),Util.ErrorOnly(a)}else"forcejs"===event.flags.force_kind&&(/* forcejs: use raw message wrapped in script tags */message="<script>"+ts+"</script>")}return $msg.html(message),{e:$msg,effects:$effects}}/* Add common attributes to the line wrapper element */},{key:"_addChatAttrs",value:function c(a,b){a.attr("data-id",b.flags.id),a.attr("data-user",b.user),a.attr("data-user-id",b.flags["user-id"]),a.attr("data-channel",b.channelString.replace(/^#/,"")),a.attr("data-channel-id",b.flags["room-id"]),a.attr("data-channel-full",Twitch.FormatChannel(b.channel)),b.channel.room&&a.attr("data-room",b.channel.room),b.channel.roomuid&&a.attr("data-roomuid",b.channel.roomuid),b.issub&&a.attr("data-subscriber","1"),b.ismod&&a.attr("data-mod","1"),b.isvip&&a.attr("data-vip","1"),b.iscaster&&a.attr("data-caster","1"),a.attr("data-sent-ts",b.flags["tmi-sent-ts"]),a.attr("data-recv-ts",Date.now())}/* Returns jquery node */},{key:"_genSubWrapper",value:function c(a){var b=$("<div class=\"chat-line sub notice\"></div>");return this._addChatAttrs(b,a),b.append(this._genBadges(a)),b.append(this._genName(a)),b.html(b.html()+"&nbsp;"),b}/* Returns jquery node */},{key:"gen",value:function t(a){var b=$("<div class=\"chat-line\"></div>"),c=a.flags.color||this.getColorFor(a.user);this._client.IsUIDSelf(a.flags["user-id"])&&b.addClass("self"),this._addChatAttrs(b,a),this._config.Layout.Slim||(a.flags.subscriber&&b.addClass("chat-sub"),a.flags.mod&&b.addClass("chat-mod"),a.flags.vip&&b.addClass("chat-vip"),a.flags.broadcaster&&b.addClass("chat-caster")),b.append(this._genBadges(a)),b.append(this._genName(a));var d=this._genMsgInfo(a);if(!a.flags.action)b.html(b.html()+":");else{var e=this.genBorderCSS(c),f=_slicedToArray(e,2),g=f[0],h=f[1];d.e.css("color",c),d.e.css(g,h)}b.html(b.html()+"&nbsp;");var i=[],j=[];if(0<d.effects.length){var k=!0,l=!1,m=void 0;try{for(var n,o,p=d.effects[Symbol.iterator]();!(k=(n=p.next()).done);k=!0)o=n.value,o.class&&d.e.addClass(o.class),o.style&&d.e.attr("style",o.style),o.wclass&&b.addClass(o.wclass),o.wstyle&&b.attr("style",o.wstyle),o.html_pre&&i.push(o.html_pre),o.html_post&&j.unshift(o.html_post)}catch(a){l=!0,m=a}finally{try{!k&&p.return&&p.return()}finally{if(l)throw m}}}var q=i.join(""),r=d.e[0].outerHTML,s=j.join("");return b.append(q+r+s),b}/* Returns jquery node */},{key:"sub",value:function e(a){var b=this._genSubWrapper(a),c=$("<span class=\"message sub-message\"></span>"),d=this.twitchEmote("PogChamp");return a.flags["system-msg"]?c.text(a.flags["system-msg"]):c.text(Strings.Sub(TwitchSubEvent.PlanName(""+a.plan_id))),c.addClass("effect-rainbow").addClass("effect-disco"),c.html(c.html()+d+"&nbsp;"),b.append(c),this._checkUndefined(a,b),b}/* Returns jquery node */},{key:"resub",value:function h(a){var b=this._genSubWrapper(a),c=$("<span class=\"message sub-message\"></span>"),d=this.twitchEmote("PogChamp"),e=a.months||a.total_months,f=a.streak_months,g=a.plan||TwitchSubEvent.PlanName(""+a.plan_id);return c.addClass("effect-rainbow").addClass("effect-disco"),a.flags["system-msg"]?c.text(a.flags["system-msg"]):a.share_streak?c.text(Strings.ResubStreak(e,g,f)):c.text(Strings.Resub(e,g)),c.html(c.html()+"&nbsp;"+d),b.append(c),this._checkUndefined(a,b),b}/* Returns jquery node */},{key:"giftsub",value:function h(a){var b=this._genSubWrapper(a),c=$("<span class=\"message sub-message\"></span>"),d=this.twitchEmote("HolidayPresent");if(c.addClass("effect-rainbow").addClass("effect-disco"),a.flags["system-msg"])c.text(a.flags["system-msg"]);else{var e=a.recipient,f=a.user,g=TwitchSubEvent.PlanName(""+a.plan_id);c.text(Strings.GiftSub(f,g,e))}return c.html(c.html()+d+"&nbsp;"),b.append(c),this._checkUndefined(a,b),b}/* Returns jquery node */},{key:"anongiftsub",value:function g(a){var b=this._genSubWrapper(a),c=$("<span class=\"message sub-message\"></span>"),d=this.twitchEmote("HolidayPresent");if(c.addClass("effect-rainbow").addClass("effect-disco"),a.flags["system-msg"])c.text(a.flags["system-msg"]);else{var e=a.recipient_name||a.recipient,f=TwitchSubEvent.PlanName(""+a.plan_id);c.text(Strings.AnonGiftSub(f,e))}return c.html(c.html()+d+"&nbsp;"),b.append(c),this._checkUndefined(a,b),b}/* Returns jquery node */},{key:"raid",value:function g(a){var b=$("<div class=\"chat-line raid\"></div>"),c=$("<span class=\"message raid-message\"></span>"),d=this.twitchEmote("TombRaid");if(c.addClass("effect-rainbow").addClass("effect-disco"),a.flags["system-msg"])c.text(a.flags["system-msg"]);else{/* Unlikely */var e=a.flags["msg-param-displayName"]||a.flags["msg-param-login"],f=a.flags["msg-param-viewerCount"];c.html(Strings.Raid(e,f))}return b.append(c),b.html(d+"&nbsp;"+b.html()),this._checkUndefined(a,b),b}/* Returns jquery node */},{key:"newUser",value:function d(a){var b=$("<div class=\"chat-line new-user notice\"></div>"),c=$("<span class=\"message\" data-message=\"1\"></span>");return this._addChatAttrs(b,a),b.append(this._genBadges(a)),b.append(this._genName(a)),c.text(a.flags["system-msg"]+" Say hello!"),b.html(b.html()+":&nbsp;"),b.append(c),b}/* Returns jquery node */},{key:"rewardGift",value:function d(a){var b=$("<div class=\"chat-line rewardgift notice\"></div>"),c=$("<span class=\"message\" data-message=\"1\"></span>");return this._addChatAttrs(b,a),b.append(this._genBadges(a)),b.append(this._genName(a)),c.text(a.message),b.html(b.html()+":&nbsp;"),b.append(c),b}/* Returns jquery node */},{key:"mysteryGift",value:function c(a){/* TODO */var b=a.command+" TODO";return $("<div class=\"message\">"+b+"</div>")}/* Returns jquery node */},{key:"giftUpgrade",value:function c(a){/* TODO *//* Called for giftupgrade, primeupgrade, anongiftupgrade */var b=a.command+" TODO";return $("<div class=\"message\">"+b+"</div>")}/* Returns jquery node */},{key:"genClip",value:function k(a,b,c){/* TODO */var d=$("<div class=\"clip-preview\"></div>"),e=b.broadcaster_name,f=$("<img class=\"clip-thumbnail\" height=\"100px\"/>"),g=$("<span class=\"clip-text\"></span>"),h=$("<div class=\"clip-title\"></div>"),i=$("<div class=\"clip-desc\"></div>"),j=$("<div class=\"clip-creator\"></div>");return d.attr("data-slug",a),d.append(f.attr("src",b.thumbnail_url)),g.append(h.text(b.title)),g.append(i.text(e+" playing "+c.name)),g.append(j.text("Clipped by "+b.creator_name)),d.append(g),d}/* General-use functions below *//* Returns jquery node */},{key:"url",value:function m(){var a=0<arguments.length&&void 0!==arguments[0]?arguments[0]:null,b=1<arguments.length&&void 0!==arguments[1]?arguments[1]:null,d=2<arguments.length&&void 0!==arguments[2]?arguments[2]:null,e=3<arguments.length&&void 0!==arguments[3]?arguments[3]:null,f=$("<a></a>");if(a?f.attr("href",a):f.attr("href","javascript:void(0)"),b?f.text(b):a?f.text(a):f.val("undefined"),Util.IsArray(d)){var g=!0,h=!1,i=void 0;try{for(var j,k,l=d[Symbol.iterator]();!(g=(j=l.next()).done);g=!0)k=j.value,f.addClass(k)}catch(a){h=!0,i=a}finally{try{!g&&l.return&&l.return()}finally{if(h)throw i}}}else d&&f.addClass(d);return e&&f.attr("id",e),f}/* Returns string */},{key:"checkbox",value:function m(a){var b=1<arguments.length&&void 0!==arguments[1]?arguments[1]:null,d=2<arguments.length&&void 0!==arguments[2]?arguments[2]:null,e=!!(3<arguments.length&&void 0!==arguments[3])&&arguments[3],f=$("<input type=\"checkbox\" />");if(f.attr("value",a),b&&f.attr("id",b),Util.IsArray(d)){var g=!0,h=!1,i=void 0;try{for(var j,k,l=d[Symbol.iterator]();!(g=(j=l.next()).done);g=!0)k=j.value,f.addClass(k)}catch(a){h=!0,i=a}finally{try{!g&&l.return&&l.return()}finally{if(h)throw i}}}else f.addClass(d);return e&&f.check(),f[0].outerHTML}},{key:"enableAntics",get:function a(){return this.getValue("EnableForce")&&$("#cbForce").is(":checked")}/* Enable or disable mod antics */,set:function b(a){a?(this.setValue("EnableForce",!0),$("#cbForce").check()):(this.setValue("EnableForce",!1),$("#cbForce").uncheck())}},{key:"highlightMatches",get:function a(){return this._highlights}/* Overwrite highlight match patterns */,set:function b(a){this._highlights=a}}]),HTMLGenerator}();/* globals Strings GetCheerStyle *//* vim: set ts=2 sts=2 sw=2 et: */