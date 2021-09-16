# Twitch Filtered Chat

It's Twitch Chat, but Filtered!

# Table of Contents

<!-- GFM has problems with naive list formatting -->
<ol>
<li><a href="#usage">Usage</a></li>
<ol>
<li><a href="#query-string-options">Query String Options</a></li>
<li><a href="#twitch-api">Twitch API</a></li>
<li><a href="#layout">Layout</a></li>
<li><a href="#module-configuration">Module Configuration</a></li>
<li><a href="#examples">Examples</a></li>
<li><a href="#cheer-effects">Cheer Effects</a></li>
<li><a href="#hotkeys">Hotkeys</a></li>
</ol>
<li><a href="#development">Development</a></li>
<ol>
<li><a href="#plugins">Plugins</a></li>
<li><a href="#commands">Commands</a></li>
</ol>
<li><a href="#antics">Antics</a></li>
<li><a href="#testing">Testing</a></li>
<li><a href="#vim-support">VIM Support</a></li>
<li><a href="#credits">Credits</a></li>
</ol>

## Usage

URL: `https://kaedenn.github.io/twitch-filtered-chat/index.html?<OPTIONS>`

### Query String Options

| Option Key    | Option Value |
| ---           | -------------- |
| `twapi`       | Force external (`e`) or internal (`i`) Twitch API library (see below) |
| `layout`      | Layout (see below) |
| `config_key`  | Custom configuration key (see below) |
| `config`      | Alias for `config_key` |
| `key`         | Alias for `config_key` |
| `clientid`    | ClientID override to use for Twitch asset loading |
| `user`        | Username to use (requires `pass`) |
| `pass`        | OAuth token to use (requires `user`; removed once parsed) |
| `debug`       | Either either a number or one of `false` (0), `true` (1), `debug` (1), or `trace` (2) (default: 0) |
| `channels`    | Channels to join (with or without #), separated by commas |
| `noffz`       | Disable FFZ support (badges and emotes) entirely |
| `nobttv`      | Disable BTTV support (emotes) entirely |
| `noassets`    | Prevents loading of all image (badge, emote, cheer) assets (implies `noffz` and `nobttv`) |
| `hmax`        | Maximum size of sent chat history (default 300) (requires `chat` layout and proper `user` and `pass` values) |
| `trans`       | Makes the backgrounds completely transparent |
| `module1`     | The encoded module configuration for module 1 (explained below) |
| `module2`     | The encoded module configuration for module 2 (explained below) |
| `norec`       | If present, don't automatically reconnect if connection is lost |
| `size`        | Overrides the body font size (in pt) (default: 18) |
| `plugins`     | If present, enables use of plugins (see plugins directory) |
| `disable`     | Disable specific cheer effects, separated by commas. Use `color` to disable cheer colors. Use `bgcolor` to disable cheer background colors. |
| `enable`      | Enable specific cheer effects, separated by commas |
| `max`         | Maximum number of chat messages to retain (default 100) |
| `font`        | Override default font `'Segoe UI', Tahoma, Geneva, Verdana, sans-serif` |
| `scroll`      | If non-empty, show scroll bars (default: hidden) |
| `clips`       | If non-empty, show clip information in chat (default: hidden) |
| `nols`        | Forcibly disable `localStorage` support. Note that this disables `pass` support entirely, as `localStorage` is needed to store passwords |
| `scheme`      | Color scheme to use. Valid values: `light` and `dark`. Default: `dark` |
| `enableforce` | Enable mod antics (see below) |
| `fanfare`     | Fanfare configuration: either `1` or `true` to enable, or a JSON-encoded string to set specific options |
| `highlight`   | Comma-separated patterns (either regexes of the form `/pat/[flags]` or strings) to highlight |
| `urls`        | Set to a falsy value to disable URL formatting. Default is to format URLs |
| `bghint`      | Hint to the HTML Generator the relative shade of the background. Valid values are `light` and `dark`. This affects whether or not username shadows are displayed |
| `shadow`      | Set to a falsy value to disable username shadows altogether. Overrides the behavior of `bghint` regarding username shadows. |
| `msganim`     | Set to a falsy value to disable message "slide-in" animation |
| `wsuri`       | Override the `WebSocket` endpoint to a custom URI |
| `tag`         | Set a specific name for the chat for debugging and antics usage (highly recommended!) |

This client uses the `tfc-config` `localStorage` key by default. If you specify `config_key`, then `tfc-config-${config_key}` is used instead. This `config_key` option allows you to have multiple parallel configurations that don't interfere with each other.

Note that `user` and `pass` must be supplied together: if a username is given, then a password must be given via either `pass` or stored in `localStorage`.

`tag` is used to identify unique chats for debugging and antics use. It is highly recommended to have a `tag` present in your query string!

All option values must be URL-encoded.

### Twitch API

The Twitch Filtered Chat depends on the Twitch API (known casually as _twapi_), which can be in one of two locations. Both locations are examined and the first successful location is used.

| Type | Path | When Used |
| ---- | ---- | --------- |
| Internal | `twitch-filtered-chat/twitch-api` | Default |
| External | `twitch-api` | When `window.location.protocol === "file:"` |

Passing `twapi=i` forces the internal submodule to be scanned first. Passing `twapi=e` forces the external submodule to be scanned first. See the <a href="#development">Development</a> section for more information.

### Layout

| Layout | Description |
| --- | ----------- |
| `layout=double:chat` | Two columns with a chat box (default) |
| `layout=single:chat` | One column with a chat box |
| `layout=double:nochat` | Two columns without a chat box |
| `layout=single:nochat` | One column without a chat box |
| `layout=double:slim` | Two columns without headers, settings, or a chat box |
| `layout=single:slim` | One column without header, settings, or a chat box |
| `layout=double` | Shorthand for `layout=double:chat` |
| `layout=single` | Shorthand for `layout=single:chat` |
| `layout=tesla` | Special layout for use on embedded browsers, such as in a Tesla. This is similar to `layout=single:slim` but changes numerous other behaviors |

### Module configuration

`module1=<name>,<flags>,<kw-include>,<user-include>,<user-exclude>,<start-exclude>,<channel-exclude>`

`module2=<name>,<flags>,<kw-include>,<user-include>,<user-exclude>,<start-exclude>,<channel-exclude>`

If `layout` is `single`, `module1` is shown. Otherwise, `module1` is the left module and `module2` the right.

| Argument | Multi-Valued? | Description |
| --- | --- | ----------- |
| `name` | No | Module's display name. Can be anything. |
| `flags` | No | a sequence of 1s (show) or 0s (hide) for `Pleb`, `Sub`, `VIP`, `Mod`, `Events`, `Bits`, and `/me`. |
| `kw-include` | Yes | Display the message if it contains the value(s) given. Overrides `flags` and `channel-exclude`. |
| `user-include` | Yes | Always show messages from the specified user(s). Overrides `flags` and `channel-exclude`. |
| `user-exclude` | Yes | Hide messages from any of the user(s) given. |
| `start-exclude` | Yes | Hide messages containing any of the value(s) given. |
| `channel-exclude` | Yes | Hide messages from any of the channel(s) given (intended for `layout=double` usage). |

To pass multiple values, place commas between them. For example `user-include=Kaedenn_,dwangoAC` matches both `Kaedenn_` and `dwangoAC`.

Default: `module1=Chat,1111111,,,,,&module2=Chat,1111111,,,,,`

### Examples

Example configurations are coming relatively soon.

### Cheer Effects

The following cheer effects are available and cost one bit each.

| Effect | Description |
| --- | ----------- |
| `marquee` | Message scrolls from right to left across the chat window |
| `bold` | Message is bold |
| `italic` | Message is italicised |
| `underline` | Message is underlined |
| `upsidedown` | Message is upside-down (may not work with some other effects) |
| `inverted` | Message uses inverted colors (may not work with some other effects) |
| `strikethrough` | Message has a strike-through |
| `subscript` | Message is formatted as a subscript |
| `superscript` | Message is formatted as a superscript |
| `big` | Message is bigger than normal |
| `small` | Message is smaller than normal |
| `rainbow` | Message is rainbow (red -> yellow -> green -> cyan -> blue -> purple -> red) |
| `disco` | Message cycles through the rainbow colors in order |
| _color_ | Message will use the color specified, by name (won't work with `rainbow`). Almost every color you can think of should work (see `config.js` `ColorNames`) |
| `bg-`_color_ | Message will use the color specified as the background color, by name |

To use them, add them to the message after the cheer:

  `cheer3 bold marquee rainbow Hello streamer`: This message is big, rainbow, and scrolling across the screen

  `cheer1 rainbow marquee Hello`: This message isn't scrolling because effects cost one bit each

  `marquee cheer1 Hey there`: This message has no extra formatting; the effect must be immediately after the cheer.

  `cheer3 big blue bold Greetings`: The message is big, bold, and blue.

  `cheer1 big bold blue Greetings`: The message is big but neither bold nor blue, as effects cost one bit each.

  `cheer2 big bg-gold Greetings`: The message is big and has a gold background.

The following effects are disabled by default and must be enabled via `&enable=` to use. These effects don't look quite right and are a work in progress.

| Effect | Description |
| --- | ----------- |
| `slide` | Similar to `marquee`, the message scrolls in from the right |
| `scroll` | Similar to `marquee`, the effect scrolls in from the left |
| `bounce` | Similar to `marquee`, the effect bounces from left to right |

### Hotkeys

The following hotkeys are available:

| Key Name | Action |
| --- | ------ |
| `ScrollLock` | Toggles automatic scrolling when new messages are received |
| `Escape` | Closes all visible settings windows |

## Development

For getting started, you will need both this repository and the `twitch-api` repository. The `twitch-api` can be used either as a submodule or an external repository.

#### Internal Twitch API (submodule)

```bash
mkdir tfc && cd tfc # optional
git clone https://github.com/Kaedenn/twitch-filtered-chat
cd twitch-filtered-chat
git submodule init # initialize twitch-api submodule
git submodule update # fetch twitch-api submodule contents from github
firefox index.html # or whichever browser you fancy
```

#### External Twitch API (parallel repository)

```bash
mkdir tfc && cd tfc # optional
git clone https://github.com/Kaedenn/twitch-filtered-chat
git clone https://github.com/Kaedenn/twitch-api
firefox twitch-filtered-chat/index.html # or whichever browser you fancy
```

The filtered chat will scan for twapi in both locations, using the first successful location. The order of the locations is determined as follows:

1. If the query string has `twapi=e`, then prefer external
2. If the query string has `twapi=i`, then prefer internal
3. If the URL has the protocol `file:`, then prefer external
4. Otherwise, prefer internal

### Plugins

Plugin documentation is coming relatively soon.

### Commands

Chat command documentation is coming relatively soon.

## Antics

If enabled (either `&force=1` present in the query string or `Mod Antics` checkbox in the main settings window is checked), moderators are able to take control of the chat in various ways.

By starting their message with one of the following words, moderators can do the following:

| Word | Action |
| --- | -------- |
| `force` | Interpret the rest of the message as literal HTML |
| `forceeval` | Interpret the rest of the message as a JavaScript expression, displaying the result in the chat |
| `forcejs` | Interpret the rest of the message as a JavaScript function |
| `forcejs-only` | If the next word matches the value of `&tag` in the query string, or if the word is `"any"`, or if the word is `"match-`_expression_`"` and the value of `&tag` starts with _expression_, then interpret the rest of the message as a JavaScript function |
| `forcebits` | Prepend `"cheer1000"` to the message, for demonstrating cheer effects |
| `forcecheer` | As above; prepend `"cheer1000"` to the message |

### Antics Examples

`force <span class="effect-rainbow effect-disco">This shows up as a rainbow disco party</span>`.

`force-eval 1+2` results in the message being `3`.

`forcejs Content.add($("<img src=\"www.example.com/my/image.png\" />"))` results in the specified image appearing in chat.

`forcejs-only tfc alert("Hello there")` displays an alert window if the streamer's `&tag` value is `tfc`.

Only enable antics if you completely trust your moderators. Furthermore, antics gives access to your OAuth token if one is present.

I *highly* recommend disabling antics if you're using an OAuth token.

Enable antics at your own risk.

## Testing

Please test the filtered chat in your own browser. Load it up and ensure you can change settings and that things work as you'd expect.

<a href="https://kaedenn.github.io/twitch-filtered-chat/index.html?debug=1&channels=%23kaedenn_&module1=Kaedenn%2520Chat%2C1111111%2C%2CKaedenn_%2CTAS9000%252CNightbot%252CStay_Hydrated_Bot%2C!%2C%252523Kaedenn_&module2=Main%2520Chat%2C1111111%2C%2CKaedenn_%2CTAS9000%252CNightbot%252CStay_Hydrated_Bot%2C!%2C&layout=double%3Achat&tag=sample1&fanfare=true">https://kaedenn.github.io/twitch-filtered-chat/index.html?debug=1&channels=%23kaedenn_&module1=Kaedenn%2520Chat%2C1111111%2C%2CKaedenn_%2CTAS9000%252CNightbot%252CStay_Hydrated_Bot%2C!%2C%252523Kaedenn_&module2=Main%2520Chat%2C1111111%2C%2CKaedenn_%2CTAS9000%252CNightbot%252CStay_Hydrated_Bot%2C!%2C&layout=double%3Achat&tag=sample1&fanfare=true</a>

If you have errors loading that or if you're using a very old browser, try the following link which forces ES5 via `usedist=1`:

<a href="https://kaedenn.github.io/twitch-filtered-chat/index.html?debug=1&channels=%23kaedenn_&module1=Kaedenn%2520Chat%2C1111111%2C%2CKaedenn_%2CTAS9000%252CNightbot%252CStay_Hydrated_Bot%2C!%2C%252523Kaedenn_&module2=Main%2520Chat%2C1111111%2C%2CKaedenn_%2CTAS9000%252CNightbot%252CStay_Hydrated_Bot%2C!%2C&layout=double%3Achat&usedist=1&tag=sample2&fanfare=true">https://kaedenn.github.io/twitch-filtered-chat/index.html?debug=1&channels=%23kaedenn_&module1=Kaedenn%2520Chat%2C1111111%2C%2CKaedenn_%2CTAS9000%252CNightbot%252CStay_Hydrated_Bot%2C!%2C%252523Kaedenn_&module2=Main%2520Chat%2C1111111%2C%2CKaedenn_%2CTAS9000%252CNightbot%252CStay_Hydrated_Bot%2C!%2C&layout=double%3Achat&usedist=1&tag=sample2&fanfare=true</a>

The test URLs above have the following configuration:

<ol>
<li>Enable debugging (<code>debug=1</code>)</li>
<li>Connect to <code>#Kaedenn_</code> (<code>channels=%23kaedenn_</code>)</li>
<li>There are two modules, side-by-side, with a visible chat window (<code>layout=double%3achat</code>)</li>
<li>Module 1 (left module)</li>
<ol>
<li>Module is named <code>Kaedenn Chat</code> (<code>Kaedenn%2520Chat</code>)</li>
<li>Module does not filter specific message types (<code>1111111</code>)</li>
<li>Module shows all messages from <code>Kaedenn_</code></li>
<li>Module hides all messages from <code>TAS9000</code>, <code>Nightbot</code>, and <code>Stay_Hydrated_Bot</code> (<code>TASBot%252CNightbot%252CStay_Hydrated_Bot</code>)</li>
</ol>
<ol>
<li>Module hides all messages starting with a <code>!</code></li>
<li>Module only shows messages originating from <code>#Kaedenn_</code> (<code>%2523Kaedenn_</code>)</li>
</ol>
<li>Module 2 (right module)</li>
<ol>
<li>Module is named <code>Main Chat</code> (<code>Main%2520Chat</code>)</li>
<li>Module shows messages from all channels</li>
<li>Module is otherwise identical to module 1</li>
</ol>
<li>Chat is tagged <code>sample1</code> and <code>sample2</code> (<code>tag=sample1</code>, <code>tag=sample2</code>)</li>
<li>Fanfare effects are enabled (<code>fanfare=1</code>)</li>
</ol>

## Vim Support

These files use vim section labels to assist code folding. If `foldmethod=section` doesn't work for you, then the following should be useful:

```vim
function! <SID>FoldAllSections(...)
  let oldpos = getpos(".")
  call setpos(".", [bufnr("%"), 0, 0, 0])
  let s = search("{{{[0-9]", "W")
  while s != 0
    let ls = line(".")
    let sn = getline(".")[match(getline("."), "{{{[0-9]") + 3][0]
    let le = search(sn . "}}}", "nW")
    execute(":" . ls . "," . le . "fold")
    execute(":" . ls . "," . le . "foldopen")
    let s = search("{{{[0-9]", "W")
  endwhile
  execute(":normal zM")
  call setpos(".", oldpos)
endfunction

map <leader>F :call <SID>FoldAllSections()^M
```

Note that `^M` refers to a literal `^M` character: `^V^M` on Linux. This can be omitted; you will instead need to press Enter after typing `<leader>F`.

## Credits

> Shayd3 - Creating the settings builder

> YoshiRulz - Improving rainbow effect

> Inverted - Improving username contrast, helping with disco effect

> SighnWave - Creating the disco effect

> Feeve - Assisting with resub debugging
