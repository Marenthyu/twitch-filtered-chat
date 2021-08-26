/* Twitch Filtered Chat Main Module */

"use strict";

/* FIXME:
 * Fanfares ignore cbAnimCheers
 */

/* AUTHENTICATION
 *
 * https://id.twitch.tv/oauth2/authorize
 *  ?response_type=token
 *  &client_id=<client-id>
 *  &redirect_uri=https://kaedenn.github.io/twitch-filtered-chat/index.html
 *  &scope=<scopes>
 *  &state=<secure random value>
 *
 * Optional:
 *  force_verify: boolean (default false)
 *  Enable to force verification every time
 *
 * Scopes: chat:edit+chat:read+channel:moderate
 *  bits:read perhaps?
 *
 * Redirect will be to
 *  https://kaedenn.github.io/twitch-filtered-chat/index.html
 *    #access_token=<OAuth token>
 *    &scope=<scopes>
 *    &state=<state>
 *    &token_type=bearer
 *  Note that this uses the hash fragment: window.location.hash
 *
 * Concerns:
 *  1) How do I verify &state? Should it be a secure hash of some
 *    client-supplied value? Use localStorage?
 *  2) How should the query string config values be replaced? Store them into
 *    localStorage, redirect to oauth2/authorize, then confirm values?
 *
 * Idea:
 *  1. Navigate to tfc/index.html?<options>
 *  2. Generate state value
 *  3. Store options with state into localStorage temporarily
 *  4. Redirect user to oauth2/authorize
 *  5. Obtain options and state from localStorage (and purge)
 *  6. If state matches, use token, otherwise discard with error
 */

/* TODO (in approximate decreasing priority):
 * Improve tests/effects.html
 *   Generate sample text for the selected effects
 *   Allow users to input text and select effects
 *   Display minimum number of bits required
 * Implement selClearStyle for all(?) ways to clear chat
 *   !tfc nuke
 *   CLEARCHAT
 *   CLEARMSG
 * Add to content to both of the settings help and builder links
 *   Change AssetPaths.BUILDER_WINDOW to use the new builder
 * Create a README.md file for the plugins directory. Include documentation on:
 *   Commands
 *   Filtering
 *   Plugin creation and loading
 *   Plugin configuration (?plugincfg)
 */

/* IDEAS:
 * Add layout selection box to #settings (reloads page on change)?
 * Allow for a configurable number of columns? Configurable layout?
 * Add re-include (post-exclude) filtering options for Mods, Bits, Subs, etc?
 */

/* Utility functions {{{0 */

/* Call func when the input element is changed */
function onChange(elem, func) {
  /* Default function wrapper */
  function wrapper(event) {
    return func.bind(this)(event);
  }
  for (const e of $(elem)) {
    const $e = $(e);
    if ($e.is("input")) {
      const type = $e.attr("type");
      if (type === "text") {
        /* input type=text: Enter keyup and blur */
        $e.keyup(function(event) {
          if (event.key === "Enter") {
            return func.bind(this)(event);
          }
        });
        $e.blur(wrapper);
      } else {
        /* Other input types: change */
        $e.change(wrapper);
      }
    } else {
      /* Other elements: change */
      $e.change(wrapper);
    }
  }
}

/* End utility functions 0}}} */

/* Document writing functions {{{0 */

class Content { /* exported Content */
  /* Add text: escapes */
  static add(text) {
    Content.addHTML($(`<span class="message"></span>`).text(text));
  }

  /* Add HTML: does not escape */
  static addHTML(content, container=null) {
    const $container = container ? $(container) : $(".module .content");
    const $line = $(`<div class="line line-wrapper"></div>`);
    if (typeof(content) === "string") {
      $line.html(content);
    } else if (content instanceof Node) {
      $line.append($(content));
    } else {
      $line.append(content);
    }
    $container.append($line);
    if (!$container.attr("data-no-scroll")) {
      $container.scrollTop(Math.pow(2, 31) - 1);
    }
  }

  /* Add "pre" content: does not escape */
  static addPre(content) {
    Content.addHTML($(`<div class="pre"></div>`).html(content));
  }

  /* Add "pre" text: escapes */
  static addPreText(content) {
    Content.addHTML($(`<div class="pre"></div>`).text(content));
  }

  /* Add info content: does not escape */
  static addInfo(content, pre=false) {
    const e = $(`<div class="info"></div>`).html(content);
    if (pre) e.addClass("pre");
    Content.addHTML(e);
  }

  /* Add info text: escapes */
  static addInfoText(content, pre=false) {
    const e = $(`<div class="info"></div>`).text(content);
    if (pre) e.addClass("pre");
    Content.addHTML(e);
  }

  /* Add notice (warning) content: does not escape */
  static addNotice(content, pre=false) {
    const e = $(`<div class="notice"></div>`).html(content);
    if (pre) e.addClass("pre");
    Content.addHTML(e);
  }

  /* Add notice (warning) text: escapes */
  static addNoticeText(content, pre=false) {
    const e = $(`<div class="notice"></div>`).text(content);
    if (pre) e.addClass("pre");
    Content.addHTML(e);
  }

  /* Add error content: does not escape */
  static addError(content, pre=false) {
    const e = $(`<div class="error"></div>`).html(content);
    if (pre) e.addClass("pre");
    Content.addHTML(e);
  }

  /* Add error text: escapes */
  static addErrorText(content, pre=false) {
    const e = $(`<div class="error"></div>`).text(content);
    if (pre) e.addClass("pre");
    Content.addHTML(e);
  }

  /* Add help content: does not escape */
  static addHelp(s) {
    Content.addPre($(`<div class="help"></div>`).html(s));
  }

  /* Add help text: escapes */
  static addHelpText(s) {
    Content.addPre($(`<div class="help"></div>`).text(s));
  }

  /* Add help line pair: escapes when escape=true (default false) */
  static addHelpLine(c, s, escape=false) {
    Content.addHelp(ChatCommands.helpLine(c, s, escape));
  }

  /* Add a help line with indent; escapes when escape=true (default false) */
  static addHelpTextLine(s, escape=false) {
    Content.addHelp(ChatCommands.helpTextLine(s, escape));
  }

  /* Add a help line pair with escaping */
  static addHelpLineE(c, s) {
    Content.addHelpLine(c, s, true);
  }

  /* Add a help line with indent and escaping */
  static addHelpTextLineE(s) {
    Content.addHelpTextLine(s, true);
  }
}

/* End document writing functions 0}}} */

/* Begin configuration section {{{0 */

/* Merge the query string into the config object given and return removals */
function parseQueryString(config, qs=null) {
  let qs_data = {}; /* Generated configuration */
  const qs_remove = []; /* List of keys to remove from window.location */
  const qs_obj = qs || window.location.search;

  /* Figure out what was passed */
  if (typeof(qs_obj) === "string") {
    qs_data = Util.ParseQueryString(qs_obj);
  } else if (typeof(qs_obj) === "object") {
    qs_data = qs_obj;
  } else {
    Util.Error("Refusing to parse strange query string object", qs_obj);
    /* Fall-through will generate a sane default configuration */
  }

  for (const [k, v] of Object.entries(qs_data)) {
    let [key, val] = [k, v];
    if (k === "clientid") {
      key = "ClientID";
      config.__clientid_override = true;
      qs_remove.push(k);
    } else if (k === "user" || k === "name" || k === "nick") {
      key = "Name";
    } else if (k === "pass" || k === "oauth") {
      key = "Pass";
      qs_remove.push(k);
    } else if (k === "channel" || k === "channels") {
      key = "Channels";
      val = v.split(",").map((c) => Twitch.FormatChannel(c));
    } else if (k === "debug") { /* debug level; see README for values */
      key = "Debug";
      if (typeof(v) === "boolean") {
        val = v;
      } else if (typeof(v) === "number") {
        val = Math.clamp(v, Util.LEVEL_MIN, Util.LEVEL_MAX);
      } else if (v === "debug") {
        val = Util.LEVEL_DEBUG;
      } else if (v === "trace") {
        val = Util.LEVEL_TRACE;
      } else if (v) {
        val = true;
      } else {
        val = false;
      }
    } else if (k === "noassets") { /* disable asset processing (for testing) */
      key = "NoAssets";
      val = Boolean(v);
    } else if (k === "noffz") { /* disable FFZ support */
      key = "NoFFZ";
      val = Boolean(v);
    } else if (k === "nobttv") { /* disable BTTV support */
      key = "NoBTTV";
      val = Boolean(v);
    } else if (k === "hmax") { /* max history for sent messages */
      key = "HistorySize";
      if (v === "inf") {
        val = Infinity;
      } else if (typeof(v) === "number") {
        val = v;
      } else {
        Util.WarnOnly(`Invalid hmax value ${v}; defaulting`);
        val = TwitchClient.DEFAULT_HISTORY_SIZE;
      }
    } else if (k.match(/^module[\d]*?$/)) { /* module configuration */
      if (k === "module") {
        key = "module1";
      } else {
        key = k;
      }
      val = parseModuleConfig(v);
    } else if (k === "trans" || k === "transparent") { /* transparent bg */
      key = "Transparent";
      val = 1;
    } else if (k === "layout") { /* overall layout choice */
      key = "Layout";
      val = ParseLayout(v);
    } else if (k === "norec") { /* do not reconnect on error */
      key = "NoAutoReconnect";
      val = true;
    } else if (k === "size") { /* overall font size (in pt) */
      key = "Size";
      val = `${v}pt`;
    } else if (k === "plugins") { /* enable/disable plugins */
      key = "Plugins";
      val = Boolean(v);
    } else if (k === "disable") { /* disable specific effect(s) */
      key = "DisableEffects";
      val = v.split(",");
    } else if (k === "enable") { /* enable specific effect(s) */
      key = "EnableEffects";
      val = v.split(",");
    } else if (k === "max") { /* max number of messages to display */
      key = "MaxMessages";
      if (v === "inf" || v === -1) {
        val = Infinity;
      } else if (typeof(v) === "number") {
        val = v;
      } else {
        val = TwitchClient.DEFAULT_MAX_MESSAGES;
        Util.WarnOnly(`Invalid max value ${v}; defaulting to ${val}`);
      }
    } else if (k === "font") { /* overall font override */
      key = "Font";
      val = `${v}`;
    } else if (k === "scroll") { /* enable/disable scrollbars */
      key = "Scroll";
      val = Boolean(v);
    } else if (k === "clips") { /* whether or not to display clip info */
      key = "ShowClips";
      val = Boolean(v);
    } else if (k === "plugincfg") { /* plugin-specific configuration */
      key = "PluginConfig";
      try {
        val = JSON.parse(v);
      } catch (e) {
        Util.Error(e);
        key = val = null;
      }
    } else if (k === "scheme") { /* light mode or dark mode */
      key = "ColorScheme";
      if (v === "light") {
        val = "light";
      } else if (v === "dark") {
        val = "dark";
      } else {
        Util.WarnOnly(`Invalid scheme value ${v}, defaulting to dark`);
        val = "dark";
      }
    } else if (k === "force" || k === "antics") { /* enable HTML/XSS injection */
      key = "EnableForce";
      val = Boolean(v);
    } else if (k === "fanfare") { /* enable/disable fanfare processing */
      key = "Fanfare";
      val = {enable: false};
      try {
        const valobj = JSON.parse(v);
        if (typeof(valobj) === "number") {
          val.enable = (valobj !== 0);
        } else if (typeof(valobj) === "boolean") {
          val.enable = valobj;
        } else if (typeof(valobj) === "object") {
          val = valobj;
          val.enable = true;
        } else {
          Util.Error("Don't know how to parse Fanfare value", valobj);
          key = val = null;
        }
      } catch (e) {
        Util.Error("Failed parsing Fanfare config; disabling", e, v);
        key = val = null;
      }
    } else if (k === "highlight") { /* words to highlight on */
      key = "Highlight";
      val = `${v}`.split(",").map((s) => Util.StringToRegExp(s, "g"));
    } else if (k === "urls") { /* enable formatting of URLs */
      key = "EnableURLs";
      val = Boolean(v);
    } else if (k === "wsuri") { /* WebSocket URI override */
      key = "WSURI";
    }
    /* Skip items with a falsy key */
    if (key) {
      config[key] = val;
    }
  }
  return qs_remove;
}

