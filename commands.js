/* Twitch Filtered Chat Commands */

"use strict";

/*** Adding a chat command:
 * ChatCommands.add(command, function, description, args...)
 *   command      (string) chat command to add, executed via //command
 *   function     a function taking the following arguments
 *     cmd        the command being executed (value of `command` parameter)
 *     tokens     the arguments passed to the command when ran
 *     client     a reference to the TwitchClient object
 *     args...    extra arguments passed to ChatCommands.add, as-is
 *   description  (string) a description of the command to be printed in //help
 *   args         (optional) extra arguments to pass to the function
 *   completers   (Array, optional) completion functions
 *
 *** Completion functions:
 * completer_func(client, cmd_object, curr_state) -> [words...]
 *   client       a reference to the TwitchClient object
 *   curr_state   the current completion state
 *     text         the entire String being completed
 *     textBefore   the text before the tab position
 *     wordPos      the location of the word being completed
 *     prefix       text to insert before the completed word (modifiable)
 *     currWord     the word being completed
 * Return a list of valid completion words, which can be empty. Note that
 * the curr_state.prefix field can be modified if desired.
 *
 *** Special configuration:
 * If executing a command results in a "cyclic object value" error, then add
 * the following after adding the command:
 *   ChatCommands.configureCommand("//mycommand", {disableClone: true})
 * This will disable the JSONClone() in the command execution.
 * WARNING: This allows the command to modify its own definition!!
 *
 *** General example:
 * Run the following JavaScript:
 *   ChatCommands.add("mycommand", myFunc, "My new command", 1, 2)
 * Type the following into chat:
 *   "//mycommand value1 value2"
 * This results in the following call:
 *   myFunc("mycommand", ["value1", "value2"], client, 1, 2)
 *
 *** Completion example:
 * Run the following JavaScript:
 *   ChatCommands.add("mycommand", myFunc, "My new command", 1, 2)
 *   ChatCommands.addCommandCompleter("mycommand",
 *     function(client, curr_state) {
 *       return ["param1", "param2", "param3"];
 *     });
 * Type the following into chat (where "<tab>" is the literal tab key):
 *   "//mycommand <tab>"
 * This results in the following output:
 *   "//mycommand param1"
 * Pressing <tab> again cycles through the words.
 */

/* FIXME: Retain text after tab: "foo @<tab> foo" -> "foo @user foo" */

/* TODO: Implement //plugins addremote <class> <url> [<config>] */

var ChatCommands = null; /* exported ChatCommands */

class ChatCommandManager {
  constructor() {
    this._commands = {};
    this._aliases = {};
    this._completions = {};
    this._helpText = [];
    this.add("help", this.onCommandHelp.bind(this), "Show help information");
    this.addUsage("help", null, "Show help for all commands");
    this.addUsage("help", "command", "Show usage information for <command>");
    this.addAlias("?", "help");
  }

