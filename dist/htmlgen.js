/* HTML Generator for the Twitch Filtered Chat */"use strict";/* TODO:
 * Add more badge information on hover
 * Add emote information on hover
 * Add clip information
 * Implement "new user" ritual
 * Implement "light" and "dark" colorschemes
 *//* exported HTMLGenerator */var _slicedToArray=function(){function a(a,b){var c=[],d=!0,e=!1,f=void 0;try{for(var g,h=a[Symbol.iterator]();!(d=(g=h.next()).done)&&(c.push(g.value),!(b&&c.length===b));d=!0);}catch(a){e=!0,f=a}finally{try{!d&&h["return"]&&h["return"]()}finally{if(e)throw f}}return c}return function(b,c){if(Array.isArray(b))return b;if(Symbol.iterator in Object(b))return a(b,c);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(a){return typeof a}:function(a){return a&&"function"==typeof Symbol&&a.constructor===Symbol&&a!==Symbol.prototype?"symbol":typeof a},_createClass=function(){function a(a,b){for(var c,d=0;d<b.length;d++)c=b[d],c.enumerable=c.enumerable||!1,c.configurable=!0,"value"in c&&(c.writable=!0),Object.defineProperty(a,c.key,c)}return function(b,c,d){return c&&a(b.prototype,c),d&&a(b,d),b}}();function _classCallCheck(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}var HTMLGenerator=function(){function a(b){var c=1<arguments.length&&void 0!==arguments[1]?arguments[1]:null;_classCallCheck(this,a),this._client=b,this._config=c||{},this._default_colors=["lightseagreen","forestgreen","goldenrod","dodgerblue","darkorchid","crimson"],this._user_colors={},this._bg_colors=["#1d1d1d","#0a0a0a","#d1d1d1"],this._config.Layout||(this._config.Layout={}),this._config.ShowClips||(this._config.ShowClips=!1)}return _createClass(a,[{key:"setValue",value:function c(a,b){this._config[a]=b}},{key:"getValue",value:function b(a){return this._config[a]}},{key:"getColorFor",value:function e(a){var b=""+a;if("string"!=typeof a){var f=("undefined"==typeof a?"undefined":_typeof(a))+", "+JSON.stringify(a);Util.Error("Expected string, got "+f)}if(!this._user_colors.hasOwnProperty(b)){for(var c=0,d=0;d<b.length;++d)c=(c<<5)-c+b.charCodeAt(d);/* Taken from Twitch vendor javascript */c%=this._default_colors.length,0>c&&(c+=this._default_colors.length),this._user_colors[b]=this._default_colors[c]}return this._user_colors[b]}},{key:"genBorderCSS",value:function c(a){var b=Util.GetMaxContrast(a,this._bg_colors);return["text-shadow","-0.8px -0.8px 0 "+b+", 0.8px -0.8px 0 "+b+",\n       -0.8px  0.8px 0 "+b+", 0.8px  0.8px 0 "+b]}},{key:"genName",value:function h(a,b){var c=$("<span class=\"username\"></span>");c.css("color",b||this.getColorFor(a)||"#ffffff");/* Determine the best border color to use */var d=this.genBorderCSS(c.css("color")),e=_slicedToArray(d,2),f=e[0],g=e[1];return c.css(f,g),c.attr("data-username","1"),c.text(a),c}},{key:"twitchEmote",value:function b(a){return this._emote("twitch",this._client.GetEmote(a),{id:a})}},{key:"_checkUndefined",value:function c(a,b){-1<b[0].outerHTML.indexOf("undefined")&&(Util.Error("msg contains undefined"),Util.ErrorOnly(a,b,b[0].outerHTML))}},{key:"_emote",value:function g(a,b){var c=2<arguments.length&&void 0!==arguments[2]?arguments[2]:null,d=a.replace(/[^a-z0-9_]/g,"")+"-emote",e=$("<span class=\"emote-wrapper "+d+"\"></span>"),f=$("<img class=\"emote "+d+"\" />");return f.attr("src",b),f.attr("data-emote-src",a),c&&(c.id&&(f.attr("data-emote-id",c.id),f.attr("alt",c.name),f.attr("title",c.name),e.attr("data-emote-name",c.id)),c.name&&(f.attr("data-emote-name",c.name),f.attr("alt",c.name),f.attr("title",c.name),e.attr("data-emote-name",c.name)),(c.w||c.width)&&f.attr("width",c.w||c.width),(c.h||c.height)&&f.attr("height",c.h||c.height),c.def&&f.attr("data-emote-def",JSON.stringify(c.def))),e.append(f),e[0].outerHTML}},{key:"_genCheer",value:function h(a,b){/* Use the highest tier image that doesn't exceed the cheered bits */var c=a.tiers.filter(function(a){return b>=a.min_bits}),d=c.max(function(a){return a.min_bits}),e=d.images.dark.animated[a.scales.min(function(a){return+a})],f=$("<img class=\"cheer-image\" />"),g=$("<span class=\"cheer cheermote\"></span>");/* Use the smallest scale available */return f.attr("alt",a.prefix).attr("title",a.prefix),f.attr("src",e),g.css("color",d.color),g.append(f),g.append(b),g[0].outerHTML}},{key:"_wrapBadge",value:function n(a){var b=$("<span class=\"badge\"></span>"),c=!0,d=!1,e=void 0;/* Copy all data attributes from elem to $s */try{for(var f,g,h=a.get()[0].getAttributeNames()[Symbol.iterator]();!(c=(f=h.next()).done);c=!0)g=f.value,g.match(/^data-/)&&b.attr(g,a.attr(g))}catch(a){d=!0,e=a}finally{try{!c&&h.return&&h.return()}finally{if(d)throw e}}var i=function(b){return a.attr("data-"+b)},j=[],k=i("badge");if(0<k.length){var o=JSON.parse(k);o.image_url_4x?b.attr("data-icon-large-src",o.image_url_4x):o.image_url_2x&&b.attr("data-icon-large-src",o.image_url_2x)}var l=i("badge-name")+" ("+i("badge-num")+")";l=l.replace(/^[a-z]/,function(a){return a.toUpperCase()}),j.push(l);var m=i("badge-scope");return"global"===m?j.push("Global"):"channel"===m?(j.push("Channel Badge"),j.push("#"+i("badge-channel"))):"ffz"===m?j.push("FFZ"):"bttv"===m&&j.push("BTTV"),b.attr("data-text",j.map(function(a){return a.replace(/ /g,"\xA0")}).join("\n")),b.append(a)}},{key:"_genBadges",value:function x(a){var b=$("<span class=\"badges\" data-badges=\"1\"></span>");b.addClass("badges");var c=0;/* Add Twitch-native badges */if(a.flags.badges&&(c+=18*a.flags.badges.length),a.flags["ffz-badges"]&&(c+=18*a.flags["ffz-badges"].length),a.flags["bttv-badges"]&&(c+=18*a.flags["bttv-badges"].length),b.css("overflow","hidden"),b.css("width",c+"px"),b.css("max-width",c+"px"),a.flags.badges){var d=!0,e=!1,f=void 0;try{for(var g,h=a.flags.badges[Symbol.iterator]();!(d=(g=h.next()).done);d=!0){var i=g.value,j=_slicedToArray(i,2),k=j[0],l=j[1],m=$("<img class=\"badge\" width=\"18px\" height=\"18px\" />");if(m.addClass("twitch-badge"),m.attr("data-badge-name",k),m.attr("data-badge-num",l),m.attr("data-badge-cause",JSON.stringify([k,l])),m.attr("data-badge","1"),m.attr("title",k+"/"+l),m.attr("alt",k+"/"+l),this._client.IsChannelBadge(a.channel,k)){var n=this._client.GetChannelBadge(a.channel,k),o=n.alpha||n.image,p=a.channel.channel.replace(/^#/,"");m.attr("src",o),m.attr("data-badge",JSON.stringify(n)),m.attr("data-badge-scope","channel"),m.attr("data-badge-channel",p)}else if(this._client.IsGlobalBadge(k,l)){var y=this._client.GetGlobalBadge(k,l);m.attr("src",y.image_url_1x),m.attr("data-badge-scope","global"),m.attr("data-badge",JSON.stringify(y))}else{Util.Warn("Unknown badge",k,l,"for",a);continue}b.append(this._wrapBadge(m))}}catch(a){e=!0,f=a}finally{try{!d&&h.return&&h.return()}finally{if(e)throw f}}}/* Add FFZ badges */if(a.flags["ffz-badges"]){var q=!0,r=!1,s=void 0;try{for(var t,u=Object.values(a.flags["ffz-badges"])[Symbol.iterator]();!(q=(t=u.next()).done);q=!0){var v=t.value,w=$("<img class=\"badge\" width=\"18px\" height=\"18px\" />");w.addClass("ffz-badge"),w.attr("data-badge","1"),w.attr("data-ffz-badge","1"),w.attr("data-badge-scope","ffz"),w.attr("src",Util.URL(v.image)),w.attr("alt",v.name),w.attr("title",v.title),b.append(this._wrapBadge(w))}}catch(a){r=!0,s=a}finally{try{!q&&u.return&&u.return()}finally{if(r)throw s}}}/* For if BTTV ever adds badges
    if (event.flags["bttv-badges"]) {
      for (let badge of Object.values(event.flags["bttv-badges"])) {
        let $b = $(`<img class="badge" width="18px" height="18px" />`);
        $b.addClass("bttv-badge");
        $b.attr("data-badge", "1");
        $b.attr("data-ffz-badge", "1");
        $b.attr("data-badge-scope", "bttv");
        $b.attr("src", Util.URL(badge.image));
        $b.attr("alt", "Unknown BTTV Badge");
        $b.attr("title", "Unknown BTTV Badge");
        $bc.append(this._wrapBadge($b));
      }
    } */return b}},{key:"_genName",value:function d(a){/* Display upper-case name, assign color to lower-case name */var b=a.name||a.user,c=a.flags.color||this.getColorFor(a.user);return c||(c="#ffffff"),this.genName(b,c)}},{key:"_remap",value:function h(a,b,c,d){for(var e=a[b],f=a[c],g=b;g<c;++g)/* Set values within the range to the end */a[g]=f+d;/* IDEA BEHIND MAP ADJUSTMENT:
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
     */for(var i=c;i<a.length;++i)/* Adjust values beyond the range by length */a[i]+=d-(f-e)}},{key:"_msgCheersTransform",value:function n(a,b,c,d,e){if(a.flags.bits&&0<a.flags.bits){var f=a.flags.bits,g=this._client.FindCheers(a.channel,a.message);/* Sort the cheer matches from right-to-left */for(g.sort(function(c,a){return c.start-a.start});0<g.length;){var h=g.pop(),i=[c[h.start],c[h.end]],j=i[0],k=i[1],l=this._genCheer(h.cheer,h.bits),m=j+l.length;/* Insert the cheer HTML and adjust the map */for(b=b.substr(0,j)+l+b.substr(k),this._remap(c,h.start,h.end,l.length),j=k=m;m<b.length;){var o="";if(b[m].match(/\s/))m+=1;else{k=b.substr(m).search(/\s/),k=-1===k?b.length:m+k,o=b.substring(m,k);var p=GetCheerStyle(o.toLowerCase());if(p&&!p._disabled&&f>=p.cost)e.push(p),f-=p.cost;else{k=m;break}m=k}}j!==k&&(b=b.substr(0,j)+" "+b.substr(k),this._remap(c,j,k,0))}}return b}},{key:"_msgEmotesTransform",value:function i(a,b,c){if(a.flags.emotes){var j=a.flags.emotes.map(function(a){return{id:a.id,name:a.name,start:a.start,end:a.end,def:a}});for(j.sort(function(d,a){return c[d.start]-c[a.start]});0<j.length;){var d=j.pop(),e=this._client.GetEmote(d.id),f=b.substr(0,c[d.start]),g=b.substr(c[d.end]+1),h=this._emote("twitch",e,d);b=""+f+h+g,this._remap(c,d.start,d.end,h.length-1)}}return b}},{key:"_msgFFZEmotesTransform",value:function v(a,b,c){var d=this._client.GetFFZEmotes(a.channel);if(d&&d.emotes){var e=[],f=!0,g=!1,h=void 0;try{for(var i,j=Object.entries(d.emotes)[Symbol.iterator]();!(f=(i=j.next()).done);f=!0){var l=i.value,m=_slicedToArray(l,2),n=m[0],k=m[1];e.push([k,n])}}catch(a){g=!0,h=a}finally{try{!f&&j.return&&j.return()}finally{if(g)throw h}}var w=Twitch.ScanEmotes(a.message,e);for(w.sort(function(c,a){return c.start-a.start});0<w.length;){var o=w.pop(),p=o.id,q=p.urls[Object.keys(p.urls).min()],r={id:p.id,w:p.width,h:p.height,def:p},s=this._emote("ffz",q,r),t=b.substr(0,c[o.start]),u=b.substr(c[o.end+1]);b=""+t+s+u,this._remap(c,o.start,o.end+1,s.length)}}return b}},{key:"_msgBTTVEmotesTransform",value:function M(a,b,c){var d=this._client.GetGlobalBTTVEmotes(),e=this._client.GetBTTVEmotes(a.channel),f={},g=!0,h=!1,i=void 0;try{for(var j,l=Object.entries(d)[Symbol.iterator]();!(g=(j=l.next()).done);g=!0){var m=j.value,n=_slicedToArray(m,2),o=n[0],k=n[1];f[o]=k}/* Channel emotes override global emotes */}catch(a){h=!0,i=a}finally{try{!g&&l.return&&l.return()}finally{if(h)throw i}}var p=!0,q=!1,r=void 0;try{for(var s,t=Object.entries(e)[Symbol.iterator]();!(p=(s=t.next()).done);p=!0){var u=s.value,v=_slicedToArray(u,2),w=v[0],x=v[1];f[w]=x}}catch(a){q=!0,r=a}finally{try{!p&&t.return&&t.return()}finally{if(q)throw r}}var y=[],z=!0,A=!1,B=void 0;try{for(var C,D,E=Object.keys(f)[Symbol.iterator]();!(z=(C=E.next()).done);z=!0)D=C.value,y.push([D,RegExp.escape(D)])}catch(a){A=!0,B=a}finally{try{!z&&E.return&&E.return()}finally{if(A)throw B}}var F=Twitch.ScanEmotes(a.message,y);for(F.sort(function(c,a){return c.start-a.start});0<F.length;){var G=F.pop(),H=f[G.id],I={id:H.id,name:H.code,def:H},J=this._emote("bttv",H.url,I),K=b.substr(0,c[G.start]),L=b.substr(c[G.end+1]);b=""+K+J+L,this._remap(c,G.start,G.end+1,J.length)}return b}},{key:"_msgAtUserTransform",value:function n(a,b,c){for(var d=/(?:^|\b\s*)(@\w+)(?:\s*\b|$)/g,e=[],f=null;null!==(f=d.exec(a.message));){var g=f.index+f[0].indexOf(f[1]),h=g+f[1].length;e.push({part:f[1],start:g,end:h})}/* Ensure the locations array is indeed sorted */for(e.sort(function(c,a){return c.start-a.start});0<e.length;){var i=e.pop(),j=$("<em class=\"at-user\"></em>").text(i.part);i.part.substr(1).equalsLowerCase(this._client.GetName())&&j.addClass("at-self");var k=b.substr(0,c[i.start]),l=j[0].outerHTML,m=b.substr(c[i.end]);b=k+l+m,this._remap(c,i.start,i.end,l.length)}return b}},{key:"_msgURLTransform",value:function o(a,b,c,d){for(var e=[],f=null;null!==(f=Util.URL_REGEX.exec(a.message));){/* arr = [wholeMatch, matchPart] */var g=f.index+f[0].indexOf(f[1]),h=g+f[1].length;e.push({whole:f[0],part:f[1],start:g,end:h})}/* Ensure the locations array is indeed sorted */for(e.sort(function(c,a){return c.start-a.start});0<e.length;){var i=e.pop(),j=null;try{j=new URL(Util.URL(i.part))}catch(a){Util.Error("Invalid URL",i,a);continue}this._config.ShowClips&&"clips.twitch.tv"===j.hostname&&d.attr("data-clip",j.pathname.strip("/"));var k=Util.CreateNode(j),l=b.substr(0,c[i.start]),m=k.outerHTML,n=b.substr(c[i.end]);b=l+m+n,this._remap(c,i.start,i.end,m.length)}return b}},{key:"_genMsgInfo",value:function k(a){var b=$("<span class=\"message\" data-message=\"1\"></span>"),c=[],d=Util.EscapeWithMap(a.message),e=_slicedToArray(d,2),f=e[0],g=e[1];/* Escape the message, keeping track of how characters move *//* Prevent off-the-end mistakes *//* Handle early mod-only antics */if(g.push(f.length),!$("#cbForce").is(":checked")&&a.ismod){var l=a.message.split(" ")[0];if("force"===l)a.flags.force=!0;else if("forcejs"===l)a.flags.force=!0;else if("forcebits"===l||"forcecheer"===l){for(var h=l.length,i="cheer1000";i.length<l.length;)i+=" ";/* Modify message and event.message, as they're both used below */a.values.message=i+a.message.substr(h),f=i+f.substr(h),a.flags.bits=1e3,a.flags.force=!0}}var j=function(){};/* Un-comment to log transformations in detail
    let idx = 1;
    logMessage = (...args) => { Util.LogOnly(idx, message, ...args); idx += 1; }
     *//* Apply message transformations */return j(a),f=this._msgEmotesTransform(a,f,g,b,c),j(),f=this._msgCheersTransform(a,f,g,b,c),j(),f=this._msgFFZEmotesTransform(a,f,g,b,c),j(),f=this._msgBTTVEmotesTransform(a,f,g,b,c),j(),f=this._msgURLTransform(a,f,g,b,c),j(),f=this._msgAtUserTransform(a,f,g,b,c),j(),a.ismod&&!$("#cbForce").is(":checked")&&a.flags.force&&(a.message.startsWith("force ")?f=a.message.substr(6):a.message.startsWith("forcejs ")&&(f="<script>"+a.message.substr(8)+"</script>")),b.html(f),{e:b,effects:c}}},{key:"_addChatAttrs",value:function c(a,b){a.attr("data-id",b.flags.id),a.attr("data-user",b.user),a.attr("data-user-id",b.flags["user-id"]),a.attr("data-channel",b.channel.channel.replace(/^#/,"")),b.channel.room&&a.attr("data-room",b.channel.room),b.channel.roomuid&&a.attr("data-roomuid",b.channel.roomuid),a.attr("data-channel-id",b.flags["room-id"]),b.issub&&a.attr("data-subscriber","1"),b.ismod&&a.attr("data-mod","1"),b.isvip&&a.attr("data-vip","1"),b.iscaster&&a.attr("data-caster","1"),a.attr("data-sent-ts",b.flags["tmi-sent-ts"]),a.attr("data-recv-ts",Date.now())}},{key:"_genSubWrapper",value:function c(a){var b=$("<div></div>");return this._addChatAttrs(b,a),b.addClass("chat-line").addClass("sub").addClass("notice"),b.append(this._genBadges(a)),b.append(this._genName(a)),b.html(b.html()+"&nbsp;"),b}},{key:"gen",value:function t(a){var b=$("<div class=\"chat-line\"></div>"),c=a.flags.color||this.getColorFor(a.user);this._client.IsUIDSelf(a.flags["user-id"])&&b.addClass("self"),this._addChatAttrs(b,a),this._config.Layout.Slim||(a.flags.subscriber&&b.addClass("chat-sub"),a.flags.mod&&b.addClass("chat-mod"),a.flags.vip&&b.addClass("chat-vip"),a.flags.broadcaster&&b.addClass("chat-caster")),b.append(this._genBadges(a)),b.append(this._genName(a));var d=this._genMsgInfo(a);if(!a.flags.action)b.html(b.html()+":");else{var e=this.genBorderCSS(c),f=_slicedToArray(e,2),g=f[0],h=f[1];d.e.css("color",c),d.e.css(g,h)}b.html(b.html()+"&nbsp;");var i=[],j=[];if(0<d.effects.length){var k=!0,l=!1,m=void 0;try{for(var n,o,p=d.effects[Symbol.iterator]();!(k=(n=p.next()).done);k=!0)o=n.value,o.class&&d.e.addClass(o.class),o.style&&d.e.attr("style",o.style),o.wclass&&b.addClass(o.wclass),o.wstyle&&b.attr("style",o.wstyle),o.html_pre&&i.push(o.html_pre),o.html_post&&j.unshift(o.html_post)}catch(a){l=!0,m=a}finally{try{!k&&p.return&&p.return()}finally{if(l)throw m}}}var q=i.join(""),r=d.e[0].outerHTML,s=j.join("");return b.append(q+r+s),b}},{key:"sub",value:function e(a){var b=this._genSubWrapper(a),c=$("<span class=\"message sub-message\"></span>"),d=this.twitchEmote("PogChamp");return a.flags["system-msg"]?c.text(a.flags["system-msg"]):c.text(Strings.Sub(TwitchSubEvent.PlanName(""+a.plan_id))),c.addClass("effect-rainbow").addClass("effect-disco"),c.html(c.html()+d+"&nbsp;"),b.append(c),this._checkUndefined(a,b),b[0]}},{key:"resub",value:function h(a){var b=this._genSubWrapper(a),c=$("<span class=\"message sub-message\"></span>"),d=this.twitchEmote("PogChamp"),e=a.months||a.total_months,f=a.streak_months,g=a.plan||TwitchSubEvent.PlanName(""+a.plan_id);return a.flags["system-msg"]?c.text(a.flags["system-msg"]):a.share_streak?c.text(Strings.ResubStreak(e,g,f)):c.text(Strings.Resub(e,g)),c.addClass("effect-rainbow").addClass("effect-disco"),c.html(c.html()+"&nbsp;"+d),b.append(c),this._checkUndefined(a,b),b}},{key:"giftsub",value:function e(a){var b=this._genSubWrapper(a),c=$("<span class=\"message sub-message\"></span>");if(a.flags["system-msg"])c.text(a.flags["system-msg"]);else{var d=a.recipient,f=a.user,g=TwitchSubEvent.PlanName(""+a.plan_id);c.text(Strings.GiftSub(f,g,d))}var h=this.twitchEmote("HolidayPresent");return c.addClass("effect-rainbow").addClass("effect-disco"),c.html(c.html()+h+"&nbsp;"),b.append(c),this._checkUndefined(a,b),b}},{key:"anongiftsub",value:function e(a){var b=this._genSubWrapper(a),c=$("<span class=\"message sub-message\"></span>");if(a.flags["system-msg"])c.text(a.flags["system-msg"]);else{var d=a.recipient_name||a.recipient,f=TwitchSubEvent.PlanName(""+a.plan_id);c.text(Strings.AnonGiftSub(f,d))}var g=this.twitchEmote("HolidayPresent");return c.addClass("effect-rainbow").addClass("effect-disco"),c.html(c.html()+g+"&nbsp;"),b.append(c),this._checkUndefined(a,b),b}},{key:"raid",value:function e(a){var b=$("<div class=\"chat-line raid\"></div>"),c=$("<span class=\"message raid-message\"></span>");if(a.flags["system-msg"])c.text(a.flags["system-msg"]);else{/* Unlikely */var d=a.flags["msg-param-displayName"]||a.flags["msg-param-login"],f=a.flags["msg-param-viewerCount"];c.html(Strings.Raid(d,f))}var g=this.twitchEmote("TombRaid");return c.addClass("effect-rainbow").addClass("effect-disco"),b.append(c),b.html(g+"&nbsp;"+b.html()),this._checkUndefined(a,b),b}},{key:"newUser",value:function a(){/* TODO *//* Strings.NewUser(event.user) */}},{key:"genClip",value:function n(a,b,c){Util.Debug("genClip",a,b,c);var d=$("<div class=\"clip-preview\"></div>"),e=b.broadcaster_name,f=c.name,g=b.creator_name,h=b.title,i=b.thumbnail_url,j=$("<img class=\"clip-thumbnail\" height=\"48px\"/>"),k=$("<div class=\"clip-title\"></div>"),l=$("<div class=\"clip-desc\"></div>"),m=$("<div class=\"clip-creator\"></div>");return d.attr("data-slug",a),d.append(j.attr("src",i)),d.append(k.text(h)),d.append(l.text(e+" playing "+f)),d.append(m.text("Clipped by "+g)),d}/* General-use functions below */},{key:"url",value:function m(){var a=0<arguments.length&&void 0!==arguments[0]?arguments[0]:null,b=1<arguments.length&&void 0!==arguments[1]?arguments[1]:null,d=2<arguments.length&&void 0!==arguments[2]?arguments[2]:null,e=3<arguments.length&&void 0!==arguments[3]?arguments[3]:null,f=$("<a></a>");if(null===a?f.attr("href","javascript:void(0)"):f.attr("href",a),null===b?null===a?f.val("undefined"):f.text(a):f.text(b),null!==d)if("string"==typeof d)f.addClass(d);else{var g=!0,h=!1,i=void 0;try{for(var j,k,l=d[Symbol.iterator]();!(g=(j=l.next()).done);g=!0)k=j.value,f.addClass(k)}catch(a){h=!0,i=a}finally{try{!g&&l.return&&l.return()}finally{if(h)throw i}}}return null!==e&&f.attr("id",e),f}},{key:"checkbox",value:function m(a){var b=1<arguments.length&&void 0!==arguments[1]?arguments[1]:null,d=2<arguments.length&&void 0!==arguments[2]?arguments[2]:null,e=!!(3<arguments.length&&void 0!==arguments[3])&&arguments[3],f=$("<input type=\"checkbox\" />");if(f.attr("value",a),null!==b&&f.attr("id",b),"string"==typeof d)f.addClass(d);else{var g=!0,h=!1,i=void 0;try{for(var j,k,l=d[Symbol.iterator]();!(g=(j=l.next()).done);g=!0)k=j.value,f.addClass(k)}catch(a){h=!0,i=a}finally{try{!g&&l.return&&l.return()}finally{if(h)throw i}}}return null!==e&&f.attr("checked","checked"),f[0].outerHTML}}]),a}();/* vim: set ts=2 sts=2 sw=2 et: */