/* Obtain configuration key */
function getConfigKey() {
  const qs = Util.ParseQueryString();
  const val = qs.config_key || qs.key || qs["config-key"];
  let config_key = CFG_KEY;
  if (val) {
    config_key = config_key + "-" + val.replace(/[^a-z0-9_-]/g, "");
  }
  return config_key;
}

/* Obtain configuration */
function getConfigObject(inclSensitive=false) {
  /* 1) Obtain configuration values
   *  a) from localStorage
   *  b) from query string (overrides (a))
   *  c) from settings elements (overrides (b))
   *  d) from liveStorage (module settings only, overrides (c))
   * 2) Store module configuration in each modules' settings window
   * 3) Remove sensitive values from the query string, if present
   */
  let config_key = null;
  let config = null;

  /* Query String object, parsed */
  const qs = Util.ParseQueryString();

  /* Obtain configuration from local storage */
  if (qs.nols) {
    Util.DisableLocalStorage();
    config = {};
  } else {
    /* Determine configuration key */
    config_key = getConfigKey();
    Util.SetWebStorageKey(config_key);
    if (config_key !== CFG_KEY) {
      Util.LogOnlyOnce(`Using custom config key "${Util.GetWebStorageKey()}"`);
    }

    /* Obtain local storage configuration object */
    config = Util.GetWebStorage() || {};
    config.key = config_key;

    /* Purge obsolete configuration items */
    const obsolete_props = ["AutoReconnect", "NoForce"];
    let should_store = false;
    for (const prop of obsolete_props) {
      if (config.hasOwnProperty(prop)) {
        should_store = true;
        delete config[prop];
      }
    }
    if (should_store) {
      Util.SetWebStorage(config);
    }
  }

  /* Certain unwanted items may be preserved in localStorage */
  const purge_props = [
    "NoAssets", "Debug", "NoAutoReconnect", "Layout", "Transparent", "Plugins",
    "EnableEffects", "DisableEffects", "PluginConfig", "ColorScheme", "nols",
    "EnableForce"];
  for (const prop of purge_props) {
    if (config.hasOwnProperty(prop)) {
      delete config[prop];
    }
  }

  /* Parse the query string, storing items to remove */
  const query_remove = parseQueryString(config, qs);

  /* Ensure config.Channels is present for #settings configuration below */
  if (!Util.IsArray(config.Channels)) {
    config.Channels = [];
  }

  /* Obtain global settings config */
  const txtChannel = $("input#txtChannel");
  const txtNick = $("input#txtNick");
  const txtPass = $("input#txtPass");
  if (txtChannel.val()) {
    for (const ch of txtChannel.val().split(",")) {
      const channel = Twitch.FormatChannel(ch.toLowerCase());
      if (config.Channels.indexOf(channel) === -1) {
        config.Channels.push(channel);
      }
    }
  }

  if (txtNick.val() && txtNick.val() !== Strings.NAME_AUTOGEN) {
    config.Name = txtNick.val();
  }

  if (inclSensitive) {
    if (txtPass.val() && txtPass.val() !== Strings.PASS_CACHED) {
      config.Pass = txtPass.val();
    }
  }

  if (!config.hasOwnProperty("Scroll")) {
    config.Scroll = $("#cbScroll").is(":checked");
  }

  if (!config.hasOwnProperty("ShowClips")) {
    config.ShowClips = $("#cbClips").is(":checked");
  }

  if (!config.hasOwnProperty("EnableForce")) {
    config.EnableForce = $("#cbForce").is(":checked");
  }

  /* Populate configs from each module */
  $(".module").each(function _config_get_module_settings() {
    const id = $(this).attr("id");
    const toArray = (val) => Util.IsArray(val) ? val : [];
    if (!config[id]) {
      config[id] = getModuleSettings($(this));
    }
    /* Populate module configuration from liveStorage (if present) */
    if (window.liveStorage && window.liveStorage[id]) {
      for (const [k, v] of Object.entries(window.liveStorage[id])) {
        config[id][k] = v;
      }
    }
    /* Ensure all the settings have the proper types */
    config[id].Pleb = Boolean(config[id].Pleb);
    config[id].Sub = Boolean(config[id].Sub);
    config[id].VIP = Boolean(config[id].VIP);
    config[id].Mod = Boolean(config[id].Mod);
    config[id].Event = Boolean(config[id].Event);
    config[id].Bits = Boolean(config[id].Bits);
    config[id].Me = Boolean(config[id].Me);
    config[id].IncludeKeyword = toArray(config[id].IncludeKeyword);
    config[id].IncludeUser = toArray(config[id].IncludeUser);
    config[id].ExcludeUser = toArray(config[id].ExcludeUser);
    config[id].ExcludeStartsWith = toArray(config[id].ExcludeStartsWith);
    config[id].FromChannel = toArray(config[id].FromChannel);
  });

  /* See if there's any sensitive information we need to remove */
  if (query_remove.length > 0) {
    /* Store the configuration, including sensitive information */
    Util.SetWebStorage(config);
    /* Obtain the current query string */
    let old_query = Util.ParseQueryString(window.location.search.substr(1));
    let is_base64 = false;
    if (old_query.base64 && old_query.base64.length > 0) {
      is_base64 = true;
      old_query = Util.ParseQueryString(atob(old_query.base64));
    }
    /* Remove the sensitive items */
    for (const e of query_remove) {
      delete old_query[e];
    }
    /* Create and apply a new query string */
    let new_qs = Util.FormatQueryString(old_query);
    if (is_base64) {
      new_qs = "?base64=" + encodeURIComponent(btoa(new_qs));
    }
    /* This also reloads the page */
    window.location.search = new_qs;
  }

  /* Merge in top-level liveStorage items */
  if (window.liveStorage) {
    for (const key of Object.keys(window.liveStorage)) {
      if (!key.match(/^module[0-9]*$/)) {
        if (config[key] !== window.liveStorage[key]) {
          config[key] = window.liveStorage[key];
        }
      }
    }
  }

  /* Finally, ensure certain defaults */

  /* Default name is no name */
  if (typeof(config.Name) !== "string") {
    config.Name = "";
  }

  /* Plugins are an opt-in feature */
  if (!config.hasOwnProperty("Plugins")) {
    config.Plugins = false;
  }

  /* Debugging is disabled by default */
  if (!config.hasOwnProperty("Debug")) {
    config.Debug = false;
  }

  /* Default channels are no channels */
  if (!config.hasOwnProperty("Channels")) {
    config.Channels = [];
  }

  /* Ensure there's a layout property present */
  if (!config.hasOwnProperty("Layout")) {
    config.Layout = GetLayout();
  }

  /* Default max messages */
  if (!config.hasOwnProperty("MaxMessages")) {
    config.MaxMessages = TwitchClient.DEFAULT_MAX_MESSAGES;
  }

  /* Default sent-message history */
  if (!config.hasOwnProperty("HistorySize")) {
    config.HistorySize = TwitchClient.DEFAULT_HISTORY_SIZE;
  }

  /* Whether or not to format URLs */
  if (!config.hasOwnProperty("EnableURLs")) {
    config.EnableURLs = true;
  }

  /* Default ClientID */
  if (inclSensitive) {
    if (!config.ClientID) {
      /* Protect against naive source code sniffing */
      config.ClientID = [
         19, 86, 67,115, 22, 38,198,  3, 55,118, 67, 35,150,230, 71,
        134, 83,  3,119,166, 86, 39, 38,167,135,134,147,214, 38, 55
      ].map((i) => Util.ASCII[((i&15)*16+(i&240)/16)]).join("");
    }
  } else {
    config.ClientID = null;
    /* Should be null by this point, but delete them anyway */
    delete config["ClientID"];
    delete config["Pass"];
  }

  return config;
}

/* Obtain singular configuration */
function getConfigValue(key) {
  return getConfigObject()[key];
}

/* Store configuration */
function mergeConfigObject(to_merge=null) {
  const merge = to_merge || {};
  const config = getConfigObject(true);
  if (Util.IsArray(merge)) {
    for (const [k, v] of merge) {
      config[k] = v;
    }
  } else {
    for (const [k,v] of Object.entries(merge)) {
      config[k] = v;
    }
  }
  Util.SetWebStorage(config);
  window.liveStorage = config;
}