  /* Trim leading "//" or "." */
  _trim(msg) {
    return msg.replace(/^\/\//, "").replace(/^\./, "");
  }

  /* Add text to be shown in //help */
  addHelpText(text, opts=null) {
    let o = opts || {};
    let t = text;
    if (o.indent) t = "&nbsp;&nbsp;" + t;
    if (o.literal) t = t.escape();
    if (o.args) t = this.formatArgs(t);
    if (o.command) {
      let cmd = t.substr(0, t.indexOf(":"));
      let msg = t.substr(t.indexOf(":")+1);
      t = this.helpLine(cmd, msg);
    }
    this._helpText.push(t);
  }

  /* Add a new command */
  add(command, func, desc, ...args) {
    let c = {};
    if (!command.match(/^[a-z0-9_-]+$/)) {
      Util.Error(`Invalid command "${command.escape()}"`);
    } else {
      if (typeof(func) !== "function") {
        Util.Warn(`Adding command ${command}: "func" is not a function`);
      }
      if (!desc) {
        Util.Warn(`Adding command ${command}: description is empty`);
      }
      c.name = command;
      c.func = func;
      c.desc = desc;
      c.aliases = [];
      c.extra_help = [];
      c.dflt_args = args.length > 0 ? args : null;
      c.completers = [];
      c.attributes = {}; /* Modified via configureCommand */
      this._commands[command] = c;
    }
  }

  /* Configure advanced attributes to modify how a command is invoked */
  configureCommand(command, config) {
    if (this.hasCommand(command, true)) {
      const cmd = this.getCommand(command, true);
      if (config.disableClone) {
        cmd.attributes.disableClone = true;
      }
    } else {
      Util.Error(`No such command ${command}`);
    }
  }

  /* Add an alias to an existing command */
  addAlias(command, referred_command) {
    if (this.hasCommand(referred_command, true)) {
      this._aliases[command] = referred_command;
      this._commands[referred_command].aliases.push(command);
    } else {
      Util.Error(`Invalid command: ${referred_command}`);
    }
  }

  /* Add a usage line to an existing command */
  addUsage(command, argstr, usagestr, opts=null) {
    if (this.hasCommand(command, true)) {
      let c = this.getCommand(command);
      if (!c.usage) c.usage = [];
      c.usage.push({args: argstr, usage: usagestr, opts: opts || {}});
    } else {
      Util.Error(`Invalid command: ${command}`);
    }
  }

  /* Add extra text to be shown in a command's help text */
  addHelp(command, text) {
    if (this.hasCommand(command)) {
      this._commands[command].extra_help.push(text);
    } else {
      Util.Error(`addHelpText: No such command ${command}`);
    }
  }

  /* Tab completion API {{{0 */

  /* Add a tab-completion function to the given command */
  addCommandCompleter(cmd, completer_func) {
    const cmd_obj = this.getCommand(cmd);
    if (cmd_obj !== null) {
      cmd_obj.completers.push(completer_func);
    } else {
      Util.Error("Adding completer to invalid command", cmd);
    }
  }

  /* Request completion of the given completion object */
  complete(client, cargs) {
    let text = cargs.oText; /* input/output */
    let pos = cargs.oPos;   /* input/output */
    let idx = cargs.index;  /* input/output */
    let matches = [];
    /* Text before tab: "test te<tab>" -> "test te" */
    let textBefore = text.substr(0, pos);
    /* Word being tab-completed: "test te<tab>" -> "te" */
    let wordPos = textBefore.search(/(?<=\s)\S*$/);
    /* Text to insert before the match (including any leading symbols) */
    let prefix = null;
    /* The word to complete */
    let currWord = null;
    /* Text to add after the completed word */
    let suffix = null;
    if (wordPos > -1) {
      prefix = textBefore.substr(0, wordPos);
      currWord = textBefore.substr(wordPos).trimStart();
    } else {
      prefix = "";
      currWord = textBefore;
      suffix = " ";
    }

    Util.DebugOnly("Completing text \"%s\", pos %d, idx %d, wpos %d",
      text, pos, idx, wordPos);
    Util.DebugOnly("Text before: \"%s\"", textBefore);
    Util.DebugOnly("Prefix: \"%s\"", prefix);
    Util.DebugOnly("Current word: \"%s\"", currWord);
    let completed = false;

    /* Complete @<user> sequences */
    if (currWord.startsWith("@")) {
      const part = currWord.substr(1);
      for (const c of client.GetJoinedChannels()) {
        const ci = client.GetChannelInfo(c);
        if (ci.users) {
          const users = ci.users.map((u) => u.toLowerCase());
          matches.extend(users.filter((u) => u.startsWith(part)));
        }
      }
      const uname = client.GetName().toLowerCase();
      if (uname.startsWith(part)) {
        matches.push(uname);
      }
      if (!prefix.endsWith("@")) {
        prefix = prefix + "@";
      }
      completed = matches.length > 0;
    }

    /* Complete channel names */
    if (!completed && currWord.startsWith("#")) {
      for (let c of client.GetJoinedChannels()) {
        if (c.toLowerCase().startsWith(currWord)) {
          matches.push(c);
        }
      }
      if (matches.length > 0) {
        completed = true;
        if (prefix.endsWith("#")) {
          prefix = prefix.substr(0, prefix.length-1);
        }
      }
    }

    const wordBefore = textBefore.trimEnd();
    /* Complete a specific command */
    if (!completed && this.hasCommand(wordBefore)) {
      let cobj = this.getCommand(wordBefore);
      for (const completer of cobj.completers) {
        const cstate = {
          text: text,
          textBefore: textBefore,
          wordPos: wordPos,
          prefix: prefix,
          currWord: currWord
        };
        const cfunc = completer.bind(cobj);
        matches.extend(cfunc(client, cstate));
        if (cstate.prefix !== prefix) {
          prefix = cstate.prefix;
        }
      }
      completed = matches.length > 0;
    }

    /* Complete commands */
    if (!completed && this.isCommandStr(text)) {
      let word = this._trim(text.substr(0, pos));
      for (let k of Object.keys(this._commands).sort()) {
        if (word.length === 0 || k.startsWith(word)) {
          matches.push(k);
        }
      }
      prefix = word ? text.substr(0, text.indexOf(word)) : text;
    }

    /* If matches were found, return one */
    if (matches.length > 0) {
      /* Remove duplicates from matches */
      const final_matches = [];
      for (const elem of matches) {
        if (!final_matches.includes(elem)) {
          final_matches.push(elem);
        }
      }
      matches = final_matches;

      if (idx < matches.length) {
        text = prefix + matches[idx];
        pos = text.length;
        if (suffix !== null) {
          text += suffix;
        }
        idx += 1;
      }
      if (idx >= matches.length) {
        idx = 0;
      }
    } else {
      text = cargs.oText;
      pos = cargs.oPos;
    }

    return {
      oText: cargs.oText,
      oPos: cargs.oPos,
      cText: text,
      cPos: text.length,
      index: idx
    };
  }

  /* End tab completion API 0}}} */

  /* Return whether or not the message is a command */
  isCommandStr(msg) {
    return msg.match(/^\/\//) || msg.match(/^\./);
  }

  /* Return whether or not the message invokes a valid command */
  hasCommand(msg, native_only=false) {
    let cmd = this._trim(msg);
    if (this._commands.hasOwnProperty(cmd)) {
      return true;
    } else if (!native_only && this._aliases.hasOwnProperty(cmd)) {
      return true;
    }
    return false;
  }

  /* Execute a command */
  execute(msg, client) {
    if (this.isCommandStr(msg)) {
      let cmd = this._trim(msg.split(" ")[0]);
      let tokens = msg.replace(/[\s]*$/, "").split(" ").slice(1);
      /* Executing "//" or "." invokes "//help" */
      if (this._trim(msg).length === 0) {
        cmd = "help";
        tokens = [];
      }
      if (this.hasCommand(cmd)) {
        try {
          let c = this.getCommand(cmd);
          let obj = Object.create(this);
          obj.formatUsage = this.formatUsage.bind(this, c);
          obj.printUsage = this.printUsage.bind(this, c);
          obj.formatHelp = this.formatHelp.bind(this, c);
          obj.printHelp = this.printHelp.bind(this, c);
          obj.command = cmd;
          obj.cmd_func = c.func;
          obj.cmd_desc = c.desc;
          obj.cmd_extra_help = c.extra_help;
          obj.cmd_attributes = c.attributes;
          if (c.attributes.disableClone) {
            obj.cmd_dflt_args = c.dflt_args;
            obj.cmd_completers = c.completers;
          } else {
            obj.cmd_dflt_args = Util.JSONClone(c.dflt_args);
            obj.cmd_completers = Util.JSONClone(c.completers);
          }
          if (Util.DebugLevel >= Util.LEVEL_DEBUG) {
            let args = Util.JSONClone(tokens);
            if (c.dflt_args) {
              args.extend(c.dflt_args);
            }
            let arg_str = args.map((e) => `"${Util.EscapeSlashes(`${e}`)}"`).join(", ");
            Util.DebugOnly(`${cmd}(${arg_str})`);
          }
          if (c.dflt_args) {
            c.func.bind(obj)(cmd, tokens, client, ...c.dflt_args);
          } else {
            c.func.bind(obj)(cmd, tokens, client);
          }
        }
        catch (e) {
          Content.addErrorText(`${cmd}: ${e.name}: ${e.message}`);
          Util.Error(e);
        }
      } else {
        Content.addErrorText(`${cmd}: unknown command`);
      }
    } else {
      Content.addErrorText(`${JSON.stringify(msg)}: not a command string`);
    }
  }

  /* Return an array of valid command names */
  getCommands() {
    return Object.keys(this._commands);
  }

  /* Return a command object by command name (optionally excluding aliases) */
  getCommand(msg, native_only=false) {
    let cname = this._trim(msg);
    let c = null;
    if (this._aliases.hasOwnProperty(cname)) {
      cname = this._aliases[cname];
    }
    if (this._commands.hasOwnProperty(cname)) {
      c = this._commands[cname];
      if (!c && !native_only && this._commands[this._aliases[cname]]) {
        c = this._commands[this._aliases[cname]];
      }
    }
    return c;
  }

  /* Formatting API {{{0 */

  /* Format the help text for the given command object */
  formatHelp(cmd) {
    return this.helpLine(`//${cmd.name}`, cmd.desc, true);
  }

  /* Format the usage text for the given command name */
  formatUsage(cmd) {
    let usages = [];
    if (cmd.usage) {
      for (let entry of cmd.usage) {
        let usagestr = this.formatArgs(entry.usage);
        if (entry.args) {
          let argstr = this.formatArgs(entry.args);
          usages.push(this.helpLine(`//${cmd.name} ${argstr}`, usagestr));
        } else {
          usages.push(this.helpLine(`//${cmd.name}`, usagestr));
        }
      }
    } else {
      usages.push(this.helpLine(`//${cmd.name}`, this.formatArgs(cmd.desc)));
    }
    for (let a of cmd.aliases) {
      usages.push(this.helpLine(`//${a}`, `Alias for command //${cmd.name}`,
                                true));
    }
    return usages;
  }

  /* Helper: format a string as an argument */
  arg(s) {
    return `<span class="arg">${s.escape()}</span>`;
  }

  /* Helper: format a help line key/value pair (optionally escaping HTML) */
  helpLine(k, v, esc=false) {
    let d1 = `<div>${esc ? k.escape() : k}</div>`;
    let d2 = `<div>${esc ? v.escape() : v}</div>`;
    return `<div class="help-line">${d1}${d2}</div>`;
  }

  /* Helper: format a help line similar to helpLine */
  helpTextLine(text, esc=false) {
    let d = `<div>${esc ? text.escape() : text}</div>`;
    return `<div class="help-text-line">${d}</div>`;
  }

  /* Helper: format "<arg>" and "*arg*" in the given string */
  formatArgs(s) {
    let result = s;
    let repl = [
      [/<(\w+)>/g, (m, g) => `&lt;${this.arg(g)}&gt;`],
      [/\*(\w+)\*/g, (m, g) => `<span class="b">${g.escape()}</span>`]
    ];
    for (let [pat, func] of repl) {
      result = result.replace(pat, func);
    }
    return result;
  }

  /* End formatting API 0}}} */

  /* Print the usage information for the given command object */
  printUsage(cmdobj, inclUsageString=true) {
    if (inclUsageString) {
      Content.addHelpText("Usage:");
    }
    for (let line of this.formatUsage(cmdobj)) {
      Content.addHelp(line);
    }
  }

  /* Print the help information for the given command object */
  printHelp(cmdobj) {
    Content.addHelp(this.formatHelp(cmdobj));
  }

  /* Handle builtin //help command */
  onCommandHelp(cmd, tokens, client) {
    if (tokens.length === 0) {
      Content.addHelpText("Commands:");
      for (let c of Object.keys(this._commands)) {
        this.printHelp(this._commands[c]);
      }
      Content.addHelp(this.formatArgs(
        "Enter //help <command> for help on <command>"));
      for (let line of this._helpText) {
        Content.addHelp(line);
      }

      const htmlgen = client.get("HTMLGen");
      if (htmlgen.enableAntics) {
        Content.addHelpText("Mod antics are enabled:");
        for (const [cmds, d] of htmlgen.anticsCommands) {
          Content.addHelpLine(cmds.join(", "), d);
        }
      }
    } else if (this.hasCommand(tokens[0])) {
      Content.addHelpText("Commands:");
      let obj = this.getCommand(tokens[0]);
      for (let line of this.formatUsage(obj)) {
        Content.addHelp(line);
      }
      for (let line of obj.extra_help) {
        Content.addHelp(line);
      }
    } else {
      Content.addErrorText(`Invalid command ${tokens[0]}`);
    }
  }
}

/* //log: manage debug-msg-log content */
function onCommandLog(cmd, tokens, client) {
  let t0 = tokens.length > 0 ? tokens[0] : "";
  let logs = Util.GetWebStorage(LOG_KEY) || [];
  const logCount = logs.length;
  const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
  Content.addHelpText(`Debug message log length: ${logCount}`);
  /* JSON-encode an object, inserting spaces around items */
  function toJSONString(obj) {
    return JSON.stringify(obj, null, 1)
      .replace(/\[[ \n]*/g, "[")
      .replace(/[\n ]*\]/g, "]")
      .replace(/{[ \n]*/g, "{")
      .replace(/[\n ]*}/g, "}")
      .replace(/[ ]*\n[ ]*/g, ' ');
  }
  /* Format a log message for printing */
  function formatLogEntry(log, escape=true) {
    let result = toJSONString(log);
    if (log && log._cmd && log._raw && log._parsed) {
      /* Smells like a TwitchEvent */
      let lines = [
        "TwitchEvent",
        log._cmd,
        toJSONString(log._raw),
        toJSONString(log._parsed)
      ];
      if (log._stacktrace) {
        lines.push(toJSONString(log._stacktrace));
      }
      result = lines.join(" ");
    }
    return escape ? result.escape() : result;
  }
  /* Find matching and non-matching items */
  function filterLogs(s, invert=false) {
    let matched = [];
    let unmatched = [];
    for (let l of logs) {
      if (toJSONString(l).includes(s)) {
        matched.push(l);
      } else {
        unmatched.push(l);
      }
    }
    if (invert) {
      return [unmatched, matched];
    } else {
      return [matched, unmatched];
    }
  }
  if (tokens.length > 0) {
    if (t0 === "help") {
      this.printHelp();
      this.printUsage();
    } else if (t0 === "show") {
      for (let [i, l] of Object.entries(logs)) {
        Content.addHelp(`${i}: ${formatLogEntry(l)}`);
      }
    } else if (t0 === "export") {
      Util.Open(AssetPaths.LOG_EXPORT_WINDOW, "_blank", {});
    } else if (t0 === "summary") {
      let lines = [];
      let line = [];
      for (let l of Object.values(logs)) {
        line.push(l._cmd || toJSONString(l).substr(0, 10));
        if (line.length >= 10) {
          lines.push(line);
          line = [];
        }
      }
      if (line.length > 0) {
        lines.push(line);
      }
      let lnum = 0;
      for (let lidx = 0; lidx < lines.length; ++lidx) {
        let l = lines[lidx];
        let s = l.join(" ");
        Content.addHelpText(`${lnum}-${lnum+l.length-1}: ${s}`);
        lnum += l.length;
      }
    } else if (["search", "filter", "filter-out"].indexOf(t0) > -1) {
      if (tokens.length > 1) {
        let needle = tokens.slice(1).join(" ");
        let invert = t0 === "filter-out";
        let [matched, unmatched] = filterLogs(needle, invert);
        let pl = plural(matched.length, "item");
        Content.addHelpText(`Found ${pl} containing "${needle}"`);
        if (t0 === "search") {
          for (let [i, l] of matched) {
            let desc = l._cmd || toJSONString(l).substr(0, 10);
            Content.addHelpText(`${i}: ${desc}`);
          }
        } else {
          Content.addHelpText(`Removing ${unmatched.length}/${logCount} items`);
          Content.addHelpText(`New logs length: ${matched.length}`);
          Util.SetWebStorage(LOG_KEY, matched.map((i) => i[1]));
        }
      } else {
        Content.addHelpText(`Usage: //log ${t0} <string>`);
      }
    } else if (t0 === "remove") {
      let n = tokens.slice(1)
        .filter((e) => Util.IsNumber(e))
        .map((e) => Util.ParseNumber(e));
      if (n.length > 0) {
        Content.addHelpText(`Removing ${plural(n.length, "item")}`);
        let result = [];
        /* All items other than those listed in n */
        for (let i = 0; i < logCount; ++i) {
          if (n.indexOf(i) === -1) {
            result.push(logs[i]);
          }
        }
        Content.addHelpText(`New logs length: ${result.length}`);
        Util.SetWebStorage(LOG_KEY, result);
      } else {
        Content.addHelpText("No items to remove");
      }
    } else if (t0 === "shift") {
      let num = 1;
      if (tokens.length > 1 && Util.IsNumber(tokens[1])) {
        num = Util.ParseNumber(tokens[1]);
      }
      for (let i = 0; i < num && logCount > 0; ++i) {
        logs.shift();
      }
      Content.addHelpText(`New logs length: ${logCount}`);
      Util.SetWebStorage(LOG_KEY, logs);
    } else if (t0 === "pop") {
      let num = 1;
      if (tokens.length > 1 && Util.IsNumber(tokens[1])) {
        num = Util.ParseNumber(tokens[1]);
      }
      for (let i = 0; i < num && logCount > 0; ++i) {
        logs.pop();
      }
      Content.addHelpText(`New logs length: ${logCount}`);
      Util.SetWebStorage(LOG_KEY, logs);
    } else if (t0 === "size") {
      let b = toJSONString(logs).length;
      Content.addHelpText(`Logged bytes: ${b} (${b/1024.0} KB)`);
    } else if (t0 === "clear") {
      Util.SetWebStorage(LOG_KEY, []);
      Content.addHelpText("Log cleared");
    } else if (t0 === "replay" || t0 === "replay-match") {
      let replay = [];
      /* eslint-disable-next-line no-inner-declarations */
      function addEntry(l) {
        if (l && l._cmd && l._raw) {
          replay.push(l._raw);
        }
      }
      if (tokens.length === 0) {
        Content.addHelpText(`Usage: //log replay all`);
        Content.addHelpText(`Usage: //log replay <number>`);
        Content.addHelpText(`Usage: //log replay-match <string>`);
      } else {
        let t1 = tokens[1];
        let idx = Util.ParseNumber(t1);
        if (t0 === "replay-match") {
          /* Replay items matching expression */
          let needle = tokens.slice(1).join(" ");
          for (let m of filterLogs(needle)[0]) {
            addEntry(m);
          }
        } else if (t1 === "all") {
          /* Replay everything */
          for (let line of logs) {
            addEntry(line);
          }
        } else if (idx >= 0 && idx < logCount) {
          /* Replay one item */
          addEntry(logs[idx]);
        } else {
          Content.addErrorText(`Index ${idx} not between 0 and ${logCount}`);
        }
        for (let line of replay) {
          Content.addHelpText(`Replaying ${line}`);
          client._onWebsocketMessage({data: line});
        }
      }
    } else if (Util.IsNumber(t0)) {
      /* Show item by index */
      let idx = Util.ParseNumber(t0);
      Content.addHelp(formatLogEntry(logs[idx]));
    } else {
      Content.addHelpText(`Unknown argument ${t0}`);
    }
  } else {
    this.printUsage();
  }
}

/* //clear: clear one or all modules */
function onCommandClear(cmd, tokens, client) {
  if (tokens.length === 0) {
    $(".content").find(".line-wrapper").remove();
  } else if (tokens[0].match(/module[\d]+/)) {
    let e = document.getElementById(tokens[0]);
    if (e) {
      $(e).find(".line-wrapper").remove();
    } else {
      Content.addHelpText(`Unknown module ${tokens[0]}`);
    }
  } else {
    this.printUsage();
  }
}

/* //join: join a channel */
function onCommandJoin(cmd, tokens, client) {
  if (tokens.length > 0) {
    let cdef = Twitch.ParseChannel(tokens[0]);
    let toJoin = cdef.channel; /* Sanitizes the channel token */
    if (toJoin !== null) {
      if (!client.IsInChannel(toJoin)) {
        client.JoinChannel(toJoin);
      } else {
        Content.addNoticeText(`Failed joining ${toJoin}: already in channel`);
      }
    }
  } else {
    this.printUsage();
  }
}

/* //part: leave a channel */
function onCommandPart(cmd, tokens, client) {
  if (tokens.length > 0) {
    let cdef = Twitch.ParseChannel(tokens[0]);
    let toPart = cdef.channel; /* Sanitizes the channel token */
    if (toPart !== null) {
      if (client.IsInChannel(toPart)) {
        client.LeaveChannel(toPart);
      } else {
        Content.addNoticeText(`Failed leaving ${toPart}: not in channel`);
      }
    }
  } else {
    this.printUsage();
  }
}

/* //badges: display known badge images */
function onCommandBadges(cmd, tokens, client) {
  let badges = [];
  /* Obtain global badges */
  for (let [bname, badge] of Object.entries(client.GetGlobalBadges())) {
    for (let bdef of Object.values(badge.versions)) {
      let url = bdef.image_url_2x;
      let size = 36;
      if (tokens.indexOf("small") > -1) {
        url = bdef.image_url_1x;
        size = 18;
      } else if (tokens.indexOf("large") > -1) {
        url = bdef.image_url_4x;
        size = 72;
      }
      let attr = `width="${size}" height="${size}" title="${bname}"`;
      badges.push(`<img src="${url}" ${attr} alt="${bname}" />`);
    }
  }
  /* Print global badges */
  Content.addNotice(badges.join(""));
  /* Obtain channel badges */
  for (let ch of client.GetJoinedChannels()) {
    badges = [];
    for (let [bn, b] of Object.entries(client.GetChannelBadges(ch))) {
      for (let [months, bdef] of Object.entries(b)) {
        let url = bdef.image_url_4x || bdef.image_url_2x || bdef.image_url_1x;
        let size = "width=\"36\" height=\"36\"";
        let t = `${bn} ${months} ${bdef.description} ${bdef.title}`;
        badges.push(`<img src="${url}" ${size} title="${t}" alt="${t}" />`);
      }
    }
    /* Print channel badges */
    Content.addNotice(Twitch.FormatChannel(ch) + ": " + badges.join(""));
  }
}

/* //cheers: display known cheermotes */
function onCommandCheers(cmd, tokens, client) {
  let cheers = client.GetCheers();
  let [bg, scale, state] = [null, null, null];
  if (tokens.includes("dark")) bg = "dark";
  else if (tokens.includes("light")) bg = "light";
  if (tokens.includes("scale1")) scale = "1";
  else if (tokens.includes("scale1.5")) scale = "1.5";
  else if (tokens.includes("scale2")) scale = "2";
  else if (tokens.includes("scale3")) scale = "3";
  else if (tokens.includes("scale4")) scale = "4";
  if (tokens.includes("static")) state = "static";
  else if (tokens.includes("animated")) state = "animated";
  const formatCheer = (ch, c) => {
    let html = [];
    let [img_bg, img_scale, img_state] = [bg, scale, state];
    if (bg === null) {
      img_bg = c.backgrounds.includes("dark") ? "dark" : c.backgrounds[0];
    }
    if (scale === null) {
      img_scale = c.scales.map((n) => Util.ParseNumber(n)).min();
    }
    if (state === null) {
      if ($("#cbAnimCheers").is(":checked")) {
        img_state = c.states.includes("animated") ? "animated" : c.states[0];
      } else {
        img_state = c.states.includes("static") ? "static" : c.states[0];
      }
    }
    for (let tdef of Object.values(c.tiers)) {
      let nbits = tdef.min_bits;
      let src = tdef.images[img_bg][img_state][img_scale];
      let desc = `${ch} ${c.prefix} ${nbits}`.escape();
      let e = `<img src="${src}" alt="${desc}" title="${desc}" />`;
      html.push(e);
    }
    return html.join("");
  };
  let seen = {};
  for (let [cname, cheerdefs] of Object.entries(cheers)) {
    let html = [];
    for (let [cheername, cheerdef] of Object.entries(cheerdefs)) {
      if (!seen[cheername]) {
        html.push(formatCheer(cname, cheerdef));
        seen[cheername] = 1;
      }
    }
    if (html.length > 0) {
      if (cname === "GLOBAL") {
        Content.addInfoText(`Global cheermotes:`);
      } else {
        Content.addInfoText(`Cheermotes for channel ${cname}:`);
      }
      Content.addInfo(html.join(""));
    }
  }
}

/* //emotes: display known emotes */
function onCommandEmotes(cmd, tokens, client) {
  let to_display = [];
  const toImage = (source, name, url) => {
    return client.get("HTMLGen").genEmote(source, name, url);
  };

  let s_emotes = {};
  for (let [eset, eids] of Object.entries(client.GetEmoteSets())) {
    let emotes = [];
    for (let eid of eids) {
      let edesc = `${client.GetEmoteName(eid)}\nID: ${eid}`;
      let emote = toImage("twitch", edesc, client.GetEmote(eid));
      if (emotes.indexOf(emote) === -1) {
        emotes.push(emote);
      }
    }
    if (emotes.length > 0) {
      s_emotes[eset] = emotes;
    }
  }
  if (tokens.indexOf("global") > -1 || tokens.indexOf("all") > -1) {
    to_display.push(_J(`Global:`,
                       `${s_emotes[TwitchClient.ESET_GLOBAL].join("")}`));
    to_display.push(_J(`Twitch Prime:`,
                       `${s_emotes[TwitchClient.ESET_PRIME].join("")}`));
    to_display.push(_J(`Turbo Set 1:`,
                       `${s_emotes[TwitchClient.ESET_TURBO_1].join("")}`));
    to_display.push(_J(`Turbo Set 2:`,
                       `${s_emotes[TwitchClient.ESET_TURBO_2].join("")}`));
    to_display.push(_J(`Turbo Set 3:`,
                       `${s_emotes[TwitchClient.ESET_TURBO_3].join("")}`));
    to_display.push(_J(`Turbo Set 4:`,
                       `${s_emotes[TwitchClient.ESET_TURBO_4].join("")}`));
  }
  if (tokens.indexOf("channel") > -1 || tokens.indexOf("all") > -1) {
    for (let [eset, emotes] of Object.entries(s_emotes)) {
      if (`${eset}` !== "0") {
        to_display.push(`Set ${eset}: ${emotes.join("")}`);
      }
    }
  }
  if (tokens.indexOf("ffz") > -1 || tokens.indexOf("all") > -1) {
    if (!client.FFZEnabled()) {
      Content.addErrorText("FFZ support is disabled");
    } else {
      for (let ch of client.GetJoinedChannels()) {
        let ffz_imgs = [];
        let emote_def = client.GetFFZEmotes(ch) || {};
        let emotes = emote_def.emotes || [];
        for (let [k, v] of Object.entries(emotes)) {
          if (Object.entries(v.urls).length > 0) {
            let url = Object.values(v.urls)[0];
            ffz_imgs.push(toImage("ffz", k, url));
          }
        }
        if (ffz_imgs.length > 0) {
          to_display.push(`FFZ: ${ch}: ${ffz_imgs.join("")}`);
        }
      }
    }
  }
  if (tokens.indexOf("bttv") > -1 || tokens.indexOf("all") > -1) {
    if (!client.BTTVEnabled()) {
      Content.addErrorText("BTTV support is disabled");
    } else {
      let bttv_emotes = client.GetGlobalBTTVEmotes();
      let bttv_imgs = [];
      for (let [k, v] of Object.entries(bttv_emotes)) {
        bttv_imgs.push(toImage("bttv", k, v.url));
      }
      if (bttv_imgs.length > 0) {
        to_display.push(`BTTV: ${bttv_imgs.join("")}`);
      }
      for (let ch of client.GetJoinedChannels()) {
        bttv_imgs = [];
        for (let edef of Object.values(client.GetBTTVEmotes(ch))) {
          let desc = `${edef.code} (#${edef.channel})`;
          bttv_imgs.push(toImage("bttv", desc, edef.url));
        }
        if (bttv_imgs.length > 0) {
          to_display.push(`BTTV: ${ch}: ${bttv_imgs.join("")}`);
        }
      }
    }
  }
  if (to_display.length === 0) {
    this.printUsage();
    let num = Object.entries(s_emotes).length;
    Content.addHelpTextLine(`There are ${num} available emote sets`);
  } else {
    for (let msg of to_display) {
      Content.addNotice(msg);
    }
  }
}

/* //plugins: manage plugins */
function onCommandPlugins(cmd, tokens, client) {
  let t0 = (tokens.length > 0 ? tokens[0] : null);
  if (Plugins.plugins) {
    if (t0 === null || t0 === "list") {
      for (let [n, p] of Object.entries(Plugins.plugins)) {
        let msg = `${n}: ${p.file} @ ${p.order}`;
        if (p._error) {
          let estr = JSON.stringify(p._error_obj);
          Content.addErrorText(`${msg}: Failed: ${estr}`);
        } else if (p._loaded) {
          msg = `${msg}: Loaded`;
          if (p.commands) {
            msg = `${msg}: Commands: ${p.commands.join(" ")}`;
          }
          Content.addPreText(msg);
        }
      }
    } else if (t0 === "add" || t0 === "load") {
      if (tokens.length >= 3) {
        let cls = tokens[1];
        let file = tokens[2];
        let cfg = {};
        Plugins.add({ctor: cls, file: file});
        if (tokens.length >= 4) {
          let cfgStr = tokens.slice(3).join(" ");
          try {
            cfg = JSON.parse(cfgStr);
          } catch (err) {
            Content.addErrorText(_J(`Malformed JSON string "${cfgStr}";`,
                                    "ignoring"));
          }
        }
        Plugins.load(cls, client, {PluginConfig: cfg}).then(() => {
          Content.addInfoText(`Successfully loaded plugin ${cls}`);
        }).catch((err) => {
          Util.Error("Failed to load plugin", cls, err);
          Content.addErrorText(`Failed to load plugin ${cls}: ${err}`);
        });
        Content.addInfoText(`Added plugin ${cls} from ${file}`);
      } else {
        Content.addErrorText("//plugins add: not enough arguments");
      }
    } else if (t0 === "help") {
      Content.addHelpText("Help for //plugins:");
      this.printHelp();
      this.printUsage(false);
    } else {
      Content.addErrorText(`Unknown command ${t0}`);
      this.printHelp();
    }
  } else {
    Content.addErrorText("Plugin information unavailable");
  }
}

/* //client: display client status information */
function onCommandClient(cmd, tokens, client) {
  let cstatus = client.ConnectionStatus();
  let channels = client.GetJoinedChannels() || [];
  let us = client.SelfUserState() || {};
  Content.addHelpText("Client information:");
  Content.addHelpLine("Socket:", cstatus.open ? "Open" : "Closed");
  Content.addHelpLineE("Endpoint:", cstatus.endpoint);
  if (cstatus.connected) {
    Content.addHelpLine("Status:", "Connected");
  } else {
    Content.addHelpLine("Status:", "Not connected");
  }
  Content.addHelpLine("Identified:", cstatus.identified ? "Yes" : "No");
  Content.addHelpLine("Authenticated:", cstatus.authed ? "Yes" : "No");
  Content.addHelpLineE("Name:", client.GetName());
  Content.addHelpLine("FFZ:", client.FFZEnabled() ? "Enabled" : "Disabled");
  Content.addHelpLine("BTTV:", client.BTTVEnabled() ? "Enabled" : "Disabled");
  Content.addHelpLineE("User ID:", `${us.userid}`);
  Content.addHelpText(`Channels connected to: ${channels.length}`);
  for (let c of channels) {
    let ui = us[c] || {};
    let ci = client.GetChannelInfo(c) || {};
    let rooms = Object.keys(ci.rooms || {});
    let num_users = ci.users ? ci.users.length : 0;
    Content.addHelpText(`Channel ${c}:`);
    Content.addHelpLine("Status:", ci.online ? "Online" : "Offline");
    Content.addHelpLineE("ID:", `${ci.id}`);
    Content.addHelpLine("Active users:", `${num_users}`);
    Content.addHelpLineE(`Rooms: ${rooms.length}`, rooms.join(", "));
    if (Object.entries(ui).length > 0) {
      Content.addHelpLineE("User Color:", ui.color || "not set");
      Content.addHelpLineE("User Badges:", JSON.stringify(ui.badges));
      Content.addHelpLineE("Display Name:", `${ui["display-name"]}`);
      Content.addHelpText(`User Info: ${JSON.stringify(ui)}`);
    }
  }
}

/* //raw: send a message directly to Twitch, without parsing */
function onCommandRaw(cmd, tokens, client) {
  client.SendRaw(tokens.join(" "));
}

/* //channels: display connected channels */
function onCommandChannels(cmd, tokens, client) {
  Content.addHelpText("Active channels:");
  for (let channel of client.GetJoinedChannels()) {
    let cinfo = client.GetChannelInfo(channel);
    Content.addHelpText(`${channel} ${cinfo.id}`);
  }
}

/* //highlight: manage highlight patterns */
function onCommandHighlight(cmd, tokens, client) {
  let H = client.get("HTMLGen");
  if (tokens.length === 0 || tokens[0] === "show") {
    Content.addHelpText("Current highlight patterns:");
    for (let idx = 0; idx < H.highlightMatches.length; ++idx) {
      let pat = H.highlightMatches[idx];
      Content.addHelpLineE(`Index ${idx+1}`, `${pat}`);
    }
  } else if (tokens[0] === "add") {
    let patstr = tokens.slice(1).join(" ");
    if (patstr.length > 0) {
      let pat = Util.StringToRegExp(patstr, "g");
      H.addHighlightMatch(pat);
      Content.addHelpText(`Added pattern ${pat}`);
    } else {
      Content.addErrorText(`"//highlight add" requires argument`);
      this.printUsage();
    }
  } else if (tokens[0] === "remove") {
    if (tokens.length > 1) {
      let idx = Util.ParseNumber(tokens[1]);
      let matches = H.highlightMatches;
      let max = H.highlightMatches.length;
      if (idx > 0 && idx <= max) {
        if (idx === 1) {
          matches.shift();
        } else if (idx === matches.length) {
          matches.pop();
        } else {
          let before = matches.slice(0, idx-1);
          let after = matches.slice(idx);
          H.highlightMatches = before.concat(after);
        }
        Content.addHelpText(`Now storing ${H.highlightMatches.length} patterns`);
      } else {
        Content.addErrorText(`Index ${idx} must be between 1 and ${max}`);
      }
    } else {
      Content.addErrorText(`"//highlight remove" requires argument`);
      this.printUsage();
    }
  } else {
    this.printUsage();
  }
}

/* //auth: authentication help */
function onCommandAuth(cmd, tokens, client) {
  let t0 = tokens.length > 0 ? tokens[0] : "";
  if (t0 === "help") {
    Content.addHelpText(`Help for command ${cmd}:`);
    this.printHelp();
    this.printUsage();
  } else if (client.IsAuthed()) {
    Content.addHelpText(`You are authenticated as ${client.GetName()}`);
    if (t0 === "reset") {
      let btn = $(_J(`<span class="btn help" style="color: lightblue;`,
                     `font-weight: bold">Click here to reset your OAuth`,
                     `token</span>`));
      Content.addHelpText(_J("Are you sure you want to reset your OAuth",
                             "token? This cannot be undone!"));
      btn.click(function(e) {
        let resp = prompt(_J("Enter your username if you're ABSOLUTELY",
                             "CERTAIN you want to reset your OAuth",
                             "token\nThis cannot be undone."));
        if (resp === client.GetName()) {
          /* Reset the OAuth token by appending "&pass=" to the query string */
          let qs = window.location.search;
          if (qs.length > 0 && qs[0] === "?") {
            qs += "&pass=";
          } else {
            qs += "?pass=";
          }
          window.location.search = qs;
        } else {
          Content.addError("The value you entered does not match; not resetting");
        }
      });
      Content.addHTML(btn);
    }
  } else {
    let $url = $(`<a target="_blank"></a>`);
    $url.attr("href", Strings.OAUTH_GEN_URL);
    $url.text(Strings.OAUTH_GEN_URL);
    Content.addHelpText("Click this link to generate an OAuth token:");
    Content.addHelp($url);
    Content.addHelpText(_J("Then enter your Twitch username and that OAuth",
                           "token in the settings panel. You can open the",
                           "settings panel by clicking the gear icon in the",
                           "upper-right corner of the page."));
  }
}

/* Call when ready to initialize chat commands. Populates the ChatCommands
 * global variable */
function InitChatCommands() { /* exported InitChatCommands */
  /* Default command definition
   * Structure:
   *  <name>: {
   *    func: <function>,
   *    desc: description of the command (used by //help)
   *    alias: array of command aliases (optional)
   *    usage: array of usage objects:
   *      [0]: string, array, or null: parameter name(s)
   *      [1]: description
   *      [2]: formatting options (optional)
   *    extra: array of extra help text (optional)
   *  }
   */
  const DefaultCommands = {
    "log": {
      func: onCommandLog,
      desc: "Display or manipulate logged messages",
      alias: ["logs"],
      usage: [
        [null, "Display log command usage"],
        ["<number>", "Display the message numbered <number>"],
        ["show", "Display all logged messages (can be a lot of text!)"],
        ["summary", "Display a summary of the logged messages"],
        ["search <string>", "Show logs containing <string>"],
        ["remove <index...>", "Remove items with the given indexes"],
        ["filter <string>", "Remove items that don't contain <string>"],
        ["filter-out <string>", "Remove items containing <string>"],
        ["shift", "Remove the first logged message"],
        ["pop", "Remove the last logged message"],
        ["export", "Open a new window with all the logged items"],
        ["size", "Display the number of bytes used by the log"],
        ["clear", "Clears the entire log (cannot be undone!)"],
        ["replay <index>", "Re-inject logged message <index>"],
        ["replay-match <string>",
         "Re-inject logged messages containing <string>"]
      ]
    },
    "clear": {
      func: onCommandClear,
      desc: "Clears all text from either all modules or the specified module",
      alias: ["nuke"],
      usage: [
        [null, "Clears all text from all visible modules"],
        ["<module>", "Clears all text from <module> (module1, module2)"]
      ]
    },
    "join": {
      func: onCommandJoin,
      desc: "Join a channel",
      alias: ["j"],
      usage: [
        ["<channel>", "Connect to <channel>; leading # is optional"]
      ]
    },
    "part": {
      func: onCommandPart,
      desc: "Leave a channel",
      alias: ["p", "leave"],
      usage: [
        ["<channel>", "Disconnect from <channel>; leading # is optional"]
      ]
    },
    "badges": {
      func: onCommandBadges,
      desc: "Display all known badges"
    },
    "cheers": {
      func: onCommandCheers,
      desc: "Display all known cheermotes"
    },
    "emotes": {
      func: onCommandEmotes,
      desc: "Display the requested emotes",
      usage: [
        ["[<kinds>]",
         _J("Display emotes; <kinds> can be one or more of: global, channel,",
            " ffz, bttv, or all")]
      ],
      extra: [
        _J("Emotes are organized by set, one set per channel. Set 0 is for",
           "global emotes.")
      ]
    },
    "plugins": {
      func: onCommandPlugins,
      desc: "Display plugin information, if plugins are enabled",
      alias: ["plugin"],
      usage: [
        [null, "Show loaded plugins and their status"],
        ["help", "Show loaded plugins and command help"],
        ["add <class> <file> [<config>]",
         "Add a plugin by class and file, optionally with a config object"],
        ["load <class> <file> [<config>]", "Alias to `//plugin add`"]
        /* TODO: //plugins addremote */
      ]
    },
    "client": {
      func: onCommandClient,
      desc: "Display client and connection information",
    },
    "raw": {
      func: onCommandRaw,
      desc: "Send a raw message to Twitch (for advanced users only!)",
      usage: [
        ["<message>",
         "Send <message> to Twitch servers (for advanced users only!)"]
      ]
    },
    "channels": {
      func: onCommandChannels,
      desc: "List connected channels",
      alias: ["channels", "ch", "joined"]
    },
    "highlight": {
      func: onCommandHighlight,
      desc: "Add, show, or remove highlight patterns",
      alias: ["hl"],
      usage: [
        [null, "List highlight patterns"],
        ["show", "List highlight patterns"],
        ["add <pattern>", "Highlight messages containing <pattern>"],
        ["remove <index>", "Remove the pattern numbered <index>"]
      ],
      extra: [
        _J("Patterns can be either regexes (such as /foo/) or text (such as",
           "\"foo\")"),
        _J("Regexes may contain flag characters: /foo/i will match \"foo\",",
           "\"Foo\", \"FOO\", etc."),
        _J("By default, patterns are case-sensitive; highlighting \"foo\"",
           "will not highlight \"Foo\"")
      ]
    },
    "auth": {
      func: onCommandAuth,
      desc: _J("Display help on authenticating with Twitch Filtered Chat. If",
               "presently authenticated, then also present button to reset",
               "authentication"),
      alias: ["login"],
      usage: [
        [null,
         "Show authentication status and, if needed, authentication help"],
        ["reset", "Reset OAuth token; this cannot be undone!"]
      ]
    }
  };

  ChatCommands = new ChatCommandManager();
  for (let [cname, cobj] of Object.entries(DefaultCommands)) {
    ChatCommands.add(cname, cobj.func, cobj.desc);
    if (cobj.usage) {
      for (let uobj of cobj.usage) {
        ChatCommands.addUsage(cname, uobj[0], uobj[1], uobj[2]);
      }
    }
    if (cobj.alias) {
      for (let aname of cobj.alias) {
        ChatCommands.addAlias(aname, cname);
      }
    }
    if (cobj.extra) {
      for (let line of cobj.extra) {
        ChatCommands.addHelp(cname, line);
      }
    }
  }
}

/* globals LOG_KEY AssetPaths Strings */

/* vim: set ts=2 sts=2 sw=2 et: */
