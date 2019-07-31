/* Twitch Filtered Chat Loader */

"use strict";

/* Module names (also used as directory names) */
const MOD_TFC = "twitch-filtered-chat";
const MOD_TWAPI = "twitch-api";

/* Obtain information based on window.location and navigator.userAgent */
const URI = `${window.location}`;
const IS_TESLA = Boolean(navigator.userAgent.match(/\bTesla\b/));
const USE_DIST = IS_TESLA || Boolean(window.location.search.match(/\busedist\b/));
const BASE_URI = URI.substr(0, URI.indexOf(MOD_TFC)).replace(/\/$/, "");
const SELF_URI = URI.replace(/\/index.html(\?.*)?$/, "");
const GIT_URL = "https://kaedenn.github.io/twitch-filtered-chat/index.html";
const CUR_URL = (() => {
  let l = window.location;
  return `${l.protocol}//${l.hostname}${l.pathname}`;
})();

/* Paths to modules */
function addDistPath(base) {
  return base + (USE_DIST ? "/dist" : "");
}
const PATH_TFC = addDistPath(SELF_URI);
const PATH_TWAPI_EXTERNAL = addDistPath(BASE_URI + "/" + MOD_TWAPI);
const PATH_TWAPI_INTERNAL = addDistPath(SELF_URI + "/" + MOD_TWAPI);

/* Determine the order of the twapi modules */
const PATH_TWAPIS = (() => {
  let externalFirst = [PATH_TWAPI_EXTERNAL, PATH_TWAPI_INTERNAL];
  let internalFirst = [PATH_TWAPI_INTERNAL, PATH_TWAPI_EXTERNAL];
  if (window.location.search.indexOf("twapi=") > -1) {
    if (window.location.search.indexOf("twapi=e") > -1) {
      return externalFirst;
    } else if (window.location.search.indexOf("twapi=i") > -1) {
      return internalFirst;
    }
  }
  if (window.location.protocol === "file:") {
    return externalFirst;
  } else {
    return internalFirst;
  }
})();

/* Asset storage object */
var ASSETS = {};

/* Layout {{{0 */

/* Obtain the layout to use */
function GetLayout() { /* exported GetLayout */
  return ParseLayout(Util.ParseQueryString().layout || "double:chat");
}

/* Parse layout= query string value */
function ParseLayout(str) { /* exported ParseLayout */
  let layout = {Cols: null, Chat: true, Slim: false};
  if (str.indexOf(":") > -1) {
    let v1 = str.substr(0, str.indexOf(":"));
    let v2 = str.substr(str.indexOf(":")+1);
    if (v1 === "single") {
      layout.Cols = "single";
    } else if (v1 === "double") {
      layout.Cols = "double";
    } else {
      console.warn(`Unknown layout "${v1}"; defaulting to double`);
      layout.Cols = "double";
    }
    if (v2 === "nochat") {
      layout.Chat = false;
    } else if (v2 === "slim") {
      layout.Slim = true;
      layout.Chat = false;
    } else if (v2 !== "chat") {
      console.warn("Unknown layout option", v2);
    }
  } else if (str === "single") {
    layout.Cols = "single";
  } else if (str === "double") {
    layout.Cols = "double";
  } else if (str === "tesla") {
    layout.Cols = "single";
    layout.Chat = false;
    layout.Slim = true;
    layout.Tesla = true;
  } else {
    console.error("Failed to parse layout", str);
  }
  return layout;
}

/* Generate layout= query string value */
function FormatLayout(layout) { /* exported FormatLayout */
  if (layout.Tesla) {
    return "tesla";
  } else {
    let [k, v] = ["", ""];
    if (layout.Cols === "single") {
      k = "single";
    } else if (layout.Cols === "double") {
      k = "double";
    }
    if (layout.Slim) {
      v = "slim";
    } else if (layout.Chat) {
      v = "chat";
    } else {
      v = "nochat";
    }
    return `${k}:${v}`;
  }
}