/* Generate a URL from the given config object */
function genConfigURL(config, options=null) {
  const qs = [];
  const opts = options || {};
  const qsAdd = (k, v) => qs.push(`${k}=${encodeURIComponent(v)}`);

  if (opts.key) {
    qsAdd("key", opts.key);
  }
  if (config.Debug > 0) {
    qsAdd("debug", config.Debug);
  }
  if (config.__clientid_override) {
    qsAdd("clientid", config.ClientID);
  }
  if (config.Channels) {
    qsAdd("channels", config.Channels.join(","));
  }
  if (config.NoAssets) {
    qsAdd("noassets", config.NoAssets);
  }
  if (config.NoFFZ) {
    qsAdd("noffz", config.NoFFZ);
  }
  if (config.NoBTTV) {
    qsAdd("nobttv", config.NoBTTV);
  }
  if (config.HistorySize) {
    qsAdd("hmax", config.HistorySize);
  }
  for (const module of Object.keys(getModules())) {
    if (config[module]) {
      qsAdd(module, formatModuleConfig(config[module]));
    }
  }
  if (config.Layout) {
    qsAdd("layout", FormatLayout(config.Layout));
  }
  if (config.Transparent) {
    qsAdd("trans", "1");
  }
  if (config.NoAutoReconnect) {
    qsAdd("norec", "1");
  }
  if (config.Font) {
    qsAdd("font", config.Font);
  } else {
    const font_curr = Util.CSS.GetProperty("--body-font");
    const font_dflt = Util.CSS.GetProperty("--body-font-default");
    if (font_curr !== font_dflt) {
      qsAdd("font", font_curr);
    }
  }
  if (config.Size) {
    qsAdd("size", config.Size);
  } else {
    const fsize_curr = Util.CSS.GetProperty("--body-font-size");
    const fsize_dflt = Util.CSS.GetProperty("--body-font-size-default");
    if (fsize_curr !== fsize_dflt) {
      qsAdd("size", fsize_curr.replace(/[^0-9]/g, ""));
    }
  }
  if (config.Plugins) {
    qsAdd("plugins", "1");
  }
  if (config.MaxMessages !== TwitchClient.DEFAULT_MAX_MESSAGES) {
    qsAdd("max", `${config.MaxMessages}`);
  }
  if (config.Scroll) {
    qsAdd("scroll", "1");
  }
  if (config.ShowClips) {
    qsAdd("clips", "1");
  }
  if (opts.auth && config.Name && config.Pass) {
    qsAdd("user", config.Name);
    qsAdd("pass", config.Pass);
  }
  if (config.DisableEffects) {
    qsAdd("disable", config.DisableEffects.join(","));
  }
  if (config.EnableEffects) {
    qsAdd("enable", config.EnableEffects.join(","));
  }
  if (config.PluginConfig) {
    qsAdd("plugincfg", JSON.stringify(config.PluginConfig));
  }
  if (config.ColorScheme === "dark") {
    qsAdd("scheme", "dark");
  } else if (config.ColorScheme === "light") {
    qsAdd("scheme", "light");
  }
  if (config.EnableForce) {
    qsAdd("force", "1");
  }
  if (config.Fanfare) {
    qsAdd("fanfare", JSON.stringify(config.Fanfare));
  }
  if (config.Highlight) {
    qsAdd("highlight", config.Highlight.map((s) => `${s}`).join(","));
  }
  if (config.EnableURLs) {
    qsAdd("urls", "1");
  }
  if (opts.tag) {
    qsAdd("tag", opts.tag);
  } else if (config.tag) {
    qsAdd("tag", config.tag);
  }

  const base = opts.git ? GIT_URL : CUR_URL;
  if (opts.base64) {
    return base + "?base64=" + encodeURIComponent(btoa(qs.join("&")));
  } else {
    return base + "?" + qs.join("&");
  }
}

/* Module configuration {{{1 */

/* Enumerate the active modules */
function getModules() { /* exported getModules */
  const m = {};
  for (const elem of $(".module")) {
    m[$(elem).attr("id")] = elem;
  }
  return m;
}

/* Apply configuration to the module's settings HTML */
function setModuleSettings(module, config) {
  const $module = $(module);
  if (config.Name) {
    $module.find("label.name").html(config.Name);
    $module.find("input.name").val(config.Name);
  }
  $module.find("input.pleb").check(config.Pleb);
  $module.find("input.sub").check(config.Sub);
  $module.find("input.vip").check(config.VIP);
  $module.find("input.mod").check(config.Mod);
  $module.find("input.event").check(config.Event);
  $module.find("input.bits").check(config.Bits);
  $module.find("input.me").check(config.Me);
  function addInput(cls, values) {
    /* Add checkbox for the given values */
    const clse = CSS.escape(cls);
    const $setting = $module.find(`li.${clse}`);
    const label = $setting.find(`label`).last().html() + " ";
    for (const val of values) {
      const vale = CSS.escape(val);
      /* Add checkbox if value isn't already present */
      if ($module.find(`input.${clse}[value="${vale}"]`).length === 0) {
        const $cb = $(`<input type="checkbox" checked />`)
          .addClass(cls)
          .attr("value", val)
          .click(updateModuleConfig);
        const $la = $(`<label></label>`)
          .val(label)
          .append($cb);
        $la.html($la.html() + label + val.escape());
        const $li = $(`<li></li>`)
          .append($la);
        $setting.before($li);
      }
    }
  }
  addInput("include_user", config.IncludeUser || []);
  addInput("include_keyword", config.IncludeKeyword || []);
  addInput("exclude_user", config.ExcludeUser || []);
  addInput("exclude_startswith", config.ExcludeStartsWith || []);
  addInput("from_channel", config.FromChannel || []);
}

/* Obtain the settings from the module's settings HTML */
function getModuleSettings(module) {
  const $module = $(module);
  const settings = {
    Name: $module.find("input.name").val(),
    Pleb: $module.find("input.pleb").is(":checked"),
    Sub: $module.find("input.sub").is(":checked"),
    VIP: $module.find("input.vip").is(":checked"),
    Mod: $module.find("input.mod").is(":checked"),
    Event: $module.find("input.event").is(":checked"),
    Bits: $module.find("input.bits").is(":checked"),
    Me: $module.find("input.me").is(":checked"),
    IncludeUser: [],
    IncludeKeyword: [],
    ExcludeUser: [],
    ExcludeStartsWith: [],
    FromChannel: []
  };

  $module.find("input.include_user:checked").each(function _get_incuser() {
    settings.IncludeUser.push($(this).val());
  });
  $module.find("input.include_keyword:checked").each(function _get_inckey() {
    settings.IncludeKeyword.push($(this).val());
  });
  $module.find("input.exclude_user:checked").each(function _get_excuser() {
    settings.ExcludeUser.push($(this).val());
  });
  $module.find("input.exclude_startswith:checked").each(function _get_excsw() {
    settings.ExcludeStartsWith.push($(this).val());
  });
  $module.find("input.from_channel:checked").each(function _get_from() {
    settings.FromChannel.push($(this).val());
  });

  return settings;
}

/* Parse a module configuration object from a query string component */
function parseModuleConfig(value) {
  const Decode = (vals) => vals.map((v) => decodeURIComponent(v));
  const parts = Decode(value.split(/,/g));
  while (parts.length < 7) parts.push("");
  /* Upgrade configuration from 6x to 7x */
  if (parts[1] === "111111") {
    parts[1] = "1111111";
  }
  const bits = Util.DecodeFlags(parts[1], 7);
  const config = {};
  config.Name = parts[0];
  config.Pleb = bits[0];
  config.Sub = bits[1];
  config.VIP = bits[2];
  config.Mod = bits[3];
  config.Event = bits[4];
  config.Bits = bits[5];
  config.Me = bits[6];
  config.IncludeKeyword = parts[2] ? Decode(parts[2].split(/,/g)) : [];
  config.IncludeUser = parts[3] ? Decode(parts[3].split(/,/g)) : [];
  config.ExcludeUser = parts[4] ? Decode(parts[4].split(/,/g)) : [];
  config.ExcludeStartsWith = parts[5] ? Decode(parts[5].split(/,/g)) : [];
  config.FromChannel = parts[6] ? Decode(parts[6].split(/,/g)) : [];
  return config;
}

/* Format the module configuration object into a query string component */
function formatModuleConfig(cfg) {
  const Encode = (vals) => vals.map((v) => encodeURIComponent(v));
  const flags = [cfg.Pleb, cfg.Sub, cfg.VIP, cfg.Mod, cfg.Event,
                 cfg.Bits, cfg.Me];
  const values = [
    cfg.Name,
    Util.EncodeFlags(flags, false),
    Encode(cfg.IncludeKeyword).join(","),
    Encode(cfg.IncludeUser).join(","),
    Encode(cfg.ExcludeUser).join(","),
    Encode(cfg.ExcludeStartsWith).join(","),
    Encode(cfg.FromChannel).join(",")
  ];
  return Encode(values).join(",");
}

/* Store the modules' settings in both localStorage and liveStorage */
function updateModuleConfig() {
  const config = {};
  $(".module").each(function _update_module() {
    const id = $(this).attr("id");
    config[id] = getModuleSettings($(this));
    if (!window.liveStorage) {
      window.liveStorage = {};
    }
    window.liveStorage[id] = config[id];
  });
  mergeConfigObject(config);
}

/* End module configuration 1}}} */

/* Set the joined channels to the list given */
function setChannels(client, channels) {
  const fmt_ch = (ch) => Twitch.FormatChannel(Twitch.ParseChannel(ch));
  const new_chs = channels.map(fmt_ch);
  const old_chs = client.GetJoinedChannels().map(fmt_ch);
  const to_join = new_chs.filter((c) => old_chs.indexOf(c) === -1);
  const to_part = old_chs.filter((c) => new_chs.indexOf(c) === -1);
  /* Join all the channels added */
  for (const ch of to_join) {
    client.JoinChannel(ch);
    Content.addNoticeText(`Joining ${ch}`);
  }
  /* Leave all the channels removed */
  for (const ch of to_part) {
    client.LeaveChannel(ch);
    Content.addNoticeText(`Leaving ${ch}`);
  }
}

/* End configuration section 0}}} */

