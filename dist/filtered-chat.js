/* Twitch Filtered Chat Main Module */"use strict";/* FIXME:
 * Subscribe messages aren't shown with subscribe alerts
 *//* TODO:
 * Add to #settings help link
 * Add to #settings config link
 * Finish badge information on hover
 * Add clip information on hover
 * Add emote information on hover
 * Add layout selection box to #settings (reloads page on change)
 * Hide getConfigObject() within client_main()
 * Fix cssmarquee: .line::-webkit-scrollbar { display: none; } or something
 *//* IDEAS:
 * Allow for a configurable number of columns?
 * Add re-include (post-exclude) filtering options?
 *//* NOTES:
 * Filtering ws "recv>" messages (to console):
 *   Util.Logger.add_filter(((m) => !`${m}`.startsWith("recv> ")), "DEBUG")
 * Filtering ws PRIVMSG messages (to console):
 *   Util.Logger.add_filter(((m) => `${m}`.indexOf(" PRIVMSG ") === -1, "DEBUG")
 */var _slicedToArray=function(){function a(a,b){var c=[],d=!0,e=!1,f=void 0;try{for(var g,h=a[Symbol.iterator]();!(d=(g=h.next()).done)&&(c.push(g.value),!(b&&c.length===b));d=!0);}catch(a){e=!0,f=a}finally{try{!d&&h["return"]&&h["return"]()}finally{if(e)throw f}}return c}return function(b,c){if(Array.isArray(b))return b;if(Symbol.iterator in Object(b))return a(b,c);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(a){return typeof a}:function(a){return a&&"function"==typeof Symbol&&a.constructor===Symbol&&a!==Symbol.prototype?"symbol":typeof a},_createClass=function(){function a(a,b){for(var c,d=0;d<b.length;d++)c=b[d],c.enumerable=c.enumerable||!1,c.configurable=!0,"value"in c&&(c.writable=!0),Object.defineProperty(a,c.key,c)}return function(b,c,d){return c&&a(b.prototype,c),d&&a(b,d),b}}();function _classCallCheck(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}var CACHED_VALUE="Cached",AUTOGEN_VALUE="Auto-Generated",CFGKEY_DEFAULT="tfc-config",Content=function(){function a(){_classCallCheck(this,a)}return _createClass(a,null,[{key:"addHTML",/* exported Content */value:function f(a){var b=Math.pow,c=1<arguments.length&&void 0!==arguments[1]?arguments[1]:null,d=$("<div class=\"line line-wrapper\"></div>"),e=c?$(c):$(".module").find(".content");d.append(a),e.append(d),e.scrollTop(b(2,31)-1)}},{key:"addPre",value:function c(b){a.addHTML($("<div class=\"pre\"></div>").html(b))}},{key:"addInfo",value:function e(b){var c=!!(1<arguments.length&&void 0!==arguments[1])&&arguments[1],d=$("<div class=\"info\"></div>").html(b);c&&d.addClass("pre"),a.addHTML(d)}},{key:"addNotice",value:function e(b){var c=!!(1<arguments.length&&void 0!==arguments[1])&&arguments[1],d=$("<div class=\"notice\"></div>").html(b);c&&d.addClass("pre"),a.addHTML(d)}},{key:"addError",value:function e(b){var c=!!(1<arguments.length&&void 0!==arguments[1])&&arguments[1],d=$("<div class=\"error\"></div>").html(b);c&&d.addClass("pre"),a.addHTML(d)}},{key:"addHelp",value:function c(b){a.addPre($("<div class=\"help pre\">"+b+"</div>"))}},{key:"addHelpLine",value:function d(b,c){a.addPre(ChatCommands.helpLine(b,c))}}]),a}();/* Document writing functions {{{0 *//* End document writing functions 0}}} *//* Begin configuration section {{{0 *//* Merge the query string into the config object given and return removals */function parseQueryString(a){var b=1<arguments.length&&void 0!==arguments[1]?arguments[1]:null,c=void 0;null===b?(b=window.location.search,c=Util.ParseQueryString(b)):"string"==typeof b?c=Util.ParseQueryString(b):"object"===("undefined"==typeof b?"undefined":_typeof(b))&&(c=b),void 0===c.debug&&(c.debug=!1),void 0!==c.channels&&"string"!=typeof c.channels&&(c.channels="");var d=[],f=!0,g=!1,h=void 0;try{for(var i,j=Object.entries(c)[Symbol.iterator]();!(f=(i=j.next()).done);f=!0){var l=i.value,m=_slicedToArray(l,2),n=m[0],k=m[1],o=n,p=k;/* config key *//* config val */if("clientid"===n)o="ClientID",a.__clientid_override=!0,d.push(n);else if("user"===n||"name"===n||"nick"===n)o="Name";else if("pass"===n)o="Pass",d.push(n);else if("channel"===n||"channels"===n)o="Channels",p=k.split(",").map(function(a){return Twitch.FormatChannel(a)});else if("debug"===n)o="Debug",p="debug"===k?Util.LEVEL_DEBUG:"trace"===k?Util.LEVEL_TRACE:"number"==typeof k?k:+!!k,p<Util.LEVEL_MIN&&(p=Util.LEVEL_MIN),p>Util.LEVEL_MAX&&(p=Util.LEVEL_MAX);else if("noassets"===n)o="NoAssets",p=!!k;else if("noffz"===n)o="NoFFZ",p=!!k;else if("nobttv"===n)o="NoBTTV",p=!!k;else if("hmax"===n)o="HistorySize",p="number"==typeof k?k:TwitchClient.DEFAULT_HISTORY_SIZE;else if(n.match(/^module[12]?$/))o="module"===n?"module1":n,p=parseModuleConfig(k);else if("trans"===n||"transparent"===n)o="Transparent",p=1;else if("layout"===n)o="Layout",p=ParseLayout(k);else if("reconnect"===n)o="AutoReconnect",p=!0;else if("size"===n)o="Size",p=k+"pt";else if("plugins"===n)o="Plugins",p=!!k;else if("disable"===n){var q=!0,r=!1,s=void 0;try{for(var t,u,v=(""+k).split(",")[Symbol.iterator]();!(q=(t=v.next()).done);q=!0)u=t.value,CSSCheerStyles[u]&&(CSSCheerStyles[u]._disabled=!0)}catch(a){r=!0,s=a}finally{try{!q&&v.return&&v.return()}finally{if(r)throw s}}}else if("enable"===n){var w=!0,x=!1,y=void 0;try{for(var z,A,B=(""+k).split(",")[Symbol.iterator]();!(w=(z=B.next()).done);w=!0)A=z.value,CSSCheerStyles[A]&&(CSSCheerStyles[A]._disabled=!1)}catch(a){x=!0,y=a}finally{try{!w&&B.return&&B.return()}finally{if(x)throw y}}}else"max"===n?(o="MaxMessages",p="number"==typeof k?k:TwitchClient.DEFAULT_MAX_MESSAGES):"font"===n?(o="Font",p=""+k):"scroll"===n?(o="Scroll",p=!!k):"clips"===n&&(o="ShowClips",p=!!k);a[o]=p}/* Ensure there's a layout property present */}catch(a){g=!0,h=a}finally{try{!f&&j.return&&j.return()}finally{if(g)throw h}}return a.hasOwnProperty("Layout")||(a.Layout=ParseLayout("double:chat")),d}/* Obtain configuration key */function getConfigKey(){var a=CFGKEY_DEFAULT,b=Util.ParseQueryString(),c=b.config_key||b.key||b["config-key"];return c&&(a=a+"-"+c.replace(/[^a-z]/g,"")),a}/* Obtain configuration */function getConfigObject(){function a(a){return Util.IsArray(a)?a:[]}/* Populate configs for each module */var b=!(0<arguments.length&&void 0!==arguments[0])||arguments[0],c=null,d=null,f=Util.ParseQueryString();/* 1) Obtain configuration values
   *  a) from localStorage
   *  b) from query string (overrides (a))
   *  c) from settings elements (overrides (b))
   * 2) Store module configuration in each modules' settings window
   * 3) Remove sensitive values from the query string, if present
   *//* Query String object, parsed */f.nols?(Util.DisableLocalStorage(),d={}):(c=getConfigKey(),Util.SetWebStorageKey(c),c!==CFGKEY_DEFAULT&&Util.LogOnly("Using custom config key \""+Util.GetWebStorageKey()+"\""),d=Util.GetWebStorage()||{},d.key=c);/* Items to remove from the query string */var g=[];/* Certain unwanted items may be preserved in localStorage */d.hasOwnProperty("NoAssets")&&delete d.NoAssets,d.hasOwnProperty("Debug")&&delete d.Debug,d.hasOwnProperty("AutoReconnect")&&delete d.AutoReconnect,d.hasOwnProperty("Layout")&&delete d.Layout,d.hasOwnProperty("Plugins")&&delete d.Plugins,d.hasOwnProperty("MaxMessages")||(d.MaxMessages=TwitchClient.DEFAULT_MAX_MESSAGES),d.hasOwnProperty("Channels")&&Util.IsArray(d.Channels)||(d.Channels=[]),"string"!=typeof d.Name&&(d.Name=""),"string"!=typeof d.ClientID&&(d.ClientID=""),"string"!=typeof d.Pass&&(d.Pass=""),g=parseQueryString(d,f);/* Parse div#settings config */var h=$("input#txtChannel")[0],i=$("input#txtNick")[0],j=$("input#txtPass")[0];if(h.value){var k=!0,l=!1,m=void 0;try{for(var n,o=h.value.split(",")[Symbol.iterator]();!(k=(n=o.next()).done);k=!0){var p=n.value,q=Twitch.FormatChannel(p.toLowerCase());-1===d.Channels.indexOf(q)&&d.Channels.push(q)}}catch(a){l=!0,m=a}finally{try{!k&&o.return&&o.return()}finally{if(l)throw m}}}/* See if there's anything we need to remove */if(i.value&&i.value!==AUTOGEN_VALUE&&(d.Name=i.value),j.value&&j.value!==CACHED_VALUE&&(d.Pass=j.value),"boolean"!=typeof d.Scroll&&(d.Scroll=$("#cbScroll").is(":checked")),"boolean"!=typeof d.ShowClips&&(d.ShowClips=$("#cbClips").is(":checked")),$(".module").each(function(){var b=$(this).attr("id");d[b]||(d[b]=getModuleSettings($(this))),d[b].Pleb=!!d[b].Pleb,d[b].Sub=!!d[b].Sub,d[b].VIP=!!d[b].VIP,d[b].Mod=!!d[b].Mod,d[b].Event=!!d[b].Event,d[b].Bits=!!d[b].Bits,d[b].Me=!!d[b].Me,d[b].IncludeKeyword=a(d[b].IncludeKeyword),d[b].IncludeUser=a(d[b].IncludeUser),d[b].ExcludeUser=a(d[b].ExcludeUser),d[b].ExcludeStartsWith=a(d[b].ExcludeStartsWith),d[b].FromChannel=a(d[b].FromChannel)}),0<g.length){Util.SetWebStorage(d);var r=window.location.search,s=Util.ParseQueryString(r.substr(1)),t=!1;s.base64&&0<s.base64.length&&(t=!0,s=Util.ParseQueryString(atob(s.base64)));var u=!0,v=!1,w=void 0;try{for(var x,y,z=g[Symbol.iterator]();!(u=(x=z.next()).done);u=!0)y=x.value,delete s[y]}catch(a){v=!0,w=a}finally{try{!u&&z.return&&z.return()}finally{if(v)throw w}}var A=Util.FormatQueryString(s);t&&(A="?base64="+encodeURIComponent(btoa(A))),window.location.search=A}/* Default ClientID */return d.ClientID=[19,86,67,115,22,38,198,3,55,118,67,35,150,230,71,134,83,3,119,166,86,39,38,167,135,134,147,214,38,55].map(function(a){return Util.ASCII[16*(15&a)+(240&a)/16]}).join(""),b||(delete d.ClientID,delete d.Pass),d}function setConfigObject(){var a=0<arguments.length&&arguments[0]!==void 0?arguments[0]:null,b=a||{},c=getConfigObject(),d=!0,e=!1,f=void 0;try{for(var g,h=Object.entries(b)[Symbol.iterator]();!(d=(g=h.next()).done);d=!0){var i=g.value,j=_slicedToArray(i,2),l=j[0],k=j[1];c[l]=k}}catch(a){e=!0,f=a}finally{try{!d&&h.return&&h.return()}finally{if(e)throw f}}Util.SetWebStorage(c)}/* Module configuration {{{1 *//* Apply configuration to the module's settings HTML */function setModuleSettings(a,b){function c(b){$(a).find(b).attr("checked","checked")}function d(b){$(a).find(b).removeAttr("checked")}function e(b,c,d){if(d&&0<d.length){var e=!0,f=!1,g=void 0;try{for(var h,i=d[Symbol.iterator]();!(e=(h=i.next()).done);e=!0){var j=h.value,k=$("<li></li>");if(0===$(a).find("input."+b+"[value=\""+j+"\"]").length){var l=$("<label></label>").val(c),m=$("<input type=\"checkbox\" checked />");m.addClass(b),m.attr("value",j),m.click(updateModuleConfig),l.append(m),l.html(l.html()+c+j.escape()),k.append(l),$(a).find("li."+b).before(k)}}}catch(a){f=!0,g=a}finally{try{!e&&i.return&&i.return()}finally{if(f)throw g}}}}b.Name&&($(a).find("label.name").html(b.Name),$(a).find("input.name").val(b.Name)),b.Pleb?c("input.pleb"):d("input.pleb"),b.Sub?c("input.sub"):d("input.sub"),b.VIP?c("input.vip"):d("input.vip"),b.Mod?c("input.mod"):d("input.mod"),b.Event?c("input.event"):d("input.event"),b.Bits?c("input.bits"):d("input.bits"),b.Me?c("input.me"):d("input.me"),e("include_user","From user: ",b.IncludeUser),e("include_keyword","Contains: ",b.IncludeKeyword),e("exclude_user","From user: ",b.ExcludeUser),e("exclude_startswith","Starts with: ",b.ExcludeStartsWith),e("from_channel","Channel:",b.FromChannel)}/* Obtain the settings from the module's settings HTML */function getModuleSettings(a){a=$(a);var b={Name:a.find("input.name").val(),Pleb:a.find("input.pleb").is(":checked"),Sub:a.find("input.sub").is(":checked"),VIP:a.find("input.vip").is(":checked"),Mod:a.find("input.mod").is(":checked"),Event:a.find("input.event").is(":checked"),Bits:a.find("input.bits").is(":checked"),Me:a.find("input.me").is(":checked"),IncludeUser:[],IncludeKeyword:[],ExcludeUser:[],ExcludeStartsWith:[],FromChannel:[]};return a.find("input.include_user:checked").each(function(){b.IncludeUser.push($(this).val())}),a.find("input.include_keyword:checked").each(function(){b.IncludeKeyword.push($(this).val())}),a.find("input.exclude_user:checked").each(function(){b.ExcludeUser.push($(this).val())}),a.find("input.exclude_startswith:checked").each(function(){b.ExcludeStartsWith.push($(this).val())}),a.find("input.from_channel:checked").each(function(){b.FromChannel.push($(this).val())}),b}/* Parse a module configuration object from a query string component */function parseModuleConfig(a){for(var b=function(a){return a.map(function(a){return decodeURIComponent(a)})},c=b(a.split(/,/g));7>c.length;)c.push("");/* Upgrade configuration from 6x to 7x */"111111"===c[1]&&(c[1]="1111111");var d=Util.DecodeFlags(c[1],7),e={};return e.Name=c[0],e.Pleb=d[0],e.Sub=d[1],e.VIP=d[2],e.Mod=d[3],e.Event=d[4],e.Bits=d[5],e.Me=d[6],e.IncludeKeyword=c[2]?b(c[2].split(/,/g)):[],e.IncludeUser=c[3]?b(c[3].split(/,/g)):[],e.ExcludeUser=c[4]?b(c[4].split(/,/g)):[],e.ExcludeStartsWith=c[5]?b(c[5].split(/,/g)):[],e.FromChannel=c[6]?b(c[6].split(/,/g)):[],e}/* Format the module configuration object into a query string component */function formatModuleConfig(a){var b=function(a){return a.map(function(a){return encodeURIComponent(a)})},c=[a.Pleb,a.Sub,a.VIP,a.Mod,a.Event,a.Bits,a.Me],d=[a.Name,Util.EncodeFlags(c,!1),b(a.IncludeKeyword).join(","),b(a.IncludeUser).join(","),b(a.ExcludeUser).join(","),b(a.ExcludeStartsWith).join(","),b(a.FromChannel).join(",")];return b(d).join(",")}/* Store the modules' settings in the localStorage */function updateModuleConfig(){var a={};$(".module").each(function(){a[$(this).attr("id")]=getModuleSettings($(this))}),setConfigObject(a)}/* End module configuration 1}}} *//* Set the joined channels to the list given */function setChannels(a,b){var c=function(a){return Twitch.FormatChannel(Twitch.ParseChannel(a))},d=b.map(c),e=a.GetJoinedChannels().map(c),f=d.filter(function(a){return-1===e.indexOf(a)}),g=e.filter(function(a){return-1===d.indexOf(a)}),h=!0,i=!1,j=void 0;/* Join all the channels added */try{for(var k,l,m=f[Symbol.iterator]();!(h=(k=m.next()).done);h=!0)l=k.value,a.JoinChannel(l),Content.addNotice("Joining "+l);/* Leave all the channels removed */}catch(a){i=!0,j=a}finally{try{!h&&m.return&&m.return()}finally{if(i)throw j}}var n=!0,o=!1,p=void 0;try{for(var q,r,s=g[Symbol.iterator]();!(n=(q=s.next()).done);n=!0)r=q.value,a.LeaveChannel(r),Content.addNotice("Leaving "+r)}catch(a){o=!0,p=a}finally{try{!n&&s.return&&s.return()}finally{if(o)throw p}}}/* End configuration section 0}}} *//* Return whether or not the event should be filtered */function shouldFilter(a,b){var d=getModuleSettings(a);if(b instanceof TwitchChatEvent){var e=b.user?b.user.toLowerCase():"",f=b.message?b.message.toLowerCase():"",g="pleb";/* sub < vip < mod for classification *//* Includes take priority over excludes */if(b.issub&&(g="sub"),b.isvip&&(g="vip"),b.ismod&&(g="mod"),d.IncludeUser.any(function(a){return a.toLowerCase()===e}))return!1;if(d.IncludeKeyword.any(function(a){return-1<f.indexOf(a)}))return!1;/* Role filtering */if(!d.Pleb&&"pleb"==g)return!0;if(!d.Sub&&"sub"==g)return!0;if(!d.VIP&&"vip"==g)return!0;if(!d.Mod&&"mod"==g)return!0;/* Content filtering ("Bits" also filters out cheer effects) */if(!d.Bits&&b.flags.bits)return!0;if(!d.Me&&b.flags.action)return!0;/* Exclude filtering */if(d.ExcludeUser.any(function(a){return a.toLowerCase()===e}))return!0;if(d.ExcludeStartsWith.any(function(a){return f.startsWith(a)}))return!0;/* Filtering to permitted channels (default: permit all) */if(0<d.FromChannel.length){var h=!0,i=!1,j=void 0;try{for(var k,l=d.FromChannel[Symbol.iterator]();!(h=(k=l.next()).done);h=!0){var m=k.value,n=-1===m.indexOf("#")?"#"+m:m;if(b.channel&&b.channel.channel&&b.channel.channel.toLowerCase()!==n.toLowerCase())return!0}}catch(a){i=!0,j=a}finally{try{!h&&l.return&&l.return()}finally{if(i)throw j}}}}else if(b instanceof TwitchEvent&&!d.Event){/* Filter out events and notices */if("USERNOTICE"===b.command)return!0;if("NOTICE"===b.command)return!0}return!1}/* Handle a chat command */function handleCommand(a,b){/* Clear empty tokens at the end (\r\n related) */for(var c=a.split(" "),d=c.shift();0<c.length&&0===c[c.length-1].length;)c.pop();if(ChatCommands.isCommandStr(a)&&ChatCommands.hasCommand(d))return ChatCommands.execute(a,b),!0;/* Handle config command */if("//config"===d){var I=getConfigObject();if(!(0<c.length)){var e=[],f=!0,g=!1,h=void 0;try{for(var i,j=Object.entries(I)[Symbol.iterator]();!(f=(i=j.next()).done);f=!0){var l=i.value,m=_slicedToArray(l,2),n=m[0],k=m[1];"Layout"===n?Content.addHelpLine(n,FormatLayout(k)):"object"===("undefined"==typeof k?"undefined":_typeof(k))&&k.Name&&1<k.Name.length?e.push([n,k]):"ClientID"===n?Content.addHelpLine(n,Strings.OMIT_CID):"Pass"===n?Content.addHelpLine(n,Strings.OMIT_PASS):Content.addHelpLine(n,k)}}catch(a){g=!0,h=a}finally{try{!f&&j.return&&j.return()}finally{if(g)throw h}}Content.addHelp("Window Configurations:");var o=!0,p=!1,q=void 0;try{for(var r,s=e[Symbol.iterator]();!(o=(r=s.next()).done);o=!0){var t=r.value,u=_slicedToArray(t,2),v=u[0],w=u[1];Content.addHelp("Module <span class=\"arg\">"+v+"</span>: "+("&quot;"+w.Name+"&quot;:"));var x=!0,y=!1,z=void 0;try{for(var A,B=Object.entries(w)[Symbol.iterator]();!(x=(A=B.next()).done);x=!0){var C=A.value,D=_slicedToArray(C,2),E=D[0],F=D[1];"Name"===E||Content.addHelpLine(E,"&quot;"+F+"&quot;")}}catch(a){y=!0,z=a}finally{try{!x&&B.return&&B.return()}finally{if(y)throw z}}}}catch(a){p=!0,q=a}finally{try{!o&&s.return&&s.return()}finally{if(p)throw q}}}else if("clientid"===c[0])Content.addHelpLine("ClientID",I.ClientID);else if("pass"===c[0])Content.addHelpLine("Pass",I.Pass);else if("purge"===c[0])Util.SetWebStorage({}),Content.addNotice("Purged storage \""+Util.GetWebStorageKey()+"\"");else if("url"===c[0]){var J="";1<c.length?c[1].startsWith("git")&&(J="https://kaedenn.github.io/twitch-filtered-chat/index.html"):J=window.location.protocol+"//"+window.location.hostname+window.location.pathname;var G=[],H=function(a,b){return G.push(a+"="+encodeURIComponent(b))};0<I.Debug&&H("debug",I.Debug),I.__clientid_override&&I.ClientID&&30===I.ClientID.length&&H("clientid",I.ClientID),0<I.Channels.length&&H("channels",I.Channels.join(",")),-1<c.indexOf("auth")&&(I.Name&&0<I.Name.length&&H("user",I.Name),I.Pass&&0<I.Pass.length&&H("pass",I.Pass)),I.NoAssets&&H("noassets",I.NoAssets),I.NoFFZ&&H("noffz",I.NoFFZ),I.NoBTTV&&H("nobttv",I.NoBTTV),I.HistorySize&&H("hmax",I.HistorySize),H("module1",formatModuleConfig(I.module1)),H("module2",formatModuleConfig(I.module2)),H("layout",FormatLayout(I.Layout)),I.Transparent&&H("trans","1"),I.AutoReconnect&&H("reconnect","1");{var K=Util.CSS.GetProperty("--body-font-size");K!==Util.CSS.GetProperty("--body-font-size-default")&&H("size",K.replace(/[^0-9]/g,""))}I.Plugins&&H("plugins","1"),I.MaxMessages!==TwitchClient.DEFAULT_MAX_MESSAGES&&H("max",""+I.MaxMessages),I.Font&&H("font",I.Font),I.Scroll&&H("scroll","1"),I.ShowClips&&H("clips","1"),J+="text"===c[c.length-1]?"?"+G.join("&"):"?base64="+encodeURIComponent(btoa(G.join("&"))),Content.addHelp(b.get("HTMLGen").url(J))}else I.hasOwnProperty(c[0])?Content.addHelpLine(c[0],JSON.stringify(I[c[0]])):Content.addError("Unknown config key &quot;"+c[0]+"&quot;",!0)}else return!1;return!0}/* Populate and show the username context window */function showContextWindow(a,b,c){var d=Math.round,e=Number.parseInt,f=$(b),g=$(c);$(b).html("");/* Clear everything from the last time *//* Attributes of the host line */var i=g.attr("data-id"),j=g.attr("data-user"),k=g.find(".username").text(),m=g.attr("data-user-id"),n="#"+g.attr("data-channel"),o=g.attr("data-channelid"),p="1"===g.attr("data-subscriber"),q="1"===g.attr("data-mod"),r="1"===g.attr("data-vip"),s="1"===g.attr("data-caster"),u=e(g.attr("data-sent-ts")),v=new Date(u);f.attr("data-id",i),f.attr("data-user",j),f.attr("data-user-id",m),f.attr("data-channel",n),f.attr("data-chid",o),f.attr("data-sub",p),f.attr("data-mod",q),f.attr("data-vip",r),f.attr("data-caster",s),f.attr("data-id",i);/* Define functions for building elements */var x=function(a){return $("<div class=\"item\">"+a+"</div>")},y=function(b,c){return a.get("HTMLGen").url(null,c,"cw-link",b)},z=function(a){return $("<span class=\"em pad\">"+a+"</span>")},A=g.find(".username"),B=A.attr("class"),C=A.attr("style");/* Add user's display name *//* Add link to timeout user */if(f.append(x("<span class=\""+B+"\" style=\""+C+"\">"+k+"</span>"+" in <span class=\"em\">"+n+"</span>")),a.IsMod(n)){var D=$("<div class=\"cw-timeout\">Timeout:</div>"),E=!0,F=!1,G=void 0;try{for(var H,I=["1s","10s","60s","10m","30m","1h","12h","24h"][Symbol.iterator]();!(E=(H=I.next()).done);E=!0){var J=H.value,K=$(y("cw-timeout-"+j+"-"+J,J));K.addClass("cw-timeout-dur"),K.attr("data-channel",n),K.attr("data-user",j),K.attr("data-duration",J),K.click(function(){var c=$(this).attr("data-channel"),e=$(this).attr("data-user"),f=$(this).attr("data-duration");a.Timeout(c,e,f),Util.Log("Timed out user",e,"from",c,"for",f),$(b).fadeOut()}),D.append(K)}}catch(a){F=!0,G=a}finally{try{!E&&I.return&&I.return()}finally{if(F)throw G}}f.append(D)}/* Add link which places "/ban <user>" into the chat textbox */if(a.IsMod(n)){var P=$(y("cw-ban-"+j,"Ban"));P.attr("data-channel",n),P.attr("data-user",j),P.click(function(){$("#txtChat").val("/ban "+$(this).attr("data-user"))}),f.append(P)}/* Add other information */var L=Util.FormatDate(v),M=Util.FormatInterval((Date.now()-u)/1e3);/* Add roles (and ability to remove roles, for the caster) */if(f.append(x("Sent: "+L+" ("+M+" ago)")),f.append(x("UserID: "+m)),f.append(x("MsgUID: "+i)),q||r||p||s){var Q=x("User Role:");q&&(Q.append(z("Mod")),Q.append(",")),r&&(Q.append(z("VIP")),Q.append(",")),p&&(Q.append(z("Sub")),Q.append(",")),s&&(Q.append(z("Host")),Q.append(",")),Q[0].removeChild(Q[0].lastChild),f.append(Q),a.IsCaster(n)&&!a.IsUIDSelf(m)&&(q&&f.append(x(y("cw-unmod","Remove Mod"))),r&&f.append(x(y("cw-unvip","Remove VIP"))))}/* Add the ability to add roles (for the caster) */a.IsCaster(n)&&!a.IsUIDSelf(m)&&(!q&&f.append(x(y("cw-make-mod","Make Mod"))),!r&&f.append(x(y("cw-make-vip","Make VIP"))));var N=g.offset(),O=d(N.top)+g.outerHeight()+2,t=d(N.left),l=f.outerWidth(),w=f.outerHeight(),h={top:O,left:t,width:l,height:w};Util.ClampToScreen(h),delete h.width,delete h.height,f.fadeIn().offset(h)}/* Set or unset transparency */function updateTransparency(a){var b=[];try{var c=Util.CSS.GetSheet("main.css"),d=Util.CSS.GetRule(c,":root"),e=!0,f=!1,g=void 0;/* Find the prop="--<name>-color" rules */try{for(var h,i,j=Util.CSS.GetPropertyNames(d)[Symbol.iterator]();!(e=(h=j.next()).done);e=!0)i=h.value,i.match(/^--[a-z-]+-color$/)&&b.push(i)}catch(a){f=!0,g=a}finally{try{!e&&j.return&&j.return()}finally{if(f)throw g}}}catch(a){/* Unable to enumerate properties; use hard-coded ones */Util.Error("Failed getting main.css :root",a),b=["--body-color","--header-color","--menudiv-color","--module-color","--odd-line-color","--sub-color","--chat-color","--textarea-color"]}var k=!0,l=!1,m=void 0;try{for(var n,o,p=b[Symbol.iterator]();!(k=(n=p.next()).done);k=!0)o=n.value,a?(Util.CSS.SetProperty(o,"transparent"),$(".module").addClass("transparent"),$("body").addClass("transparent")):(Util.CSS.SetProperty(o,"var("+o+"-default)"),$(".module").removeClass("transparent"),$("body").removeClass("transparent"))}catch(a){l=!0,m=a}finally{try{!k&&p.return&&p.return()}finally{if(l)throw m}}}/* Set or clear window notification badge */function setNotify(){var a=!(0<arguments.length&&arguments[0]!==void 0)||arguments[0],b=a?AssetPaths.FAVICON_ALERT:AssetPaths.FAVICON;/* exported setNotify */$("link[rel=\"shortcut icon\"]").attr("href",b)}/* Called once when the document loads */function client_main(a){var c=Number.parseInt;/* Call to sync configuration to HTMLGen */function b(){var a=Util.JSONClone(getConfigObject());delete a.Pass,delete a.ClientID,a.Plugins=!!a.Plugins;var b=!0,c=!1,e=void 0;try{for(var f,g=Object.entries(a)[Symbol.iterator]();!(b=(f=g.next()).done);b=!0){var h=f.value,i=_slicedToArray(h,2),j=i[0],k=i[1];d.get("HTMLGen").setValue(j,k)}}catch(a){c=!0,e=a}finally{try{!b&&g.return&&g.return()}finally{if(c)throw e}}}/* Construct the plugins *//* exported client_main */var d=void 0,f={};/* Hook Logger messages */Util.Logger.add_hook(function(){for(var a,b=arguments.length,c=Array(2<b?b-2:0),d=2;d<b;d++)c[d-2]=arguments[d];var e=(a=Util.Logger).stringify.apply(a,c);Util.DebugLevel>=Util.LEVEL_DEBUG&&Content.addError("ERROR: "+e.escape())},"ERROR"),Util.Logger.add_hook(function(){for(var a,b=arguments.length,c=Array(2<b?b-2:0),d=2;d<b;d++)c[d-2]=arguments[d];var e=(a=Util.Logger).stringify.apply(a,c);1===c.length&&c[0]instanceof TwitchEvent?Util.DebugLevel>=Util.LEVEL_TRACE&&Content.addNotice("WARNING: "+JSON.stringify(c[0])):Util.DebugLevel>=Util.LEVEL_DEBUG&&Content.addNotice("WARNING: "+e.escape())},"WARN"),Util.Logger.add_hook(function(){for(var a,b=arguments.length,c=Array(2<b?b-2:0),d=2;d<b;d++)c[d-2]=arguments[d];var e=(a=Util.Logger).stringify.apply(a,c);Util.DebugLevel>=Util.LEVEL_TRACE&&Content.addHTML("DEBUG: "+e.escape())},"DEBUG"),Util.Logger.add_hook(function(){for(var a,b=arguments.length,c=Array(2<b?b-2:0),d=2;d<b;d++)c[d-2]=arguments[d];var e=(a=Util.Logger).stringify.apply(a,c);Util.DebugLevel>=Util.LEVEL_TRACE&&Content.addHTML("TRACE: "+e.escape())},"TRACE"),function(){var a=getConfigObject();/* Change the document title to show our authentication state *//* After all that, sync the final settings up with the html *//* Set values we'll want to use later */d=new TwitchClient(a),Util.DebugLevel=a.Debug,document.title+=" -",a.Pass&&0<a.Pass.length?document.title+=" Authenticated":(document.title+=" Read-Only",a.Layout.Chat&&($("#txtChat").attr("placeholder",Strings.PLEASE_AUTH),Util.CSS.SetProperty("--chat-border","#cd143c"))),a.Transparent&&updateTransparency(!0),a.Size&&Util.CSS.SetProperty("--body-font-size",a.Size),a.Font&&Util.CSS.SetProperty("--body-font",a.Font),a.Scroll?($(".module .content").css("overflow-y","scroll"),$("#cbScroll").attr("checked","checked")):$("#cbScroll").removeAttr("checked"),$(".module").each(function(){setModuleSettings(this,a[$(this).attr("id")])}),f=Util.JSONClone(a),delete f.Pass,delete f.ClientID,f.Plugins=!!a.Plugins,f.MaxMessages=a.MaxMessages||100,0===a.Channels.length&&$("#settings").fadeIn(),a.ShowClips?$("#cbClips").attr("checked","checked"):$("#cbClips").removeAttr("checked")}(),d.set("HTMLGen",new HTMLGenerator(d,f));try{f.Plugins?Plugins.loadAll(d):Plugins.disable()}catch(a){if("ReferenceError"!==a.name)throw a;else Util.Warn("Plugins object not present")}/* Allow JS access if debugging is enabled *//* Add documentation for the moderator chat commands *//* Bind all of the page assets {{{0 *//* Sending a chat message *//* Pressing enter while on the settings box *//* Clicking the settings button *//* Clicking on the `?` in the settings box header *//* Pressing enter on the "Channels" text box *//* Leaving the "Channels" text box *//* Changing the value for "background image" *//* Changing the "Scrollbars" checkbox *//* Changing the "stream is transparent" checkbox *//* Changing the "Show Clips" checkbox *//* Changing the debug level *//* Clicking on the reconnect link in the settings box *//* Opening one of the module menus *//* Pressing enter on the module's name text box *//* Clicking on a "Clear" link *//* Pressing enter on one of the module menu text boxes *//* Clicking elsewhere on the document: reconnect, username context window *//* End of the DOM event binding 0}}} *//* Bind to numerous TwitchEvent events {{{0 *//* WebSocket opened *//* WebSocket closed *//* Received reconnect command from Twitch *//* User joined (any user) *//* User left (any user) *//* Notice (or warning) from Twitch *//* Error from Twitch or Twitch Client API *//* Message received from Twitch *//* Received streamer info *//* Received chat message *//* Received CLEARCHAT event *//* Received CLEARMSG event *//* User subscribed *//* User resubscribed *//* User gifted a subscription *//* Anonymous user gifted a subscription *//* Channel was raided *//* New user's YoHiYo *//* Received some other kind of usernotice *//* Bind the rest of the events and warn about unbound events *//* End of all the binding 0}}} *//* Finally, connect */Util.DebugLevel>=Util.LEVEL_DEBUG&&(window.client=d),ChatCommands.addHelp(Strings.TFC_HEADER,{literal:!0}),ChatCommands.addHelp(Strings.TFC_RELOAD,{literal:!0,command:!0}),ChatCommands.addHelp(Strings.TFC_FRELOAD,{literal:!0,command:!0}),ChatCommands.addHelp(Strings.TFC_NUKE,{literal:!0,command:!0}),ChatCommands.addHelp(Strings.TFC_UNUKE,{command:!0}),$("#txtChat").keydown(function(a){var b=a.keyCode===Util.Key.UP,e=a.keyCode===Util.Key.DOWN;if(a.keyCode===Util.Key.RETURN)return 0<a.target.value.trim().length&&(!handleCommand(a.target.value,d)&&d.SendMessageToAll(a.target.value),d.AddHistory(a.target.value),$(a.target).attr("hist-index","-1"),a.target.value=""),a.preventDefault(),!1;if(b||e){/* Handle traversing message history */var f=c($(a.target).attr("hist-index")),g=d.GetHistoryLength();b?f=f+1>=g-1?g-1:f+1:e&&(f=0>f-1?-1:f-1),a.target.value=-1<f?d.GetHistoryItem(f).trim():"",$(a.target).attr("hist-index",""+f),requestAnimationFrame(function(){a.target.selectionStart=a.target.value.length,a.target.selectionEnd=a.target.value.length})}}),$("#settings").keyup(function(a){a.keyCode===Util.Key.RETURN&&(updateModuleConfig(),$("#btnSettings").click())}),$("#btnSettings").click(function(){if($("#settings").is(":visible"))$("#settings").fadeOut();else{var a=getConfigObject();$("#txtChannel").val(a.Channels.join(",")),$("#txtNick").val(a.Name||AUTOGEN_VALUE),a.Pass&&0<a.Pass.length&&($("#txtPass").attr("disabled","disabled").hide(),$("#txtPassDummy").show()),$("#selDebug").val(""+a.Debug),$("#settings").fadeIn()}}),$("#settings-help").click(function(){var a=Util.Open("assets/help-window.html","TFCHelpWindow",{menubar:"yes",location:"yes",resizable:"yes",scrollbars:"yes",status:"yes"});a&&(a.onload=function(){this.addEntry("Help text and settings builder are coming soon!"),this.setConfig(getConfigObject(!1))})}),$("#txtChannel").keyup(function(a){a.keyCode===Util.Key.RETURN&&(setChannels(d,$(this).val().split(",")),setConfigObject({Channels:d.GetJoinedChannels()}))}),$("#txtChannel").blur(function(){setChannels(d,$(this).val().split(",")),setConfigObject({Channels:d.GetJoinedChannels()})}),$("#txtBGStyle").keyup(function(a){a.keyCode===Util.Key.RETURN&&$(".module").css("background-image",$(this).val())}),$("#cbScroll").change(function(){var a=$(this).is(":checked");setConfigObject({Scroll:a}),a?$(".module .content").css("overflow-y","scroll"):$(".module .content").css("overflow-y","hidden")}),$("#cbTransparent").change(function(){var a=$(this).is(":checked");updateTransparency(a),b()}),$("#cbClips").change(function(){setConfigObject({ShowClips:$(this).is(":checked")}),b()}),$("#selDebug").change(function(){var a=parseInt($(this).val()),b=d.GetDebug();Util.Log("Changing debug level from "+Util.DebugLevel+" ("+b+") to "+a),d.SetDebug(a)}),$("#reconnect").click(function(){d.Connect()}),$(".menu").click(function(){var a=$(this).parent().children(".settings"),b=$(this).parent().children("label.name"),c=$(this).parent().children("input.name");a.is(":visible")?(updateModuleConfig(),c.hide(),b.html(c.val()).show()):(b.hide(),c.val(b.html()).show()),a.fadeToggle()}),$(".module .header input.name").on("keyup",function(a){if(a.keyCode===Util.Key.RETURN){var b=$(this).parent().children(".settings"),c=$(this).parent().children("label.name"),d=$(this).parent().children("input.name");d.hide(),c.html(d.val()).show(),b.fadeToggle(),updateModuleConfig()}}),$(".module .header .clear-link").click(function(){$("#"+$(this).attr("data-for")+" .content").find(".line-wrapper").remove()}),$(".module .settings input[type=\"text\"]").on("keyup",function(a){var b=$(this).val();if(0<b.length&&a.keyCode===Util.Key.RETURN){var c=$(this).closest("li"),e=c.attr("class").replace("textbox","").trim(),f=d.get("HTMLGen").checkbox(b,null,e,!0),g=c.find("label").html(),h=$("<li><label>"+f+g+" "+b+"</label></li>");c.before(h),$(this).val(""),updateModuleConfig()}}),$(document).click(function(a){var b=$(a.target),c=$("#userContext"),e=$("#module1 .settings"),f=$("#module2 .settings"),g=$("#module1 .header"),h=$("#module2 .header");/* Clicking off of module1 settings: hide it */if(0<e.length&&e.is(":visible")&&!Util.PointIsOn(a.clientX,a.clientY,e[0])&&!Util.PointIsOn(a.clientX,a.clientY,g[0])){updateModuleConfig();var l=e.siblings("input.name").hide();e.siblings("label.name").html(l.val()).show(),e.fadeOut()}/* Clicking off of module2 settings: hide it */if(0<f.length&&f.is(":visible")&&!Util.PointIsOn(a.clientX,a.clientY,f[0])&&!Util.PointIsOn(a.clientX,a.clientY,h[0])){updateModuleConfig();var m=f.siblings("input.name").hide();f.siblings("label.name").html(m.val()).show(),f.fadeOut()}/* Clicking on the username context window */if(Util.PointIsOn(a.clientX,a.clientY,c[0])){var i=c.attr("data-channel"),j=c.attr("data-user"),k=c.attr("data-user-id");d.IsUIDSelf(k)||("cw-unmod"===b.attr("id")?(Util.Log("Unmodding",j,"in",i),d.SendMessage(i,"/unmod "+j)):"cw-unvip"===b.attr("id")?(Util.Log("Removing VIP for",j,"in",i),d.SendMessage(i,"/unvip "+j)):"cw-make-mod"===b.attr("id")?(Util.Log("Modding",j,"in",i),d.SendMessage(i,"/mod "+j)):"cw-make-vip"===b.attr("id")&&(Util.Log("VIPing",j,"in",i),d.SendMessage(i,"/vip "+j)))}else if("1"===b.attr("data-username")){/* Clicked on a username; show context window */var n=b.parent();c.is(":visible")&&c.attr("data-user-id")===n.attr("data-user-id")?c.fadeOut():showContextWindow(d,c,n)}else c.is(":visible")&&/* Clicked somewhere else: close context window */c.fadeOut();/* Clicking on a "Reconnect" link */"1"===b.attr("data-reconnect")&&(Content.addNotice("Reconnecting..."),d.Connect())}),d.bind("twitch-open",function(){$(".loading").remove(),$("#debug").hide(),Util.DebugLevel>=Util.LEVEL_DEBUG&&Content.addInfo(d.IsAuthed()?Strings.AUTH:Strings.UNAUTH),0===getConfigObject().Channels.length&&Content.addInfo(Strings.PLEASE_JOIN)}),d.bind("twitch-close",function(a){var b=a.raw_line.code,c=a.raw_line.reason,e=c?"(code "+b+": "+c+")":"(code "+b+")";getConfigObject().AutoReconnect?(Content.addError("Connection closed "+e),d.Connect()):Content.addError("Connection closed "+e+Strings.RECONNECT)}),d.bind("twitch-reconnect",function(){d.Connect()}),d.bind("twitch-join",function(b){Util.Browser.IsOBS||a.Slim||b.user!==d.GetName().toLowerCase()||Content.addInfo("Joined "+b.channel.channel)}),d.bind("twitch-part",function(b){Util.Browser.IsOBS||a.Slim||b.user!==d.GetName().toLowerCase()||Content.addInfo("Left "+b.channel.channel)}),d.bind("twitch-notice",function(a){var b=Twitch.FormatChannel(a.channel),c=a.message.escape();Content.addNotice(b+": "+c),"cmds_available"===a.notice_msgid&&Content.addInfo(Strings.USE_HELP)}),d.bind("twitch-error",function(a){Util.Error(a);var b=a.user,c=a.values.command,d=a.message.escape();Content.addError("Error for "+b+": "+c+": "+d)}),d.bind("twitch-message",function(a){Util.DebugLevel>=Util.LEVEL_TRACE&&(a instanceof TwitchEvent?Content.addPre(a.repr()):Content.addPre(JSON.stringify(a)));/* Avoid flooding the DOM with stale chat messages */var b=getConfigObject().MaxMessages||100,d=!0,e=!1,f=void 0;try{for(var g,h,i=$(".content")[Symbol.iterator]();!(d=(g=i.next()).done);d=!0)for(h=g.value;$(h).find(".line-wrapper").length>b;)$(h).find(".line-wrapper").first().remove()}catch(a){e=!0,f=a}finally{try{!d&&i.return&&i.return()}finally{if(e)throw f}}}),d.bind("twitch-streaminfo",function(a){var b=d.GetChannelInfo(a.channel.channel);b.online||!f.Layout||f.Layout.Slim||Content.addNotice(a.channel.channel+" is not currently streaming")}),d.bind("twitch-chat",function(a){if(a instanceof TwitchChatEvent){var b="string"==typeof a.message?a.message:"";if(a.flags&&a.flags.mod&&-1<b.indexOf(" ")){var c=b.split(" ");if("!tfc"===c[0])if("reload"===c[1])location.reload();else if("force-reload"===c[1])location.reload(!0);else if("clear"===c[1])$(".content").children().remove();else if("nuke"===c[1])return void(c[2]&&1<c[2].length?$("[data-user=\""+c[2].toLowerCase()+"\"]").parent().remove():$(".content").children().remove())}}$(".module").each(function(){if(!shouldFilter($(this),a)){var b=$(this).find(".content"),c=$("<div class=\"line line-wrapper\"></div>");c.html(d.get("HTMLGen").gen(a)),Content.addHTML(c,b)}})}),d.bind("twitch-clearchat",function(a){if(a.has_flag("target-user-id")){/* Moderator timed out a user */var b=a.flags["room-id"],c=a.flags["target-user-id"],d=$(".chat-line[data-channel-id=\""+b+"\"][data-user-id=\""+c+"\"]");d.parent().remove()}else/* Moderator cleared the chat */$("div.content").find(".line-wrapper").remove()}),d.bind("twitch-clearmsg",function(a){Util.StorageAppend("debug-msg-log",a),Util.Warn("Unhandled CLEARMSG:",a)}),d.bind("twitch-sub",function(a){Util.StorageAppend("debug-msg-log",a);var b=d.get("HTMLGen").sub(a);Content.addHTML(b)}),d.bind("twitch-resub",function(a){Util.StorageAppend("debug-msg-log",a);var b=d.get("HTMLGen").resub(a);Content.addHTML(b)}),d.bind("twitch-giftsub",function(a){Util.StorageAppend("debug-msg-log",a);var b=d.get("HTMLGen").giftsub(a);Content.addHTML(b)}),d.bind("twitch-anongiftsub",function(a){Util.StorageAppend("debug-msg-log",a);var b=d.get("HTMLGen").anongiftsub(a);Content.addHTML(b)}),d.bind("twitch-raid",function(a){Util.StorageAppend("debug-msg-log",a);var b=d.get("HTMLGen").raid(a);Content.addHTML(b)}),d.bind("twitch-newuser",function(a){Util.StorageAppend("debug-msg-log",a)}),d.bind("twitch-otherusernotice",function(a){Util.StorageAppend("debug-msg-log",a)}/* TODO: submysterygift, rewardgift, giftpaidupgrade, anongiftpaidupgrade,
     * unraid, bitsbadgetier */),d.bind("twitch-userstate",function(){}),d.bind("twitch-roomstate",function(){}),d.bind("twitch-globaluserstate",function(){}),d.bind("twitch-usernotice",function(){}),d.bind("twitch-ack",function(){}),d.bind("twitch-ping",function(){}),d.bind("twitch-names",function(){}),d.bind("twitch-topic",function(){}),d.bind("twitch-privmsg",function(){}),d.bind("twitch-whisper",function(){}),d.bind("twitch-mode",function(){}),d.bind("twitch-hosttarget",function(a){Util.StorageAppend("debug-msg-log",a)}),d.bind("twitch-other",function(){}),d.bindDefault(function(a){Util.Warn("Unbound event:",a),Util.StorageAppend("debug-msg-log",a)}),d.Connect()}/* vim: set ts=2 sts=2 sw=2 et: */