/* End of layout functions 0}}} */

/* Add an asset to be loaded; returns a Promise */
function AddAsset(src, tree=null, loadcb=null, errcb=null) {
  /* Callback defaults */
  let loadFunc = loadcb || (() => null);
  let errorFunc = errcb || (() => null);
  /* Determine the final path to the asset */
  let path = (tree ? tree + "/" : "") + src;
  if (src.startsWith("//")) {
    path = window.location.protocol + src;
  }
  console.debug(`${src} @ ${tree} -> ${path}`);

  /* Prevent double-loading */
  if (ASSETS[path]) {
    throw new Error(`Duplicate asset ${path}: ${JSON.stringify(ASSETS[path])}`);
  }

  /* Construct and load the asset */
  let asset = ASSETS[path] = {};
  return new Promise(function(resolve, reject) {
    console.info("About to load asset", path);
    asset.file = src;
    asset.src = path;
    asset.tree = tree;
    asset.loaded = false;
    asset.error = false;
    asset.script = document.createElement("script");
    asset.script.setAttribute("type", "text/javascript");
    asset.script.setAttribute("src", asset.src);
    asset.script.onload = function() {
      console.log(`${asset.src} loaded`);
      asset.loaded = true;
      loadFunc(asset);
      resolve(asset);
    };
    asset.script.onerror = function(e) {
      console.error("Failed loading", asset, e);
      asset.error = true;
      errorFunc(asset, e);
      reject(e);
    };
    document.head.appendChild(asset.script);
  });
}