/* Return whether or not the event should be filtered */
function shouldFilter(module, event) {
  const rules = getModuleSettings(module);
  if (event instanceof TwitchChatEvent) {
    const user = event.user || "";
    const message = event.message ? event.message.toLowerCase() : "";
    /* NOTE: pleb < sub < vip < mod < caster */
    let role = "pleb";
    if (event.issub) role = "sub";
    if (event.isvip) role = "vip";
    if (event.ismod) role = "mod";
    if (event.iscaster) role = "caster";
    /* Never filter caster messages */
    if (role === "caster") return false;
    /* Includes take priority over excludes */
    if (rules.IncludeUser.any((u) => u.equalsLowerCase(user))) return false;
    if (rules.IncludeKeyword.any((k) => message.indexOf(k) > -1)) return false;
    /* Role filtering */
    if (!rules.Pleb && role === "pleb") return true;
    if (!rules.Sub && role === "sub") return true;
    if (!rules.VIP && role === "vip") return true;
    if (!rules.Mod && role === "mod") return true;
    /* Content filtering ("Bits" also filters out cheer effects) */
    if (!rules.Bits && event.flags.bits) return true;
    if (!rules.Me && event.flags.action) return true;
    /* Exclude filtering */
    if (rules.ExcludeUser.any((u) => u.equalsLowerCase(user))) return true;
    if (rules.ExcludeStartsWith.any((m) => message.startsWith(m))) return true;
    /* Filtering to permitted channels (default: permit all) */
    if (rules.FromChannel.length > 0) {
      for (const s of rules.FromChannel) {
        if (event.channelString.equalsLowerCase(s)) {
          return false;
        }
      }
      return true;
    }
  } else if (event instanceof TwitchEvent) {
    /* Event filtering: notices and user notices */
    if (!rules.Event) {
      if (event.command === "USERNOTICE" || event.command === "NOTICE") {
        return true;
      }
    }
  }
  if (window.Plugins && !window.PluginsAreDisabled) {
    const plugin_results = Plugins.invoke("shouldFilter", module, event);
    if (plugin_results && plugin_results.length > 0) {
      for (const i of plugin_results) {
        if (i === true || i === false) {
          return i;
        }
        /* Other values: continue the filtering logic */
      }
    }
  }
  return false;
}

/* Populate and show the username context window */
function showUserContextWindow(client, cw, line) {
  const $cw = $(cw);
  const $l = $(line);

  /* Attributes of the host line */
  const id = $l.attr("data-id");
  const user = $l.attr("data-user");
  const name = $l.find(".username").text();
  const userid = $l.attr("data-user-id");
  const channel = `#${$l.attr("data-channel")}`;
  const chid = $l.attr("data-channelid");
  const sub = $l.attr("data-subscriber") === "1";
  const mod = $l.attr("data-mod") === "1";
  const vip = $l.attr("data-vip") === "1";
  const caster = $l.attr("data-caster") === "1";
  const timestamp = Number.parseInt($l.attr("data-sent-ts"));
  const time = new Date(timestamp);

  /* Clear everything from last time */
  $cw.html("");

  /* Set the attributes for the context window */
  $cw.attr("data-id", id);
  $cw.attr("data-user", user);
  $cw.attr("data-user-id", userid);
  $cw.attr("data-channel", channel);
  $cw.attr("data-chid", chid);
  $cw.attr("data-sub", sub);
  $cw.attr("data-mod", mod);
  $cw.attr("data-vip", vip);
  $cw.attr("data-caster", caster);
  $cw.attr("data-id", id);

  /* Define functions for building elements */
  function $Line(s) {
    const $i = $(`<div class="item"></div>`);
    if (typeof(s) === "string") {
      $i.html(s);
    } else {
      $i.append(s);
    }
    return $i;
  }
  function $Link(link_id, text) {
    const $i = $(`<a class="cw-link"></a>`);
    $i.attr("id", link_id);
    $i.text(text);
    return $i;
  }
  function $Em(s) {
    return $(`<span class="em pad"></span>`).html(s);
  }

  /* Add user's display name */
  const $username = $l.find(".username");
  const classes = $username.attr("class").escape();
  const css = $username.attr("style").escape();
  const e_name = `<span class="${classes}" style="${css}">${name}</span>`;
  $cw.append($Line(`${e_name} in <span class="em">${channel}</span>`));

  /* Add link to timeout user */
  if (client.IsMod(channel)) {
    const $tl = $(`<div class="cw-timeout">Timeout:</div>`);
    for (const dur of "1s 10s 60s 10m 30m 1h 12h 24h".split(" ")) {
      const $ta = $Link(`cw-timeout-${user}-${dur}`, dur);
      $ta.addClass("cw-timeout-dur");
      $ta.attr("data-channel", channel);
      $ta.attr("data-user", user);
      $ta.attr("data-duration", dur);
      $ta.click(function _ucw_timeout_click() {
        const ch = $(this).attr("data-channel");
        const u = $(this).attr("data-user");
        const d = $(this).attr("data-duration");
        client.Timeout(ch, u, d);
        Util.Log(`Timed out user ${u} from ${ch} for ${d}`);
        $(cw).fadeOut();
      });
      $tl.append($ta);
    }
    $cw.append($tl);
  }

  /* Add link which places "/ban <user>" into the chat textbox */
  if (client.IsMod(channel)) {
    const $ba = $Link(`cw-ban-${user}`, "Ban");
    $ba.addClass("cw-ban-user");
    $ba.attr("data-channel", channel);
    $ba.attr("data-user", user);
    $ba.click(function _ucw_ban_click() {
      $("#txtChat").val(`/ban ${$(this).attr("data-user")}`);
    });
    $cw.append($ba);
  }

  /* Add other information */
  const sent_ts = Util.FormatDate(time);
  const ago_ts = Util.FormatInterval((Date.now() - timestamp) / 1000);
  $cw.append($Line(`Sent: ${sent_ts} (${ago_ts} ago)`));
  $cw.append($Line(`UserID: ${userid}`));
  $cw.append($Line(`MsgUID: ${id}`));

  /* Add roles (and ability to remove roles, for the caster) */
  if (mod || vip || sub || caster) {
    const $roles = $Line(`User Role: `);
    const roles = [];
    if (mod) roles.push($Em("Mod"));
    if (vip) roles.push($Em("VIP"));
    if (sub) roles.push($Em("Sub"));
    if (caster) roles.push($Em("Host"));
    if (roles.length > 0) {
      $roles.append(roles[0]);
      for (const role of roles.slice(1)) {
        $roles.append(", ");
        $roles.append(role);
      }
      $cw.append($roles);
    }
    if (client.IsCaster(channel) && !client.IsUIDSelf(userid)) {
      if (mod) $cw.append($Line($Link("cw-unmod", "Remove Mod")));
      if (vip) $cw.append($Line($Link("cw-unvip", "Remove VIP")));
    }
  }

  /* Add the ability to add roles (for the caster) */
  if (client.IsCaster(channel) && !client.IsUIDSelf(userid)) {
    if (!mod) $cw.append($Line($Link("cw-make-mod", "Make Mod")));
    if (!vip) $cw.append($Line($Link("cw-make-vip", "Make VIP")));
  }

  const lo = $l.offset();
  const t = Math.round(lo.top) + $l.outerHeight() + 2;
  const l = Math.round(lo.left);
  const w = $cw.outerWidth();
  const h = $cw.outerHeight();
  const offset = {top: t, left: l, width: w, height: h};
  Util.ClampToScreen(offset);
  delete offset["width"];
  delete offset["height"];
  $cw.fadeIn().offset(offset);
}

/* Set or unset transparency */
function updateTransparency(transparent) { /* exported updateTransparency */
  let props = [];
  try {
    const ss = Util.CSS.GetSheet("main.css");
    const rule = Util.CSS.GetRule(ss, ":root");
    /* Find the prop="--<name>-color" rules */
    for (const prop of Util.CSS.GetPropertyNames(rule)) {
      if (prop.match(/^--[a-z-]+-color$/)) {
        props.push(prop);
      }
    }
  }
  catch (e) {
    /* Unable to enumerate properties; use hard-coded ones */
    Util.ErrorOnce("Failed getting main.css :root", e);
    props = [
      "--body-color",
      "--header-color",
      "--menudiv-color",
      "--module-color",
      "--odd-line-color",
      "--sub-color",
      "--chat-color",
      "--textarea-color",
    ];
  }
  for (const prop of props) {
    if (transparent) {
      /* Set them all to transparent */
      Util.CSS.SetProperty(prop, "transparent");
      $(".module").addClass("transparent");
      $("body").addClass("transparent");
    } else {
      /* Set them all to default */
      Util.CSS.SetProperty(prop, `var(${prop}-default)`);
      $(".module").removeClass("transparent");
      $("body").removeClass("transparent");
    }
  }
}

/* Set the colorscheme to dark */
function setDarkScheme() { /* exported setDarkScheme */
  $("body").removeClass("light").addClass("dark");
  $("#btnSettings").attr("src", AssetPaths.SETTINGS);
}

/* Set the colorscheme to light */
function setLightScheme() { /* exported setLightScheme */
  $("body").removeClass("dark").addClass("light");
  $("#btnSettings").attr("src", AssetPaths.SETTINGS_LIGHT);
}

/* Set or clear window notification badge */
function setNotify(notify=true) { /* exported setNotify */
  const asset = notify ? AssetPaths.FAVICON_ALERT : AssetPaths.FAVICON;
  $(`link[rel="shortcut icon"]`).attr("href", asset);
}

