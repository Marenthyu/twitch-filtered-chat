
"use strict";

function addStyle(elem, css) {
  let s = elem.attr("style") || "";
  if (s.length > 0) s += "; ";
  elem.attr("style", s + css);
}

function genLine(effects, username="username", extra_text=null) {
  let $w = $(`<div class="line line-wrapper"></div>`);
  let $l = $(`<span class="chat-line"></span>`);
  let $b = $(`<span class="badges" data-badges="1"></span>`);
  let $u = $(`<span class="username"></span>`);
  let $colon = $(`<span class="usernameColon">:&nbsp;</span>`);
  let $m = $(`<span class="message"></span>`);

  $u.css("color", "forestgreen");
  let html_pre = "";
  let html_post = "";
  for (let effect of effects) {
    if (effect.wclass) $l.addClass(effect.wclass);
    if (effect.class) $m.addClass(effect.class);
    if (effect.wstyle) addStyle($l, effect.wstyle);
    if (effect.style) addStyle($m, effect.style);
    if (effect.html_pre) html_pre = html_pre + effect.html_pre;
    if (effect.html_post) html_post = effect.html_post + html_post;
    if ($m.text().length > 0) {
      $m.text($m.text() + " ");
    }
    $m.text($m.text() + effect.rule);
  }
  if (extra_text !== null) {
    $m.text(extra_text);
  }

  let msg_html = html_pre + $m[0].outerHTML + html_post;
  $l.append($b);
  if (username !== null) {
    $l.append($u.text(username)).append($colon);
  }
  $l.html($l.html() + msg_html);
  return $w.append($l);
}

function addEffectInput($input, effect, label=null) {
  let $l = $(`<label></label>`).text(label || effect.name || effect.rule);
  $l.attr("for", "effect_" + effect.rule);
  $input.attr("data-effect", effect.rule);
  $input.attr("id", "effect_" + effect.rule);
  $input.attr("name", effect.rule);
  let $line = $(`<div class="effect"></div>`);
  $("#content1").append($line.append($input).append($l));
}

function addEffectCB(effect, label=null) {
  addEffectInput($(`<input type="checkbox" class="middle" />`), effect, label);
}

function addEffectText(effect, label=null) {
  addEffectInput($(`<input type="text" class="middle" />`), effect, label);
}

function setup() {
  if (Util.DebugLevel >= Util.LEVEL_DEBUG) {
    $("#debug").show()
      .css("font-weight", "inherit")
      .css("bottom", "0px");
    Util.Logger.addHook((sev, inclStack, ...args) => {
      let $l = $(`<div></div>`);
      $l.text(Util.Logger.stringify(...args));
      $("#debug").append($l);
    });
  }
  Util.Debug("Loaded");
}

function doMain() {
  setup();

  for (let effect of Object.values(CSSCheerStyles)) {
    if (!effect.is_template) {
      addEffectCB(effect);
    }
  }
  addEffectText(CSSCheerStyles.color, "Text Color(s)");
  addEffectText(CSSCheerStyles.bgcolor, "Background Color(s)");
  let $show = $(`<input type="button" value="Show!" />`);
  $show.click((e) => {
    let inputs = $(`input[data-effect]`);
    let effects = [];
    for (let input of inputs) {
      let type = $(input).attr("type");
      let kind = $(input).attr("data-effect");
      if (type === "checkbox" && $(input).is(":checked")) {
        effects.push(CSSCheerStyles[kind]);
      } else if (type === "text" && $(input).val().length > 0) {
        let prefix = kind === "bgcolor" ? "bg-" : "";
        for (let word of $(input).val().split(" ")) {
          effects.push(GetCheerStyle(prefix + word));
        }
      }
    }
    if (effects.length > 0) {
      effects = AggregateEffects(effects);
    }
    if (effects.length > 0) {
      Util.Debug("Effects: ", effects);
      $("#content2").append(genLine(effects));
      requestAnimationFrame(() => {
        let el = $("#content2").children().last()[0];
        if (el.scrollIntoView) {
          el.scrollIntoView();
        } else {
          $("#content2")[0].scrollTop = el.offset().top;
        }
      });
    }
  });
  $("#content1").append($show);
  $("#content1").append(genLine([], null, "Adding more than one color creates a gradient of colors!"));

  for (let effect of Object.values(CSSCheerStyles)) {
    if (!effect.is_template && !effect._disabled) {
      let line = genLine([effect]);
      $("#content2").append(line);
    }
  }

  /* Demonstrate aggregation gradients */
  let color_effects = [];
  color_effects = AggregateEffects([
    GetCheerStyle("red"),
    GetCheerStyle("green"),
    GetCheerStyle("blue"),
    GetCheerStyle("bold")
  ]);
  $("#content2").append(genLine(color_effects, "username", "bold red green blue"));
  color_effects = AggregateEffects([
    GetCheerStyle("bg-red"),
    GetCheerStyle("bg-green"),
    GetCheerStyle("bg-blue"),
    GetCheerStyle("bold")
  ]);
  $("#content2").append(genLine(color_effects, "username", "bold bg-red bg-green bg-blue"));
}

/* exported doMain */
/* globals Util GetCheerStyle CSSCheerStyles AggregateEffects */