/* Called by body.onload */
function Main(global) { /* exported Main */
  /* Populate templates and load the client */
  function indexMain() {
    /* Determine the logging level */
    if (typeof window !== "undefined"
        && window.location
        && window.location.search
        && window.location.search.match(/[&?]debug=[^&]/)) {
      Util.DebugLevel = Util.LEVEL_DEBUG;
    }

    Util.LogOnly("Assets loaded; initializing page...");

    /* Remove the top-level "Loading" message */
    $("#wrapper #wrapper-loading").remove();

    /* Obtain a layout to use */
    let layout = GetLayout();

    /* Create the chat input elements */
    let $ChatBox = $(`<textarea id="txtChat"></textarea>`)
      .attr("placeholder", "Send a message");
    let $Chat = $(`<div id="chat"></div>`).append($ChatBox);

    /* Apply default settings and formatting */
    let $Columns = $(".column");
    let $Modules = $(".module");
    let [$Column1, $Column2] = [$("#column1"), $("#column2")];
    let [$Module1, $Module2] = [$("#module1"), $("#module2")];
    /* Default: all checkboxes are checked */
    $Modules.find(".header .settings input[type=\"checkbox\"]")
            .attr("checked", "checked");
    /* Default: modules are named "Chat" */
    $Modules.find(".header label.name").val("Chat");
    $Modules.find(".header input.name").attr("value", "Chat");

    /* Apply single-column layout */
    if (layout.Cols === "single") {
      $Column1.removeClass("left").addClass("full");
      $Module1.removeClass("left").addClass("full");
      $Column1.show();
      $Column2.remove();
    } else {
      $Columns.show();
    }

    /* Add the chat box */
    if (layout.Chat) {
      let $ChatModule = layout.Cols === "single" ? $Module1 : $Module2;
      $ChatModule.removeClass("no-chat");
      $ChatModule.addClass("has-chat");
      $ChatModule.append($Chat);
    }

    /* Shrink the content for the Tesla */
    if (layout.Tesla) {
      $(".module .content").css("height", "calc(100% - 2em)");
    }

    /* If slim layout, remove the entire header */
    if (layout.Slim) {
      $("body").addClass("tfc-slim");
      $(".module").addClass("slim");
      $(".content").addClass("slim");
      $(".header").hide();
      $("#btnSettings").hide();
    }

    /* Initialize the chat commands object */
    InitChatCommands();

    Util.LogOnly("Waiting for document to finish rendering...");

    /* Once rerendering is complete, start up the client */
    requestAnimationFrame(() => {
      /* Focus on the chat texarea */
      let c = document.getElementById("txtChat");
      if (c && c.focus) c.focus();
      /* Call doLoadClient to construct the filtered chat */
      Util.LogOnly("Document rendered; setting up TFC...");
      try {
        doLoadClient();
      } catch(e) {
        console.error(e);
        if (e.name === "ReferenceError") {
          let m = e.message || "";
          if (m.match(/\bdoLoadClient\b.*(?:not |un)defined\b/)) {
            alert("FATAL: filtered-chat.js failed to load");
          }
        } else {
          let msg = "doLoadClient error: " + e.toString();
          if (e.stack) {
            msg += ";\nstack: " + e.stack.toString();
          }
          alert(msg);
        }
        throw e;
      }
    });
  }

  /* Extend jQuery with some useful methods */
  (function($jQuery) {
    /* Check or uncheck a checkbox (e.check(), e.check(false)) */
    $jQuery.fn.check = function(...args) {
      let cond = args.length > 0 ? Boolean(args[0]) : true;
      this.each((i, n) => {
        n.checked = cond;
        n.setAttribute("checked", "checked");
        n.dispatchEvent(new Event("change"));
      });
    };
    /* Uncheck a checkbox */
    $jQuery.fn.uncheck = function() {
      this.each((i, n) => {
        n.checked = false;
        n.removeAttribute("checked");
        n.dispatchEvent(new Event("change"));
      });
    };
  })(jQuery);

  /* Load the TWAPI assets, trying each path until success */
  AddAsset("utility.js", PATH_TWAPIS[0], null, null)
  .then(() => AddAsset("client.js", PATH_TWAPIS[0], null, null))
  .catch(() => AddAsset("utility.js", PATH_TWAPIS[1], null, null)
    .then(() => AddAsset("client.js", PATH_TWAPIS[1], null, null)))
  /* Then load the config script */
  .then(() => AddAsset("config.js", PATH_TFC, null, null))
  /* Then load TFC */
  .then(() => Promise.all([
    AddAsset("htmlgen.js", PATH_TFC, null, null),
    AddAsset("commands.js", PATH_TFC, null, null),
    AddAsset("filtered-chat.js", PATH_TFC, null, null),
    AddAsset("plugins/plugins.js", PATH_TFC, null, null)]))
  /* Then load the fanfare scripts */
  .then(() => Promise.all([
    AddAsset("fanfare/particle.js", PATH_TFC),
    AddAsset("fanfare/effect.js", PATH_TFC),
    AddAsset("fanfare/fanfare.js", PATH_TFC)
  ]))
  /* And finally call main */
  .then(indexMain)
  .catch((e) => {
    console.error(e);
    let msg = "TWAPI/TFC Failure ";
    let t = e.target || e.srcElement || e.originalTarget || e;
    if (!t) {
      msg += "while loading unknown target";
    } else if (t.attributes && t.attributes.src && t.attributes.src.value) {
      msg += "while loading " + t.attributes.src.value;
    } else if (t.outerHTML) {
      msg += "while loading " + t.outerHTML;
    } else if (t.nodeValue) {
      msg += "while loading " + t.nodeValue;
    } else {
      msg += "while loading " + t;
    }
    msg += `:\n${e}` + (e.stack ? `;\nstack: ${e.stack}` : ``);
    console.error(msg, e);
    alert(msg);
  });
}

/* eslintrc config: */
/* exported MOD_TFC MOD_TWAPI USE_DIST URI BASE_URI SELF_URI GIT_URL CUR_URL */
/* exported PATH_TFC */
/* globals InitChatCommands doLoadClient */

/* vim: set ts=2 sts=2 sw=2 et: */