/* Called once when the document loads */
function doLoadClient() { /* exported doLoadClient */
  let client = null;
  let config = {};

  /* Add custom colors to the color parser */
  Util.ColorParser.addColors(...Object.entries(ColorNames));

  /* Hook Logger messages to display in chat */
  Util.Logger.addHook(function(sev, dispStack, ...args) {
    if (Util.DebugLevel >= Util.LEVEL_DEBUG) {
      Content.addErrorText("ERROR: " + Util.Logger.stringify(...args));
    }
  }, "ERROR");
  Util.Logger.addHook(function(sev, dispStack, ...args) {
    if (args.length === 1 && args[0] instanceof TwitchEvent) {
      if (Util.DebugLevel >= Util.LEVEL_TRACE) {
        Content.addNoticeText("WARNING: " + JSON.stringify(args[0]));
      }
    } else if (Util.DebugLevel >= Util.LEVEL_DEBUG) {
      Content.addNoticeText("WARNING: " + Util.Logger.stringify(...args));
    }
  }, "WARN");
  Util.Logger.addHook(function(sev, dispStack, ...args) {
    if (Util.DebugLevel >= Util.LEVEL_TRACE) {
      Content.add("DEBUG: " + Util.Logger.stringify(...args));
    }
  }, "DEBUG");
  Util.Logger.addHook(function(sev, dispStack, ...args) {
    if (Util.DebugLevel >= Util.LEVEL_TRACE) {
      Content.add("TRACE: " + Util.Logger.stringify(...args));
    }
  }, "TRACE");

  /* Filtering */
  if (Util.DebugLevel < Util.LEVEL_TRACE) {
    /* Filter out PING/PONG messages */
    Util.Logger.addFilter(/ws (send|recv)>.+(PING|PONG) :tmi.twitch.tv/);
    /* Filter out users joining/parting channels */
    Util.Logger.addFilter(/tmi.twitch.tv (JOIN|PART) #/);
  }

  /* Clear txtName and txtPass (to fix problems with browser autofills) */
  $("#txtNick").val("");
  $("#txtPass").val("");

  /* Add the //config command */
  ChatCommands.add("config", function(cmd, tokens, client_) {
    const cfg = getConfigObject(true);
    const t0 = tokens.length > 0 ? tokens[0] : "";
    if (tokens.length === 0) {
      const mcfgs = [];
      Content.addHelp(`<em>Global Configuration Values:</em>`);
      for (const [k, v] of Object.entries(cfg)) {
        let key = k;
        let val = (typeof(v) === "object" ? JSON.stringify(v) : `${v}`);
        if (k === "Layout") {
          val = FormatLayout(v);
        } else if (k === "ClientID") {
          val = "Omitted for security; use //config clientid to show";
        } else if (k === "Pass") {
          val = "Omitted for security; use //config pass to show";
        } else if (typeof(v) === "object" && v.Name && v.Name.length > 0) {
          key = val = null;
          mcfgs.push([k, v]);
        }
        if (key !== null) {
          Content.addHelpLineE(`${key}`, `${val}`);
        }
      }
      Content.addHelp(`<em>Window Configuration Values:</em>`);
      for (const [k, v] of mcfgs) {
        Content.addHelpText(`Module ${k}: ${v.Name}`);
        for (const [ck, cv] of Object.entries(v)) {
          if (ck !== "Name") {
            Content.addHelpLineE(`${ck}`, `${cv}`);
          }
        }
      }
    } else if (t0 === "help") {
      Content.addHelpLine("//config", "Show and manipulate configuration");
      Content.addHelpText("//config parameters:");
      Content.addHelpLine("export",
                          _J("Export *all* of localStorage to a new tab",
                             "(contains passwords!)"));
      Content.addHelpLine("purge", "Clear localStorage (cannot be undone!)");
      Content.addHelpLine("clientid", "Display ClientID");
      Content.addHelpLine("pass", "Dislay OAuth token (if one is present)");
      Content.addHelpLine("url",
                          "Generate a URL from the current configuration");
      Content.addHelpText("//config url parameters:");
      Content.addHelpLine("git", "Force URL to target github.io");
      Content.addHelpLine("text", "Force URL to be un-encoded");
      Content.addHelpLine("auth", "Include passwords in URL");
      Content.addHelpLineE("tag=<value>", "Set the tag to <value>");
      Content.addHelpLineE("key=<value>", "Use config key to <value>");
      Content.addHelpText(_J("//config set <key> <value>: Directly change",
                             "<key> to <value> (dangerous!)"));
      Content.addHelpText(_J("//config setobj <key> <value>: Directly change",
                             "<key> to JSON-encoded <value> (dangerous!)"));
      Content.addHelpText("//config unset <key>: Remove <key> (dangerous!)");
    } else if (t0 === "export") {
      Util.Open(AssetPaths.CONFIG_EXPORT_WINDOW, "_blank", {});
    } else if (t0 === "purge") {
      Util.SetWebStorage({});
      window.liveStorage = {};
      Content.addNoticeText(`Purged storage "${Util.GetWebStorageKey()}"`);
    } else if (t0 === "clientid") {
      Content.addHelpLineE("ClientID", cfg.ClientID);
    } else if (t0 === "pass") {
      Content.addHelpLineE("Pass", cfg.Pass);
    } else if (t0 === "url") {
      /* Generate a URL with the current configuration, omitting items
       * left at default values */
      const opts = {
        git: 0,
        auth: 0,
        base64: 1,
        tag: config.tag || ""
      };
      for (const t of tokens) {
        if (t === "git") opts.git = 1;
        if (t === "auth") opts.auth = 1;
        if (t === "text") opts.base64 = 0;
        if (t.startsWith("tag=")) opts.tag = t.substr(4);
        if (t.startsWith("key=")) opts.key = t.substr(4);
      }
      const url = genConfigURL(cfg, opts);
      Content.addHelp($(`<a></a>`).attr("href", url).text(url));
    } else if ((t0 === "set" || t0 === "setobj") && tokens.length > 2) {
      /* Allow changing configuration by command (dangerous) */
      const key = tokens[1];
      const val = tokens.slice(2).join(" ");
      let newval = null;
      if (t0 === "setobj") {
        newval = JSON.parse(val);
      } else if (val === "true") {
        newval = true;
      } else if (val === "false") {
        newval = false;
      } else if (val === "Infinity") {
        newval = Infinity;
      } else if (val === "-Infinity") {
        newval = -Infinity;
      } else if (val === "NaN") {
        newval = NaN;
      } else if (val.match(/^[+-]?(?:\d|[1-9]\d*)$/)) {
        newval = Number.parseInt(val);
      } else if (val.match(/^[-+]?(?:\d*\.\d+|\d+)$/)) {
        newval = Number.parseFloat(val);
      } else {
        newval = val;
      }
      const newstr = JSON.stringify(newval);
      if (Util.ObjectHas(cfg, key)) {
        const oldval = Util.ObjectGet(cfg, key);
        const oldstr = JSON.stringify(oldval);
        Content.addHelpText(`Changing ${key} from "${oldstr}" to "${newstr}"`);
        Content.addHelpLineE(key, oldstr);
        Content.addHelpLineE(key, newstr);
        Util.ObjectSet(cfg, key, newval);
        mergeConfigObject(cfg);
      } else {
        Content.addHelpText(`Adding key ${key} with value "${newstr}"`);
        Content.addHelpLineE(key, newstr);
        Util.ObjectSet(cfg, key, newval);
        mergeConfigObject(cfg);
      }
    } else if (t0 === "unset" && tokens.length > 1) {
      const t1 = tokens[1];
      if (Util.ObjectRemove(cfg, t1)) {
        Content.addHelpText(`Removed key ${t1} from localStorage`);
        Util.SetWebStorage(cfg);
      } else {
        Content.addHelpText(`Failed to remove key ${t1} from localStorage`);
      }
      if (window.liveStorage) {
        if (Util.ObjectRemove(window.liveStorage, t1)) {
          Content.addHelpText(`Removed key ${t1} from liveStorage`);
        } else {
          Content.addHelpText(`Failed to removed key ${t1} from liveStorage`);
        }
      }
    } else if (Util.ObjectHas(cfg, t0)) {
      Content.addHelpText("Configuration:");
      Content.addHelpLineE(t0, JSON.stringify(Util.ObjectGet(cfg, t0)));
    } else {
      const tok = `"${t0}"`;
      Content.addErrorText(`Unknown config command or key ${tok}`, true);
    }
  }, _J("Obtain and modify configuration information; use //config help for",
        "details"));

  /* Obtain configuration, construct client */
  (function _configure_construct_client() {
    const cfg = getConfigObject(true);
    client = new TwitchClient(cfg);
    Util.DebugLevel = cfg.Debug ? Util.LEVEL_DEBUG : Util.LEVEL_INFO;

    /* Change the document title to show our authentication state */
    if (cfg.Pass && cfg.Pass.length > 0) {
      document.title += " - Authenticated";
    } else {
      document.title += " - Read-Only";
      /* Change the chat placeholder and border to reflect read-only */
      if (cfg.Layout.Chat) {
        const message = _J(Strings.ANON_PLACEHOLDER + ":",
                           Strings.AUTH_PLACEHOLDER);
        $("#txtChat").attr("placeholder", message);
        Util.CSS.SetProperty("--chat-border", "#cd143c");
      }
    }

    /* Set values we'll want to use later */
    config = getConfigObject();
    config.Plugins = Boolean(cfg.Plugins);
    /* Absolutely ensure the public config object lacks private fields */
    config.Pass = config.ClientID = null;
    delete config["Pass"];
    delete config["ClientID"];
  })();

  /* After all that, sync the final settings up with the html */
  $(".module").each(function() {
    setModuleSettings(this, config[$(this).attr("id")]);
  });

  /* Disable configured events */
  for (const effect of config.EnableEffects || []) {
    if (CSSCheerStyles[effect]) {
      CSSCheerStyles[effect]._disabled = true;
    }
  }

  /* Enable configured effects */
  for (const effect of config.EnableEffects || []) {
    if (CSSCheerStyles[effect]) {
      CSSCheerStyles[effect]._disabled = false;
    }
  }

  /* Simulate clicking cbTransparent if config.Transparent is set */
  if (config.Transparent) {
    updateTransparency(true);
    $("#cbTransparent").check();
  } else {
    $("#cbTransparent").uncheck();
  }

  /* Set the text size if given */
  if (config.Size) {
    Util.CSS.SetProperty("--body-font-size", config.Size);
  }

  /* Set the font if given */
  if (config.Font) {
    Util.CSS.SetProperty("--body-font", config.Font);
  }

  /* Set the "cbScroll" config input with its current value */
  if (config.MaxMessages !== null && !Number.isNaN(config.MaxMessages)) {
    Util.Log(`config.MaxMessages: ${config.MaxMessages}`);
    $("#txtHistSize").val(`${config.MaxMessages}`);
  }

  /* If scrollbars are configured, enable them */
  if (config.Scroll) {
    $(".module .content").css("overflow-y", "scroll");
    $("#cbScroll").check();
  } else {
    $("#cbScroll").uncheck();
  }

  /* If no channels are configured, show the settings panel */
  if (config.Channels.length === 0) {
    $("#settings").fadeIn();
  }

  /* Apply the show-clips config to the settings div */
  $("#cbClips").check(config.ShowClips);

  /* Apply the no-force config to the settings div */
  $("#cbForce").check(config.EnableForce);

  /* Apply the selected color scheme; if any */
  if (config.ColorScheme === "dark") {
    setDarkScheme();
  } else if (config.ColorScheme === "light") {
    setLightScheme();
  }

  /* Apply the animated cheers config to the settings div */
  $("#cbAnimCheers").uncheck(config.NoAnim);

  /* Clear the background style */
  $("#txtBGStyle").val("");

  /* Set the font config in the settings div */
  $("#txtFont").val(config.Font || Util.CSS.GetProperty("--body-font"));

  /* Set the font size config in the settings div */
  $("#txtFontSize").val(config.Size || Util.CSS.GetProperty("--body-font-size"));

  /* Show the tag in the settings div */
  if (config.tag) {
    $("#txtTag").val(config.tag);
  }

  /* Sync fanfare with the enable checkbox */
  $("#cbFanfare").check(config.Fanfare && config.Fanfare.enable);

  /* Construct the HTMLGenerator and Fanfare objects */
  client.set("HTMLGen", new HTMLGenerator(client, config));
  client.set("Fanfare", new Fanfare(client, config));

  /* Function for syncing configuration with HTMLGen */
  function updateHTMLGenConfig() {
    for (const [k, v] of Object.entries(getConfigObject())) {
      client.get("HTMLGen").setValue(k, v);
    }
  }

  /* Add highlight patterns */
  if (config.Highlight) {
    for (const pat of config.Highlight) {
      client.get("HTMLGen").addHighlightMatch(pat);
    }
  }

  /* Construct the plugins */
  if (config.Plugins) {
    Plugins.loadAll(client, config);
  } else {
    Plugins.disable();
  }

  /* Allow JS access if debugging is enabled */
  if (Util.DebugLevel >= Util.LEVEL_DEBUG) {
    window.client = client;
  }

  /* Add documentation for the moderator chat commands */
  ChatCommands.addHelpText("Moderator commands:", {literal: true});
  ChatCommands.addHelpText("!tfc reload: Reload the page",
                           {literal: true, command: true});
  ChatCommands.addHelpText("!tfc force-reload: Force reload the page",
                           {literal: true, command: true});
  ChatCommands.addHelpText("!tfc nuke: Completely clear the chat",
                           {literal: true, command: true});
  ChatCommands.addHelpText("!tfc nuke <user>: Clear messages sent by <user>",
                           {args: true, command: true});
  ChatCommands.addHelpText("!tfc ffdemo: Demonstrate fanfares",
                           {literal: true, command: true});
  ChatCommands.addHelpText("!tfc ffcheerdemo: Default cheer fanfare demo",
                           {literal: true, command: true});
  ChatCommands.addHelpText("!tfc ffsubdemo: Default sub fanfare demo",
                           {literal: true, command: true});

  /* Close the main settings window */
  function closeSettings() {
    updateModuleConfig();
    $("#advSettings").slideUp();
    $("#settings").fadeOut();
  }

  /* Open the main settings window */
  function openSettings() {
    const cfg = getConfigObject(true);
    $("#txtChannel").val(cfg.Channels.join(","));
    $("#txtNick").val(cfg.Name || Strings.NAME_AUTOGEN);
    if (cfg.Pass && cfg.Pass.length > 0) {
      $("#txtPass").attr("disabled", "disabled").hide();
      $("#txtPassDummy").show();
    }
    $("#selDebug").val(`${cfg.Debug}`);
    $("#settings").fadeIn();
  }

  /* Toggle the main settings window */
  function toggleSettings() {
    if ($("#settings").is(":visible")) {
      closeSettings();
    } else {
      openSettings();
    }
  }

  /* Close a module's settings window */
  function closeModuleSettings(module) {
    /* Update module configurations on close */
    updateModuleConfig();
    const $ms = $(module).find(".settings");
    const $in = $ms.siblings("input.name");
    const $ln = $ms.siblings("label.name");
    $in.hide();
    $ln.html($in.val()).show();
    $ms.fadeOut();
  }

  /* Open a module's settings window */
  function openModuleSettings(module) {
    const $ms = $(module).find(".settings");
    const $in = $ms.siblings("input.name");
    const $ln = $ms.siblings("label.name");
    $ln.hide();
    $in.val($ln.html()).show();
    $ms.fadeIn();
  }

  /* Toggle a module's settings window */
  function toggleModuleSettings(module) {
    const $ms = $(module).find(".settings");
    if ($ms.is(":visible")) {
      closeModuleSettings(module);
    } else {
      openModuleSettings(module);
    }
  }

  /* Reset chat auto-completion variables */
  function resetChatComplete() {
    const $c = $("#txtChat");
    $c.attr("data-complete-text", "");
    $c.attr("data-complete-pos", "-1");
    $c.attr("data-complete-index", "0");
  }

  /* Reset chat history recall */
  function resetChatHistory() {
    $("#txtChat").attr("data-hist-index", "-1");
  }

  /* Open the settings builder page */
  function openSettingsTab() {
    Util.Open(AssetPaths.BUILDER_WINDOW, "_blank", {});
  }

  /* Initialize chat auto-completion and history */
  resetChatComplete();
  resetChatHistory();

  /* Add command to open the settings builder page */
  ChatCommands.add("builder", function _on_cmd_builder(cmd, tokens, client_) {
    openSettingsTab();
  }, "Open the configuration builder wizard");

  /* Pressing a key on the chat box */
  $("#txtChat").keydown(function _txtChat_keydown(e) {
    const t = event.target;
    const $t = $(t);
    if (e.shiftKey) {
      /* Holding shift bypasses the handling below */
      resetChatComplete();
      resetChatHistory();
    } else if (e.key === "Enter") {
      /* Send a message */
      const text = t.value;
      const t0 = text.indexOf(" ") > -1 ? text.split(" ")[0] : "";
      if (text.trim().length > 0) {
        if (ChatCommands.isCommandStr(text)) {
          /* Execute chat command */
          ChatCommands.execute(text, client);
        } else if (client.channels.any((c) => t0.equalsLowerCase(c))) {
          /* #channel: send message to #channel */
          client.SendMessage(t0, text.substr(t0.length).strip());
        } else {
          /* Send message to all channels */
          client.SendMessageToAll(text);
        }
        client.AddHistory(text);
        t.value = "";
        resetChatComplete();
        resetChatHistory();
      }
      /* Prevent bubbling */
      e.preventDefault();
      return false;
    } else if (e.key === "Process" && e.code === "Tab") {
      /* Not sure why this gets fired, but ignore it */
    } else if (e.key === "Tab") {
      /* Tab completion */
      const oText = $t.attr("data-complete-text") || t.value;
      let oPos = Util.ParseNumber($t.attr("data-complete-pos"));
      let complIndex = Util.ParseNumber($t.attr("data-complete-index"));
      if (Number.isNaN(oPos) || oPos === -1) {
        oPos = t.selectionStart;
      }
      if (Number.isNaN(complIndex)) {
        complIndex = 0;
      }
      let complObj = {
        oText: oText,
        oPos: oPos,
        cText: t.value,
        cPos: t.selectionStart,
        index: complIndex
      };
      complObj = ChatCommands.complete(client, complObj);
      $t.attr("data-complete-text", complObj.oText);
      $t.attr("data-complete-pos", complObj.oPos);
      $t.attr("data-complete-index", complObj.index);
      t.value = complObj.cText;
      requestAnimationFrame(() => {
        t.selectionStart = complObj.cPos;
        t.selectionEnd = complObj.cPos;
      });
      resetChatHistory();
      e.preventDefault();
      return false;
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      /* Handle traversing message history */
      const l = client.GetHistoryLength();
      const d = ({ArrowUp: 1, ArrowDown: -1})[e.key];
      const i = d + Util.ParseNumber($t.attr("data-hist-index"));
      /* Restrict i to [-1, length-1] */
      const val = client.GetHistoryItem(Math.clamp(i, -1, l - 1));
      /* Update the text if the value is present (non-null) */
      if (val !== null) {
        t.value = val.trim();
      }
      $t.attr("data-hist-index", `${i}`);
      /* Delay moving the cursor until after the text is updated */
      requestAnimationFrame(() => {
        t.selectionStart = t.value.length;
        t.selectionEnd = t.value.length;
      });
      resetChatComplete();
    } else {
      resetChatComplete();
      resetChatHistory();
    }
  });

  /* Pressing enter while on the settings box */
  $("#settings").keyup(function(e) {
    if (e.key === "Enter") {
      toggleSettings();
    }
  });

  /* Clicking the settings button */
  $("#btnSettings").click(function(e) {
    toggleSettings();
  });

  /* Clicking on the `?` in the settings box header */
  $("#btnSettingsHelp").click(function(e) {
    Util.Open(AssetPaths.HELP_WINDOW, "_blank", {});
  });

  /* Clicking on the "Builder" link in the settings box header */
  $("#btnSettingsBuilder").click(function(e) {
    openSettingsTab();
  });

  /* Changing the "Channels" text box */
  onChange($("#txtChannel"), function(e) {
    setChannels(client, $(this).val().split(","));
    mergeConfigObject({"Channels": client.GetJoinedChannels()});
  });

  /* Changing the "Max Messages" text box */
  $("#txtHistSize").change(function(e) {
    const val = Util.ParseNumber($(this).val());
    if (val === null || Number.isNaN(val)) {
      Util.Log(`Refusing to update max message count; '${val}' not a number`);
    } else {
      mergeConfigObject({"MaxMessages": val});
      Util.Log(`Updated max message count to ${val}`);
    }
  });

  /* Changing the "Scrollbars" checkbox */
  $("#cbScroll").change(function(e) {
    const scroll = $(this).is(":checked");
    mergeConfigObject({"Scroll": scroll});
    $(".module .content").css("overflow-y", scroll ? "scroll" : "hidden");
  });

  /* Changing the "stream is transparent" checkbox */
  $("#cbTransparent").change(function(e) {
    updateTransparency($(this).is(":checked"));
    updateHTMLGenConfig();
  });

  /* Changing the "Show Clips" checkbox */
  $("#cbClips").change(function(e) {
    mergeConfigObject({"ShowClips": $(this).is(":checked")});
    updateHTMLGenConfig();
  });

  /* Changing the "Show Fanfare" checkbox */
  $("#cbFanfare").change(function(e) {
    client.get("Fanfare").enable = $(this).is(":checked");
  });

  /* Clicking on the "No Force" checkbox */
  $("#cbForce").change(function(e) {
    mergeConfigObject({"EnableForce": $(this).is(":checked")});
    updateHTMLGenConfig();
  });

  /* Changing the debug level */
  $("#selDebug").change(function(e) {
    const v = Util.ParseNumber($(this).val());
    Util.Log(`Changing debug level from ${Util.DebugLevel} to ${v}`);
    Util.DebugLevel = v;
  });

  /* Clicking on the reconnect link in the settings box */
  $("#btnReconnect").click(function(e) {
    client.Connect();
  });

  /* Clicking on the "Advanced Settings" or "Hide Advanced Settings" links */
  $("#btnAdvanced, #btnAdvHide").click(function(e) {
    $("#advSettings").slideToggle();
  });

  /* Changing the "Animated Cheers" checkbox */
  $("#cbAnimCheers").change(function(e) {
    mergeConfigObject({NoAnim: !$(this).is(":checked")});
    updateHTMLGenConfig();
  });

  /* Changing the "Background Image" text box */
  onChange($("#txtBGStyle"), function(e) {
    $(".module").css("background-image", $(this).val());
  });

  /* Changing the font text box */
  onChange($("#txtFont"), function(e) {
    const v = $(this).val();
    if (v) {
      if (v === "default") {
        Util.CSS.SetProperty("--body-font", "var(--body-font-default)");
      } else {
        Util.CSS.SetProperty("--body-font", v);
      }
    }
  });

  /* Changing the font size text box */
  onChange($("#txtFontSize"), function(e) {
    const v = $(this).val();
    if (v) {
      if (v === "default") {
        Util.CSS.SetProperty("--body-font-size",
                             "var(--body-font-size-default)");
      } else {
        Util.CSS.SetProperty("--body-font-size", v);
      }
    }
  });

  /* Changing the tag */
  onChange($("#txtTag"), function(e) {
    mergeConfigObject({tag: $(this).val()});
  });

  /* Pressing enter or escape on the module's name text box */
  $(".module .header input.name").keyup(function(e) {
    const $m = $(this).parentsUntil(".column").last();
    if (e.key === "Enter") {
      closeModuleSettings($m);
    } else if (e.key === "Escape") {
      /* Revert name change */
      $m.find("input.name").val($m.find("label.name").html());
      closeModuleSettings($m);
    }
  });

  /* Clicking on a "Clear" link */
  $(".module .header .btnClear").click(function(e) {
    $(this).parentsUntil(".column").find(".line-wrapper").remove();
  });

  /* Pressing enter or escape on one of the module menu text boxes */
  $(`.module .settings input[type="text"]`).keyup(function(e) {
    if (e.key === "Enter") {
      /* Enter: add a new entry */
      const v = $(this).val();
      if (v.length > 0) {
        const $cli = $(this).closest("li");
        const cls = $cli.attr("class").replace("textbox", "").trim();
        const cb = client.get("HTMLGen").checkbox(v, null, cls, true);
        const val = $cli.find("label").html();
        const $li = $(`<li><label>${cb}${val} ${v}</label></li>`);
        $cli.before($li);
        $(this).val("");
        updateModuleConfig();
      }
    } else if (e.key === "Escape") {
      /* Escape: close settings */
      closeModuleSettings($(this).parentsUntil(".column").last());
    }
  });

  /* Key presses at the document level */
  $(document).keyup(function(e) {
    if (e.key === "ScrollLock") {
      /* ScrollLock: pause or resume auto-scroll */
      const $c = $(".module .content");
      const val = $c.attr("data-no-scroll");
      if (val) {
        /* Enable scrolling */
        $c.removeAttr("data-no-scroll");
        Util.Log("Auto-scroll enabled");
        Content.addHelpText("Auto-scroll enabled");
      } else {
        /* Disable scrolling */
        $c.attr("data-no-scroll", "1");
        Util.Log("Auto-scroll disabled");
        Content.addHelpText("Auto-scroll disabled");
      }
    } else if (e.key === "Escape") {
      /* Escape: hide all open settings windows */
      if ($("#settings").is(":visible")) {
        $("#settings").fadeOut();
      }
      for (const m of Object.values(getModules())) {
        if ($(m).find(".settings").is(":visible")) {
          closeModuleSettings($(m));
        }
      }
    }
  });

  /* Clicking elsewhere on the document: reconnect, username context window */
  $(document).click(function(e) {
    const $t = $(e.target);
    const cx = e.clientX;
    const cy = e.clientY;

    /* Clicking on or off of the module settings button or box */
    for (const module of Object.values(getModules())) {
      const $m = $(module);
      const $mm = $m.find(".menu");
      const $mh = $m.find(".header");
      const $ms = $m.find(".settings");
      if (Util.PointIsOn(cx, cy, $mm)) {
        /* Clicked on the menu button */
        toggleModuleSettings($m);
      } else if ($ms.is(":visible")) {
        if (!Util.PointIsOn(cx, cy, $ms)) {
          /* Clicked off of the settings window */
          if (!Util.PointIsOn(cx, cy, $mh)) {
            /* Clicked off of the header */
            closeModuleSettings($m);
          }
        }
      }
    }

    /* Clicking off the main settings window */
    const $sw = $("#settings");
    if ($sw.is(":visible")) {
      let close = true;
      if ($sw.has(e.target || e.currentTarget).length > 0) {
        /* Clicking on an element within the settings window: don't close */
        close = false;
      } else if (Util.PointIsOn(cx, cy, $sw)) {
        /* Clicking within the settings window: don't close */
        close = false;
      }
      if (close) {
        closeSettings();
      }
    }

    /* Clicking on the username context window */
    const $cw = $("#userContext");
    if (Util.PointIsOn(cx, cy, $cw)) {
      const ch = $cw.attr("data-channel");
      const user = $cw.attr("data-user");
      const userid = $cw.attr("data-user-id");
      if (!client.IsUIDSelf(userid)) {
        if ($t.attr("id") === "cw-unmod") {
          /* Clicked on the "unmod" link */
          Util.Log(`Unmodding ${user} in ${ch}`);
          client.SendMessage(ch, `/unmod ${user}`);
        } else if ($t.attr("id") === "cw-unvip") {
          /* Clicked on the "unvip" link */
          Util.Log(`Removing VIP for ${user} in ${ch}`);
          client.SendMessage(ch, `/unvip ${user}`);
        } else if ($t.attr("id") === "cw-make-mod") {
          /* Clicked on the "mod" link */
          Util.Log(`Modding ${user} in ${ch}`);
          client.SendMessage(ch, `/mod ${user}`);
        } else if ($t.attr("id") === "cw-make-vip") {
          /* Clicked on the "vip" link */
          Util.Log(`VIPing ${user} in ${ch}`);
          client.SendMessage(ch, `/vip ${user}`);
        }
      }
    } else if ($t.attr("data-username") === "1") {
      /* Clicked on a username; show context window */
      const $l = $t.parent();
      if ($cw.is(":visible")) {
        if ($cw.attr("data-user-id") === $l.attr("data-user-id")) {
          /* Clicked on the same name: fade out */
          $cw.fadeOut();
        } else {
          /* Clicked on a different name */
          showUserContextWindow(client, $cw, $l);
        }
      } else {
        showUserContextWindow(client, $cw, $l);
      }
    } else if ($cw.is(":visible")) {
      /* Clicked somewhere else: close context window */
      $cw.fadeOut();
    }

    /* Clicking on a "Reconnect" link */
    if ($t.attr("data-reconnect") === "1") {
      Content.addNoticeText("Reconnecting...");
      client.Connect();
    }
  });

  /* Document gained focus: clear notification icon */
  $(document).focus(function(e) {
    client.get("HTMLGen").setValue("focus", true);
    setNotify(false);
  });

  /* Document lost focus: track it */
  $(document).blur(function(e) {
    client.get("HTMLGen").setValue("focus", false);
  });

  /* WebSocket opened */
  client.bind("twitch-open", function _on_twitch_open(e) {
    $(".loading").remove();
    $("#debug").hide();
    if (Util.DebugLevel >= Util.LEVEL_DEBUG) {
      if (client.IsAuthed()) {
        Content.addInfoText("Connected (authenticated)");
      } else {
        Content.addInfoText("Connected (unauthenticated)");
      }
    }
    if (getConfigValue("Channels").length === 0) {
      Content.addInfoText(_J("No channels configured; type //join <channel>",
                             "to join one!"));
    }
  });

  /* WebSocket closed */
  client.bind("twitch-close", function _on_twitch_close(e) {
    const code = e.values.event.code;
    const reason = e.values.event.reason;
    let msg = `(code ${code} ${Util.WSStatus[code]})`;
    if (reason) {
      msg = `(code ${code} ${Util.WSStatus[code]}: ${reason})`;
    }
    if (getConfigValue("NoAutoReconnect")) {
      Content.addErrorText(`Connection closed ${msg} ${Strings.RECONNECT}`);
    } else {
      Content.addErrorText(_J(`Connection closed ${msg}; reconnecting in 5`,
                              `seconds...`));
      if (!client.connecting) {
        window.setTimeout(() => { client.Connect(); }, 5000);
      }
    }
  });

  /* Client joined a channel */
  client.bind("twitch-joined", function _on_twitch_joined(e) {
    const layout = getConfigValue("Layout");
    if (!layout.Slim) {
      Content.addInfoText(`Joined ${Twitch.FormatChannel(e.channel)}`);
    }
  });

  /* Client left a channel */
  client.bind("twitch-parted", function _on_twitch_parted(e) {
    const layout = getConfigValue("Layout");
    if (!layout.Slim) {
      Content.addInfoText(`Left ${Twitch.FormatChannel(e.channel)}`);
    }
  });

  /* Notice (or warning) from Twitch */
  client.bind("twitch-notice", function _on_twitch_notice(e) {
    const channel = Twitch.FormatChannel(e.channel);
    const message = e.message;
    if (e.noticeMsgId === "host_on") {
      /* This is handled in twitch-hosttarget */
    } else if (e.noticeMsgId === "cmds_available") {
      Content.addNoticeText(`${channel}: ${message}`);
      Content.addInfoText("Use //help to see Twitch Filtered Chat commands");
    } else {
      Content.addNoticeText(`${channel}: ${message}`);
    }
  });

  /* Error from Twitch or Twitch Client API */
  client.bind("twitch-error", function _on_twitch_error(e) {
    Util.Error(e);
    const user = e.user;
    const command = e.values.command;
    const message = e.message;
    Content.addErrorText(`Error for ${user}: ${command}: ${message}`);
  });

  /* Message received from Twitch */
  client.bind("twitch-message", function _on_twitch_message(e) {
    if (Util.DebugLevel >= Util.LEVEL_TRACE) {
      if (e instanceof TwitchEvent) {
        Content.addPreText(e.repr());
      } else {
        Content.addPreText(JSON.stringify(e));
      }
    }
  });

  /* Received streamer info */
  client.bind("twitch-streaminfo", function _on_twitch_streaminfo(e) {
    const layout = getConfigValue("Layout");
    const cinfo = client.GetChannelInfo(e.channelString) || {};
    if (layout && !layout.Slim) {
      if (cinfo.online) {
        try {
          /* Helix changes:
           * name = cinfo.stream.user_name
           * game = cinfo.stream.game_id (translate to game name)
           * viewers = cinfo.stream.viewer_count */
          const name = cinfo.stream.channel.display_name;
          const game = cinfo.stream.game;
          const viewers = cinfo.stream.viewers;
          Content.addNotice(Strings.StreamInfo(name, game, viewers));
          if (cinfo.stream.channel.status) {
            Content.addNoticeText(cinfo.stream.channel.status);
          }
        }
        catch (err) {
          Util.ErrorOnly("Failed to obtain stream information:", cinfo);
          Util.Error(err);
          Content.addNotice(Strings.StreamOnline(e.channelString));
        }
      } else {
        Content.addNotice(Strings.StreamOffline(e.channelString));
      }
    }
  });

  /* Received chat message */
  client.bind("twitch-chat", function _on_twitch_chat(e) {
    if (e instanceof TwitchChatEvent) {
      const m = typeof(e.message) === "string" ? e.message : "";
      /* Handle !tfc commands */
      if (e.flags && e.flags.mod && m.startsWith("!tfc ")) {
        const tokens = m.split(" ");
        if (tokens[1] === "reload") {
          location.reload();
        } else if (tokens[1] === "force-reload") {
          location.reload(true);
        } else if (tokens[1] === "clear") {
          $(".content").children().remove();
        } else if (tokens[1] === "nuke") {
          if (tokens[2] && tokens[2].length > 1) {
            const name = CSS.escape(tokens[2].toLowerCase());
            $(`[data-user="${name}"]`).parent().remove();
          } else {
            $(".content").children().remove();
          }
        }
        return;
      }
    }
    $(".module").each(function() {
      const H = client.get("HTMLGen");
      if (!shouldFilter($(this), e)) {
        /* Not filtering; format and display the event */
        const $c = $(this).find(".content");
        const $e = H.gen(e);
        /* If a clip is present, display that too */
        const $clip = $e.find(".message[data-clip]");
        if ($clip.length > 0) {
          /* For multiple clips, only display the first clip */
          const slug = $clip.attr("data-clip");
          /* Nested because the second then() needs both clip and game data */
          client.GetClip(slug).then((clip_data) => {
            client.GetGame(clip_data.game_id).then((game_data) => {
              Content.addHTML(H.genClip(slug, clip_data, game_data), $c);
            });
          });
        }
        /* If .at-self or .highlight is given, set the notification icon */
        if (!H.getValue("focus")) {
          if ($e.find(".message.at-self").length > 0) {
            setNotify(true);
          } else if ($e.find(".highlight").length > 0) {
            setNotify(true);
          }
        }
        /* And finally, add it to the page */
        Content.addHTML($e, $c);
      }
    });
    /* Avoid flooding the DOM with stale chat messages */
    const max = getConfigValue("MaxMessages");
    for (const c of $(".content")) {
      while ($(c).find(".line-wrapper").length > max) {
        $(c).find(".line-wrapper").first().remove();
      }
    }
  });

  /* Received CLEARCHAT event */
  client.bind("twitch-clearchat", function _on_twitch_clearchat(e) {
    if (e.flags["target-user-id"]) {
      /* Moderator timed out a user */
      const r = CSS.escape(e.flags["room-id"]);
      const u = CSS.escape(e.flags["target-user-id"]);
      const l = $(`.chat-line[data-channel-id="${r}"][data-user-id="${u}"]`);
      l.parent().remove();
    } else {
      /* Moderator cleared the chat */
      $("div.content").find(".line-wrapper").remove();
    }
  });

  /* Received CLEARMSG event */
  client.bind("twitch-clearmsg", function _on_twitch_clearmsg(e) {
    Util.StorageAppend(LOG_KEY, e);
    Util.Warn("Unhandled CLEARMSG:", e);
  });

  /* User subscribed */
  client.bind("twitch-sub", function _on_twitch_sub(e) {
    Util.StorageAppend(LOG_KEY, e);
    Content.addHTML(client.get("HTMLGen").sub(e));
  });

  /* User resubscribed */
  client.bind("twitch-resub", function _on_twitch_resub(e) {
    Util.StorageAppend(LOG_KEY, e);
    Content.addHTML(client.get("HTMLGen").resub(e));
    /* Display the resub message, if one is present */
    if (e.message) {
      const $msg = client.get("HTMLGen").gen(e);
      $msg.addClass("message");
      $msg.addClass("sub-message");
      $msg.addClass("sub-user-message");
      Content.addHTML($msg);
    }
  });

  /* User gifted a subscription */
  client.bind("twitch-giftsub", function _on_twitch_giftsub(e) {
    Util.StorageAppend(LOG_KEY, e);
    Content.addHTML(client.get("HTMLGen").giftsub(e));
  });

  /* Anonymous user gifted a subscription */
  client.bind("twitch-anongiftsub", function _on_twitch_anongiftsub(e) {
    Util.StorageAppend(LOG_KEY, e);
    Content.addHTML(client.get("HTMLGen").anongiftsub(e));
  });

  /* Channel was raided */
  client.bind("twitch-raid", function _on_twitch_raid(e) {
    Util.StorageAppend(LOG_KEY, e);
    Content.addHTML(client.get("HTMLGen").raid(e));
  });

  /* New user's greeting message */
  client.bind("twitch-newuser", function _on_twitch_newuser(e) {
    Util.StorageAppend(LOG_KEY, e);
    const H = client.get("HTMLGen");
    const $msg = H.newUser(e);
    $msg.find(".message").addClass("effect-rainbow").addClass("effect-disco");
    Content.addHTML($msg);
    Content.addHTML(H.gen(e));
  });

  /* User gifting rewards to the community (seasonal) */
  client.bind("twitch-rewardgift", function _on_twitch_rewardgift(e) {
    Util.StorageAppend(LOG_KEY, e);
    Content.addHTML(client.get("HTMLGen").rewardGift(e));
  });

  /* User gifting a subscription to the community */
  client.bind("twitch-mysterygift", function _on_twitch_mysterygift(e) {
    Util.StorageAppend(LOG_KEY, e);
    Content.addHTML(client.get("HTMLGen").mysteryGift(e));
  });

  /* User continuing their gifted subscription */
  client.bind("twitch-giftupgrade", function _on_twitch_giftupgrade(e) {
    Util.StorageAppend(LOG_KEY, e);
    Content.addHTML(client.get("HTMLGen").giftUpgrade(e));
  });

  /* User continuing their gifted subscription via Twitch Prime */
  client.bind("twitch-primeupgrade", function _on_twitch_primegiftupgrade(e) {
    Util.StorageAppend(LOG_KEY, e);
    Content.addHTML(client.get("HTMLGen").giftUpgrade(e));
  });

  /* User continuing their anonymously-gifted subscription */
  client.bind("twitch-anongiftupgrade", function _on_twitch_anongiftupgrade(e) {
    Util.StorageAppend(LOG_KEY, e);
    Content.addHTML(client.get("HTMLGen").giftUpgrade(e));
  });

  /* Received some other kind of usernotice */
  client.bind("twitch-otherusernotice", function _on_twitch_otherusernotice(e) {
    Util.StorageAppend(LOG_KEY, e);
    Util.Warn("Unknown USERNOTICE", e);
    /* TODO: bitsbadgetier */
  });

  /* Streamer is hosting someone else */
  client.bind("twitch-hosttarget", function _on_twitch_hosttarget(e) {
    const channel = e.channelString.escape();
    const target = Strings.Streamer(e.user);
    const $m = $(`<span class="host-message"></span>`);
    const $btn = $(`<span class="btn url">Click here to join!</span>`);
    /* A user of "-" refers to an "unhost" */
    if (e.user !== "-") {
      $m.html(`${channel} is hosting #${target}: `);
      /* Leave the hosting channel and join the hosted channel */
      $btn.click(() => {
        client.LeaveChannel(channel);
        client.JoinChannel(e.user);
      });
      $m.append($btn);
      Content.addNotice($m);
    }
  });

  /* Received notice of assets loaded */
  client.bind("twitch-assetloaded", function(e) {});

  /* Received a reconnect request from Twitch (handled automatically) */
  client.bind("twitch-reconnect", function(e) {});

  /* Bind to the rest of the events */
  client.bind("twitch-join", function(e) {});
  client.bind("twitch-part", function(e) {});
  client.bind("twitch-userstate", function(e) {});
  client.bind("twitch-roomstate", function(e) {});
  client.bind("twitch-globaluserstate", function(e) {});
  client.bind("twitch-usernotice", function(e) {});
  client.bind("twitch-ack", function(e) {});
  client.bind("twitch-ping", function(e) {});
  client.bind("twitch-names", function(e) {});
  client.bind("twitch-topic", function(e) {});
  client.bind("twitch-privmsg", function(e) {});
  client.bind("twitch-whisper", function(e) {});
  client.bind("twitch-mode", function(e) {});
  client.bind("twitch-other", function(e) {});

  /* Warn about unbound events */
  client.bindDefault(function _on_default(e) {
    Util.Warn("Unbound event:", e);
    Util.StorageAppend(LOG_KEY, e);
  });

  /* Finally, connect */
  client.Connect();
}

/* globals AssetPaths Strings CSSCheerStyles ColorNames GIT_URL CUR_URL */
/* globals LOG_KEY CFG_KEY HTMLGenerator GetLayout ParseLayout FormatLayout */
/* globals Fanfare */

/* vim-fold-set: ^  [^ ].*function.*{$: */
/* vim: set ts=2 sts=2 sw=2 et: */
