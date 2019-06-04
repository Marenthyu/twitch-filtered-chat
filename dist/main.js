/* Twitch Filtered Chat Driver Script */"use strict";/* Module names (also used as directory names) */var MOD_TFC="twitch-filtered-chat",MOD_TWAPI="twitch-api",URI=""+window.location,IS_TESLA=!!navigator.userAgent.match(/\bTesla\b/),ASK_DIST=!!window.location.search.match(/\busedist\b/),USE_DIST=ASK_DIST||IS_TESLA,BASE_URI=URI.substr(0,URI.indexOf("twitch-filtered-chat")).replace(/\/$/,""),SELF_URI=URI.replace(/\/index.html(\?.*)?$/,""),PATH_TFC=SELF_URI+(USE_DIST?"/dist":""),PATH_TWAPI=BASE_URI+"/"+"twitch-api"+(USE_DIST?"/dist":""),ASSETS={};/* Obtain information based on window.location and navigator.userAgent *//* Paths to modules *//* Asset storage object *//* Log things to the console, usable even if the console is disabled */function _console(a){if(console&&console[a]){for(var b,c=arguments.length,d=Array(1<c?c-1:0),e=1;e<c;e++)d[e-1]=arguments[e];return(b=console)[a].apply(b,d)}}function _console_error(){for(var a=arguments.length,b=Array(a),c=0;c<a;c++)b[c]=arguments[c];return _console.apply(void 0,["error"].concat(b))}function _console_warn(){for(var a=arguments.length,b=Array(a),c=0;c<a;c++)b[c]=arguments[c];return _console.apply(void 0,["warn"].concat(b))}function _console_log(){for(var a=arguments.length,b=Array(a),c=0;c<a;c++)b[c]=arguments[c];return _console.apply(void 0,["log"].concat(b))}function _console_info(){for(var a=arguments.length,b=Array(a),c=0;c<a;c++)b[c]=arguments[c];return _console.apply(void 0,["info"].concat(b))}function _console_debug(){for(var a=arguments.length,b=Array(a),c=0;c<a;c++)b[c]=arguments[c];return _console.apply(void 0,["debug"].concat(b))}/* Parse layout= query string value */function ParseLayout(a){/* exported ParseLayout */var b={Cols:null,Chat:!0,Slim:!1};if(-1<a.indexOf(":")){var c=a.substr(0,a.indexOf(":")),d=a.substr(a.indexOf(":")+1);"single"===c?b.Cols="single":"double"===c?b.Cols="double":(_console_warn("Unknown layout",c,"defaulting to double"),b.Cols="double"),"nochat"===d?b.Chat=!1:"slim"===d?(b.Slim=!0,b.Chat=!1):"chat"!==d&&_console_warn("Unknown layout option",d)}else"single"===a?b.Cols="single":"double"===a?b.Cols="double":"tesla"===a?(b.Cols="single",b.Chat=!1,b.Slim=!0,b.Tesla=!0):_console_error("Failed to parse layout",a);return b}/* Generate layout= query string value */function FormatLayout(a){/* exported FormatLayout */var b="",c="";return a.Tesla?"tesla":("single"===a.Cols?b="single":"double"===a.Cols&&(b="double"),c=a.Slim?"slim":a.Chat?"chat":"nochat",b+":"+c)}/* Add an asset to be loaded; returns a Promise */function AddAsset(a){var b=1<arguments.length&&void 0!==arguments[1]?arguments[1]:null,c=2<arguments.length&&void 0!==arguments[2]?arguments[2]:null,d=3<arguments.length&&void 0!==arguments[3]?arguments[3]:null,e=a;/* Determine the final path to the asset *//* Prevent double-loading */if(b===MOD_TFC?e=PATH_TFC+"/"+a:b===MOD_TWAPI?e=PATH_TWAPI+"/"+a:a.startsWith("//")&&(e=window.location.protocol+a),_console_debug(a+" @ "+b+" -> "+e),ASSETS[e]){var g=JSON.stringify(ASSETS[e]);throw new Error("Asset "+e+" already added: "+g)}/* Construct and load the asset */ASSETS[e]={};var f=ASSETS[e];return new Promise(function(g,h){_console_info("About to load asset",e),f.file=a,f.src=e,f.tree=b,f.loaded=!1,f.error=!1,f.script=document.createElement("script"),f.script.setAttribute("type","text/javascript"),f.script.setAttribute("src",f.src),f.script.onload=function(){_console_debug("Loaded",f),_console_log(f.src+" loaded"),f.loaded=!0,c&&c(f),g(f)},f.script.onerror=function(a){_console_error("Failed loading",f,a),f.error=!0,d&&d(f,a),h(a)},document.head.appendChild(f.script)})}/* Called by body.onload */function Main(){/* Add TWAPI assets, then TFC assets, and then call index_main */Promise.all([AddAsset("utility.js",MOD_TWAPI,null,null),AddAsset("client.js",MOD_TWAPI,null,null)]).then(function(){return AddAsset("config.js",MOD_TFC,null,null)}).then(function(){return Promise.all([AddAsset("htmlgen.js",MOD_TFC,null,null),AddAsset("commands.js",MOD_TFC,null,null),AddAsset("filtered-chat.js",MOD_TFC,null,null),AddAsset("plugins/plugins.js",MOD_TFC,null,null)])}).then(/* exported Main *//* Populate templates and load the client */function(){Util.LogOnly("Assets loaded; initializing page..."),$("#wrapper #wrapper-loading").remove();/* Obtain a layout to use */var a=Util.ParseQueryString().layout||"double:chat",b=ParseLayout(a),c=$("<textarea id=\"txtChat\"></textarea>");/* Create the chat input elements */c.attr("placeholder","Send a message").attr("hist-index","-1");var d=$("<div id=\"chat\"></div>").append(c),e=$(".column"),f=$(".module"),g=[$("#column1"),$("#column2")],h=g[0],i=g[1],j=[$("#module1"),$("#module2")],k=j[0],l=j[1];/* Apply default settings and formatting *//* Default: all checkboxes are checked *//* Add the chat box */if(f.find(".header .settings input[type=\"checkbox\"]").attr("checked","checked"),f.find(".header label.name").val("Chat"),f.find(".header input.name").attr("value","Chat"),"single"===b.Cols?(h.removeClass("left").addClass("full"),k.removeClass("left").addClass("full"),h.show(),i.remove()):e.show(),b.Chat){var m=null;m="single"===b.Cols?k:l,m.removeClass("no-chat"),m.addClass("has-chat"),m.append(d)}/* Shrink the content for the Tesla */b.Tesla&&$(".module .content").css("height","calc(100% - 2em)"),b.Slim&&($(".header").hide(),$("body").addClass("tfc-slim"),$(".module").addClass("slim"),$(".content").addClass("slim"),$("#btnSettings").hide()),InitChatCommands(),Util.LogOnly("Waiting for document to finish rendering..."),requestAnimationFrame(function(){/* Focus on the chat texarea */var a=document.getElementById("txtChat");a&&a.focus&&a.focus(),Util.LogOnly("Document rendered; setting up TFC...");try{client_main(b)}catch(a){if(_console_error(a),"ReferenceError"===a.name){var c=a.message||"";c.match(/\bclient_main\b.*(?:not |un)defined\b/)&&alert("FATAL: filtered-chat.js failed to load")}else{var d="client_main error: "+a.toString();a.stack&&(d+=";\nstack: "+a.stack.toString()),alert(d)}throw a}})}).catch(function(a){var b="TWAPI/TFC Failure: ",c=a.target||a.srcElement||a.originalTarget;b+=c.attributes&&c.attributes.src&&c.attributes.src.value?"while loading "+c.attributes.src.value:c.outerHTML?"while loading "+c.outerHTML:c.nodeValue?"while loading "+c.nodeValue:"while loading "+c,_console_error(b,a),a.stack&&(b+=": stack: "+a.stack),alert(b)})}/* vim: set ts=2 sts=2 sw=2 et: */