"use strict";var _slicedToArray=function(){function a(a,b){var c=[],d=!0,e=!1,f=void 0;try{for(var g,h=a[Symbol.iterator]();!(d=(g=h.next()).done)&&(c.push(g.value),!(b&&c.length===b));d=!0);}catch(a){e=!0,f=a}finally{try{!d&&h["return"]&&h["return"]()}finally{if(e)throw f}}return c}return function(b,c){if(Array.isArray(b))return b;if(Symbol.iterator in Object(b))return a(b,c);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}(),_createClass=function(){function a(a,b){for(var c,d=0;d<b.length;d++)c=b[d],c.enumerable=c.enumerable||!1,c.configurable=!0,"value"in c&&(c.writable=!0),Object.defineProperty(a,c.key,c)}return function(b,c,d){return c&&a(b.prototype,c),d&&a(b,d),b}}();function _toConsumableArray(a){if(Array.isArray(a)){for(var b=0,c=Array(a.length);b<a.length;b++)c[b]=a[b];return c}return Array.from(a)}function _classCallCheck(a,b){if(!(a instanceof b))throw new TypeError("Cannot call a class as a function")}/* Twitch Filtered Chat Commands */var ChatCommandManager=function(){function a(){_classCallCheck(this,a),this._command_list=[],this._commands={},this._aliases={},this._help_text=[],this.add("help",this.command_help.bind(this),"Show help for a specific command or all commands"),this.addAlias("?","help"),this.addAlias("","help"),this.addUsage("help",null,"Show help for all commands"),this.addUsage("help","command","Show usage information for <command>")}return _createClass(a,[{key:"_trim",value:function b(a){return a.replace(/^\/\//,"").replace(/^\./,"")}},{key:"add",value:function h(a,b,d){if(!a.match(/^[a-z0-9_-]+$/))Util.Error("Invalid command \""+a.escape()+"\"");else{for(var e={name:a,func:b,desc:d,aliases:[]},c=arguments.length,f=Array(3<c?c-3:0),g=3;g<c;g++)f[g-3]=arguments[g];e.dflt_args=0<f.length?f:null,this._command_list.push(a),this._commands[a]=e}}},{key:"addAlias",value:function c(a,b){this.hasCommand(b,!0)?(this._aliases[a]=b,this._commands[b].aliases.push(a)):Util.Error("Invalid command: "+b)}},{key:"addUsage",value:function f(a,b,d){var e=3<arguments.length&&void 0!==arguments[3]?arguments[3]:null;if(this.hasCommand(a,!0)){var g=this.getCommand(a);g.usage||(g.usage=[]),g.usage.push({args:b,usage:d,opts:e||{}})}else Util.Error("Invalid command: "+a)}},{key:"addHelp",value:function g(a){var b=1<arguments.length&&void 0!==arguments[1]?arguments[1]:null,c=b||{},d=a;if(c.indent&&(d="&nbsp;&nbsp;"+d),c.literal&&(d=d.escape()),c.command){var e=d.substr(0,d.indexOf(":")),f=d.substr(d.indexOf(":")+1);d=this.helpLine(e,f)}this._help_text.push(d)}},{key:"complete",value:function o(a){/* TODO: Complete command arguments, fix //<tab> */var b=a.orig_text,c=a.orig_pos,d=a.index;/* Gather completions */if(this.isCommandStr(b)){var e=this._trim(b.substr(0,c)),f=b,g=[];0<e.length&&(f=b.substr(0,b.indexOf(e)));var h=!0,i=!1,j=void 0;try{for(var l,m,n=Object.keys(this._commands).sort()[Symbol.iterator]();!(h=(l=n.next()).done);h=!0)m=l.value,(0===e.length||m.startsWith(e))&&g.push(m)}catch(a){i=!0,j=a}finally{try{!h&&n.return&&n.return()}finally{if(i)throw j}}d<g.length&&(b=f+g[d]),d+=1,d>=g.length&&(d=0)}return{orig_text:a.orig_text,orig_pos:a.orig_pos,curr_text:b,curr_pos:c,index:d}}},{key:"isCommandStr",value:function b(a){return a.match(/^\/\//)||a.match(/^\./)}},{key:"hasCommand",value:function d(a){var b=!!(1<arguments.length&&void 0!==arguments[1])&&arguments[1],c=this._trim(a);return!!this._commands.hasOwnProperty(c)||!b&&this._aliases.hasOwnProperty(c)}},{key:"execute",value:function e(a,b){if(this.isCommandStr(a)){var f=this._trim(a.split(" ")[0]);if(this.hasCommand(f)){var g=a.replace(/[\s]*$/,"").split(" ").slice(1);try{var d=this.getCommand(f),c=Object.create(this);c.formatUsage=this.formatUsage.bind(this,d),c.printUsage=this.printUsage.bind(this,d),c.formatHelp=this.formatHelp.bind(this,d),c.printHelp=this.printHelp.bind(this,d),c.command=f,c.cmd_func=d.func,c.cmd_desc=d.desc,d.dflt_args?d.func.bind(c).apply(void 0,[f,g,b].concat(_toConsumableArray(d.dflt_args))):d.func.bind(c)(f,g,b)}catch(a){Content.addError(f+": "+a.name+": "+a.message),Util.Error(a)}}else Content.addError(f+": unknown command")}else Content.addError(JSON.stringify(a)+": not a command string")}},{key:"getCommands",value:function a(){return Object.keys(this._commands)}},{key:"getCommand",value:function f(a){var b=!!(1<arguments.length&&void 0!==arguments[1])&&arguments[1],d=this._trim(a),e=this._commands[d];return e||b||!this._commands[this._aliases[d]]||(e=this._commands[this._aliases[d]]),e}},{key:"formatHelp",value:function b(a){return this.helpLine("//"+a.name,a.desc,!0)}},{key:"formatUsage",value:function q(b){var c=[];if(b.usage){var d=!0,e=!1,f=void 0;try{for(var g,h=b.usage[Symbol.iterator]();!(d=(g=h.next()).done);d=!0){var i=g.value,j=this.formatArgs(i.usage);if(i.args){var r=this.formatArgs(i.args);c.push(this.helpLine("//"+b.name+" "+r,j))}else c.push(this.helpLine("//"+b.name,j))}}catch(a){e=!0,f=a}finally{try{!d&&h.return&&h.return()}finally{if(e)throw f}}}else c.push(this.helpLine("//"+b.name,this.formatArgs(b.desc)));var k=!0,l=!1,m=void 0;try{for(var n,o,p=b.aliases[Symbol.iterator]();!(k=(n=p.next()).done);k=!0)o=n.value,c.push(this.helpLine("//"+o,"Alias for command //"+b.name))}catch(a){l=!0,m=a}finally{try{!k&&p.return&&p.return()}finally{if(l)throw m}}return c}},{key:"arg",value:function b(a){return"<span class=\"arg\">"+a.escape()+"</span>"}},{key:"helpLine",value:function f(a,b){var c=!!(2<arguments.length&&void 0!==arguments[2])&&arguments[2],d="<div>"+(c?a.escape():a)+"</div>",e="<div>"+(c?b.escape():b)+"</div>";return"<div class=\"helpline\">"+d+e+"</div>"}},{key:"formatArgs",value:function c(a){var b=this;return a.replace(/<([^>]+)>/g,function(a,c){return"&lt;"+b.arg(c)+"&gt;"})}},{key:"printUsage",value:function h(a){Content.addHelp("Usage:");var b=!0,c=!1,d=void 0;try{for(var e,f,g=this.formatUsage(a)[Symbol.iterator]();!(b=(e=g.next()).done);b=!0)f=e.value,Content.addHelp(f)}catch(a){c=!0,d=a}finally{try{!b&&g.return&&g.return()}finally{if(c)throw d}}}},{key:"printHelp",value:function b(a){Content.addHelp(this.formatHelp(a))}},{key:"command_help",value:function w(a,b){if(0===b.length){Content.addHelp("Commands:");var d=!0,e=!1,f=void 0;try{for(var g,h,i=Object.values(this._command_list)[Symbol.iterator]();!(d=(g=i.next()).done);d=!0)h=g.value,Content.addHelp(this.formatHelp(this._commands[h]))}catch(a){e=!0,f=a}finally{try{!d&&i.return&&i.return()}finally{if(e)throw f}}Content.addHelp(this.formatArgs("Enter //help <command> for help on <command>"));var j=!0,k=!1,l=void 0;try{for(var m,n,o=this._help_text[Symbol.iterator]();!(j=(m=o.next()).done);j=!0)n=m.value,Content.addHelp(n)}catch(a){k=!0,l=a}finally{try{!j&&o.return&&o.return()}finally{if(k)throw l}}}else if(this.hasCommand(b[0])){Content.addHelp("Commands:");var p=this.getCommand(b[0]),q=!0,r=!1,s=void 0;try{for(var t,u,v=this.formatUsage(p)[Symbol.iterator]();!(q=(t=v.next()).done);q=!0)u=t.value,Content.addHelp(u)}catch(a){r=!0,s=a}finally{try{!q&&v.return&&v.return()}finally{if(r)throw s}}}else Content.addError("Invalid command "+b[0].escape())}}]),a}();function command_log(a,c){var d=Number.isNaN,f=Number.parseInt,g=Math.floor,h=0<c.length?c[0]:"",e=Util.GetWebStorage("debug-msg-log")||[],j=function(a,b){return a+" "+b+(1===a?"":"s")};if(Content.addHelp("Debug message log length: "+e.length),!(0<c.length))this.printUsage();else if("help"===h)this.printHelp(),this.printUsage();else if("show"===h){var k=!0,m=!1,o=void 0;try{for(var p,q=Object.entries(e)[Symbol.iterator]();!(k=(p=q.next()).done);k=!0){var r=p.value,s=_slicedToArray(r,2),t=s[0],i=s[1];Content.addHelp(t+": "+JSON.stringify(i).escape())}}catch(a){m=!0,o=a}finally{try{!k&&q.return&&q.return()}finally{if(m)throw o}}}else if("export"===h){var l=.75*window.innerWidth,u=Util.Open("assets/log-export.html","TFCLogExportWindow",{menubar:"no",location:"no",resizable:"no",status:"no",scrollbars:"yes",dependent:"yes",width:""+g(l)});u&&(u.onload=function(){this.addEntries(e)})}else if("summary"===h){var v=[],w=[],x=!0,y=!1,z=void 0;try{for(var A,B,C=Object.values(e)[Symbol.iterator]();!(x=(A=C.next()).done);x=!0)B=A.value,w.push(B._cmd||JSON.stringify(B).substr(0,10)),10<=w.length&&(v.push(w),w=[])}catch(a){y=!0,z=a}finally{try{!x&&C.return&&C.return()}finally{if(y)throw z}}0<w.length&&v.push(w);for(var D,E=0,F=0;F<v.length;++F)D=v[F],Content.addHelp(E+"-"+(E+D.length-1)+": "+JSON.stringify(D)),E+=D.length}else if(-1<["search","filter","filter-out"].indexOf(h)){if(1<c.length){var G=c.slice(1).join(" "),H=[],I=[],J=!0,K=!1,L=void 0;try{for(var M,N=Object.entries(e)[Symbol.iterator]();!(J=(M=N.next()).done);J=!0){var O=M.value,P=_slicedToArray(O,2),Q=P[0],R=P[1],S=JSON.stringify(R).includes(G);"filter-out"===h&&(S=!S),S?I.push([Q,R]):H.push([Q,R])}}catch(a){K=!0,L=a}finally{try{!J&&N.return&&N.return()}finally{if(K)throw L}}var ea=j(I.length,"item");if(Content.addHelp(("Found "+ea+" containing \""+G+"\"").escape()),"search"===h){var T=!0,U=!1,V=void 0;try{for(var W,X=I[Symbol.iterator]();!(T=(W=X.next()).done);T=!0){var Y=W.value,Z=_slicedToArray(Y,2),_=Z[0],aa=Z[1],ba=aa._cmd||JSON.stringify(aa).substr(0,10);Content.addHelp(_+": "+ba)}}catch(a){U=!0,V=a}finally{try{!T&&X.return&&X.return()}finally{if(U)throw V}}}else Content.addHelp("Removing "+H.length+"/"+e.length+" items"),Content.addHelp("New logs length: "+I.length),Util.SetWebStorage("debug-msg-log",I.map(function(a){return a[1]}))}else Content.addHelp("Usage: //log "+h+" &lt;string&gt;");}else if("remove"===h){var fa=c.slice(1).map(function(a){return f(a)}).filter(function(a){return!d(a)});if(0<fa.length){Content.addHelp("Removing "+j(fa.length,"item"));for(var ca=[],da=0;da<e.length;++da)-1===fa.indexOf(da)&&ca.push(e[da]);Content.addHelp("New logs length: "+ca.length),Util.SetWebStorage("debug-msg-log",ca)}else Content.addHelp("No items to remove")}else if("shift"===h)e.shift(),Content.addHelp("New logs length: "+e.length),Util.SetWebStorage("debug-msg-log",e);else if("pop"===h)e.pop(),Content.addHelp("New logs length: "+e.length),Util.SetWebStorage("debug-msg-log",e);else if("size"===h){var n=JSON.stringify(e).length;Content.addHelp("Logged bytes: "+n+" ("+n/1024+" KB)")}else if("clear"===h)Util.SetWebStorage("debug-msg-log",[]),Content.addHelp("Log cleared");else if(!d(f(h))){Content.addHelp(JSON.stringify(e[+h]).escape())}else Content.addHelp("Unknown argument "+h.escape())}function command_clear(a,b){if(0===b.length)$(".content").find(".line-wrapper").remove();else if(b[0].match(/module[\d]+/)){var c=document.getElementById(b[0]);c?$(c).find(".line-wrapper").remove():Content.addHelp("Unknown module "+b[0])}else this.printUsage()}function command_join(a,b,c){0<b.length?c.JoinChannel(b[0]):this.printUsage()}function command_part(a,b,c){0<b.length?c.LeaveChannel(b[0]):this.printUsage()}function command_badges(a,c,d){var e=[],f=!0,g=!1,h=void 0;/* Obtain global badges */try{for(var i,j=Object.entries(d.GetGlobalBadges())[Symbol.iterator]();!(f=(i=j.next()).done);f=!0){var k=i.value,l=_slicedToArray(k,2),m=l[0],n=l[1],o=!0,p=!1,q=void 0;try{for(var r,s=Object.values(n.versions)[Symbol.iterator]();!(o=(r=s.next()).done);o=!0){var t=r.value,u=t.image_url_2x,v=36;-1<c.indexOf("small")?(u=t.image_url_1x,v=18):-1<c.indexOf("large")&&(u=t.image_url_4x,v=72);var L="width=\""+v+"\" height=\""+v+"\" title=\""+m+"\"";e.push("<img src=\""+u+"\" "+L+" alt=\""+m+"\" />")}}catch(a){p=!0,q=a}finally{try{!o&&s.return&&s.return()}finally{if(p)throw q}}}/* Print global badges */}catch(a){g=!0,h=a}finally{try{!f&&j.return&&j.return()}finally{if(g)throw h}}Content.addNotice(e.join(""));/* Obtain channel badges */var w=!0,x=!1,y=void 0;try{for(var z,A,B=d.GetJoinedChannels()[Symbol.iterator]();!(w=(z=B.next()).done);w=!0){A=z.value,e=[];var C=!0,D=!1,E=void 0;try{for(var F,G=Object.entries(d.GetChannelBadges(A))[Symbol.iterator]();!(C=(F=G.next()).done);C=!0){var H=F.value,I=_slicedToArray(H,2),J=I[0],K=I[1],b=K.image||K.svg||K.alpha;e.push("<img src=\""+b+"\" "+"width=\"36\" height=\"36\""+" title=\""+J+"\" alt=\""+J+"\" />")}/* Print channel badges */}catch(a){D=!0,E=a}finally{try{!C&&G.return&&G.return()}finally{if(D)throw E}}Content.addNotice(Twitch.FormatChannel(A)+": "+e.join(""))}}catch(a){x=!0,y=a}finally{try{!w&&B.return&&B.return()}finally{if(x)throw y}}}function command_emotes(a,b,c){var d=c.GetEmotes(),f=[],g=[],h=[],i=!0,j=!1,l=void 0;try{for(var m,n=Object.entries(d)[Symbol.iterator]();!(i=(m=n.next()).done);i=!0){var o=m.value,p=_slicedToArray(o,2),q=p[0],k=p[1],r="<img src=\""+k+"\" title=\""+q.escape()+"\" alt=\""+q.escape()+"\" />";q.match(/^[a-z]/)?g.push(r):f.push(r)}}catch(a){j=!0,l=a}finally{try{!i&&n.return&&n.return()}finally{if(j)throw l}}if(-1<b.indexOf("global")&&h.push("Global: "+f.join("")),-1<b.indexOf("channel")&&h.push("Channel: "+g.join("")),-1<b.indexOf("bttv")){var e=c.GetGlobalBTTVEmotes(),s=[],t=!0,u=!1,v=void 0;try{for(var w,x=Object.entries(e)[Symbol.iterator]();!(t=(w=x.next()).done);t=!0){var y=w.value,z=_slicedToArray(y,2),A=z[0],B=z[1],C=A.escape();s.push("<img src=\""+B.url+"\" title=\""+C+"\" alt=\""+C+"\" />")}}catch(a){u=!0,v=a}finally{try{!t&&x.return&&x.return()}finally{if(u)throw v}}h.push("BTTV: "+s.join(""))}if(0===h.length)this.printHelp(),this.printUsage();else{var D=!0,E=!1,F=void 0;try{for(var G,H,I=h[Symbol.iterator]();!(D=(G=I.next()).done);D=!0)H=G.value,Content.addNotice(H)}catch(a){E=!0,F=a}finally{try{!D&&I.return&&I.return()}finally{if(E)throw F}}}}function command_plugins(){try{var a=!0,b=!1,c=void 0;try{for(var d,e=Object.entries(Plugins.plugins)[Symbol.iterator]();!(a=(d=e.next()).done);a=!0){var f=d.value,g=_slicedToArray(f,2),h=g[0],i=g[1],j=(h+": "+i.file+" @ "+i.order).escape();if(i._error){var k=JSON.stringify(i._error_obj).escape();Content.addError(j+": Failed: "+k)}else i._loaded&&(j+=": Loaded",i.commands&&(j=j+": Commands: "+i.commands.join(" ")),Content.addPre(j))}}catch(a){b=!0,c=a}finally{try{!a&&e.return&&e.return()}finally{if(b)throw c}}}catch(a){if("ReferenceError"===a.name)Content.addError("Plugin information unavailable");else throw a}}function command_client(a,b,d){if(0===b.length||"status"===b[0]){var e=d.ConnectionStatus(),f=d.GetJoinedChannels(),g=d.SelfUserState()||{};if(Content.addHelp("Client information:"),Content.addHelpLine("Socket:",e.open?"Open":"Closed"),Content.addHelpLine("Status:",e.connected?"Connected":"Not connected"),Content.addHelpLine("Identified:",e.identified?"Yes":"No"),Content.addHelpLine("Authenticated:",e.authed?"Yes":"No"),Content.addHelpLine("Name:",d.GetName()),Content.addHelpLine("FFZ:",d.FFZEnabled()?"Enabled":"Disabled"),Content.addHelpLine("BTTV:",d.BTTVEnabled()?"Enabled":"Disabled"),f&&0<f.length){Content.addHelp("&gt; Channels connected to: "+f.length);var h=!0,i=!1,j=void 0;try{for(var k,l=f[Symbol.iterator]();!(h=(k=l.next()).done);h=!0){var m=k.value,c=g[m],n=d.GetChannelInfo(m),o=n&&n.users?n.users.length:0,p=n.rooms||{},q=(n.online?"":"not ")+"online";Content.addHelpLine(m,"Status: "+q+"; id="+n.id),Content.addHelpLine("&nbsp;","Active users: "+o),Content.addHelpLine("&nbsp;","Rooms: "+Object.keys(p)),Content.addHelp("User information for "+m+":"),c.color&&Content.addHelpLine("Color",c.color),c.badges&&Content.addHelpLine("Badges",JSON.stringify(c.badges)),Content.addHelpLine("Name",""+c["display-name"])}}catch(a){i=!0,j=a}finally{try{!h&&l.return&&l.return()}finally{if(i)throw j}}}Content.addHelpLine("User ID",""+g.userid)}else this.printUsage()}function command_raw(a,b,c){c.SendRaw(b.join(" "))}function command_to(a,b,c){if(2<=b.length){var d=Twitch.ParseChannel(b[0]),e=b.slice(2).join(" ");c.SendMessge(d,e)}else this.printUsage()}/* Default command definition
 * Structure:
 *  <name>: {
 *    func: <function>,
 *    desc: description of the command (used by //help)
 *    alias: array of command aliases (optional)
 *    usage: array of usage objects:
 *      [0]: string, array, or null: parameter name(s)
 *      [1]: description
 *      [2]: formatting options (optional)
 *  }
 */var DefaultCommands={log:{func:command_log,desc:"Display or manipulate logged messages",alias:["logs"],usage:[[null,"Display log command usage"],["<number>","Display the message numbered <number>"],["show","Display all logged messages (can be a lot of text!)"],["summary","Display a summary of the logged messages"],["search <string>","Show logs containing <string>"],["remove <index...>","Remove items with the given indexes"],["filter <string>","Remove items that don't contain <string>"],["filter-out <string>","Remove items containing <string>"],["shift","Remove the first logged message"],["pop","Remove the last logged message"],["export","Open a new window with all the logged items"],["size","Display the number of bytes used by the log"],["clear","Clears the entire log (cannot be undone!)"]]},clear:{func:command_clear,desc:"Clears all text from either all modules or the specified module",alias:["nuke"],usage:[[null,"Clears all text from all visible modules"],["<module>","Clears all text from <module> (module1, module2)"]]},join:{func:command_join,desc:"Join a channel",alias:["j"],usage:[["<channel>","Connect to <channel>; leading # is optional"]]},part:{func:command_part,desc:"Leave a channel",alias:["p","leave"],usage:[["<channel>","Disconnect from <channel>; leading # is optional"]]},badges:{func:command_badges,desc:"Display all known badges"},emotes:{func:command_emotes,desc:"Display the requested emotes",usage:[["<kinds>","Display emotes; <kinds> can be one or more of: global, channel, bttv"]]},plugins:{func:command_plugins,desc:"Display plugin information, if plugins are enabled"},client:{func:command_client,desc:"Display numerous things about the client",usage:[[null,"Show general information about the client"],["status","Show current connection information"]]},raw:{func:command_raw,desc:"Send a raw message to Twitch (for advanced users only!)",usage:[["<message>","Send <message> to Twitch servers (for advanced users only!)"]]},to:{func:command_to,desc:"Send a command to a specific joined channel",usage:[["<channel> <message>","Send <message> to <channel>"]]}},ChatCommands=null;function InitChatCommands(){ChatCommands=new ChatCommandManager;var a=!0,b=!1,c=void 0;try{for(var d,e=Object.entries(DefaultCommands)[Symbol.iterator]();!(a=(d=e.next()).done);a=!0){var f=d.value,g=_slicedToArray(f,2),h=g[0],i=g[1];if(ChatCommands.add(h,i.func,i.desc),i.usage){var j=!0,k=!1,l=void 0;try{for(var m,n,o=i.usage[Symbol.iterator]();!(j=(m=o.next()).done);j=!0)n=m.value,ChatCommands.addUsage(h,n[0],n[1],n[2])}catch(a){k=!0,l=a}finally{try{!j&&o.return&&o.return()}finally{if(k)throw l}}}if(i.alias){var p=!0,q=!1,r=void 0;try{for(var s,t,u=i.alias[Symbol.iterator]();!(p=(s=u.next()).done);p=!0)t=s.value,ChatCommands.addAlias(t,h)}catch(a){q=!0,r=a}finally{try{!p&&u.return&&u.return()}finally{if(q)throw r}}}}}catch(a){b=!0,c=a}finally{try{!a&&e.return&&e.return()}finally{if(b)throw c}}}/* vim: set ts=2 sts=2 sw=2 et: */