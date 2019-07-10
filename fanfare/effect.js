/* Twitch Filtered Chat Fanfare: Effects */

"use strict";

class FanfareEffect { /* {{{0 */
  constructor(host, config) {
    this._host = host;
    this._client = host._client;
    this._config = config || {};
    this._particles = [];

    /* Frame counter for complex animations (increments on draw) */
    this._frames = 0;
  }

  /* Configuration getter */
  config(k) { return this._config[k]; }

  /* Number of frames drawn */
  get frames() { return this._frames; }

  /* Total particle count */
  get count() { return this._particles.length; }

  /* Total number of alive particles */
  get alive() { return this._particles.filter((p) => p.alive).length; }

  /* Fanfare name */
  get name() { throw new Error("Abstract function call"); }

  /* Default emote */
  get emote() { return null; }

  /* Default image URL */
  get imageUrl() { return null; }

  /* Default to static images over animated images */
  get animated() { return false; }

  /* Width of a particle (used by num) */
  get imageWidth() {
    if (this._image) {
      if (Util.IsArray(this._image) && this._image.length > 0) {
        if (this._image[0].width) {
          return this._image[0].width;
        }
      } else if (this._image.width) {
        return this._image.width;
      }
    }
    return Number.NaN;
  }

  /* Height of a particle */
  get imageHeight() {
    if (this._image) {
      if (Util.IsArray(this._image) && this._image.length > 0) {
        if (this._image[0].height) {
          return this._image[0].height;
        }
      } else if (this._image.height) {
        return this._image.height;
      }
    }
    return Number.NaN;
  }

  /* Number of particles to render */
  get num() {
    if (this.config("numparticles")) {
      return this.config("numparticles");
    } else if (this.imageWidth) {
      return Math.floor(this._host.width / this.imageWidth);
    } else {
      return 10;
    }
  }

  /* Load the image data as either an <img> or an array of <img>s */
  _loadImage() {
    return new Promise((function(resolve, reject) {
      let url = "";
      if (this.emote) {
        url = this._client.GetEmote(this.emote);
      } else if (this.imageUrl) {
        url = this.imageUrl;
      } else {
        reject(new Error(`No image configured for effect ${this.name}`));
        return;
      }

      if (this.animated) {
        Util.SplitGIF(url)
          .then((framedata) => {
            if (framedata.length > 0) {
              let frames = framedata.map((f) => Util.ImageFromPNGData(f));
              Util.PromiseElement(frames[0])
                .then((e) => resolve(frames))
                .catch((e) => reject(e));
            } else {
              resolve([]);
            }
          })
          .catch((err) => reject(err));
      } else {
        let img = this._host.image(url);
        Util.PromiseElement(img)
          .then((e) => resolve(img))
          .catch((e) => reject(e));
      }
    }).bind(this));
  }

  /* Load the effect */
  _load(resolve, reject) {
    this._frames = 0;
    this._loadImage()
      .then((img) => {
        this._image = img;
        this.initialize();
        resolve(this);
      })
      .catch((err) => reject(err));
  }

  /* Load the effect; returns a promise */
  load() {
    return new Promise(this._load.bind(this));
  }

  /* Handle particle movement */
  tick() {
    let numAlive = 0;
    for (let p of this._particles) {
      p.tick();
      if (p.alive) {
        numAlive += 1;
      }
    }
    return numAlive > 0;
  }

  /* Draw the particles to the given context */
  draw(context) {
    this._frames += 1;
    for (let p of this._particles) {
      p.draw(context);
    }
  }

  /* toString helper */
  get [Symbol.toStringTag]() {
    return this.name;
  }

} /* 0}}} */

class FanfareCheerEffect extends FanfareEffect { /* {{{0 */
  constructor(host, config, event) {
    super(host, config);
    this._event = event;
    this._bits = event.bits || 1;
  }

  /* Fanfare name */
  get name() { return "FanfareCheerEffect"; }

  /* If configured, use animated GIFs */
  get animated() {
    if (this.config("static")) {
      return false;
    }
    return true;
  }

  /* Default background */
  static get background() {
    if ($("body").hasClass("light")) {
      return "light";
    } else if ($("body").hasClass("transparent")) {
      return "light";
    } else {
      return "dark";
    }
  }

  /* Default scale */
  static get scale() {
    return "1";
  }

  /* Get the URL for the given cheermote */
  cheerToURL(cdef, bits, pbg=null, pscale=null) {
    let bg = pbg || FanfareCheerEffect.background;
    let scale = pscale || FanfareCheerEffect.scale;
    /* Determine background and scale */
    if (!cdef.backgrounds.includes(bg)) {
      Util.DebugOnly(`Background ${bg} not in ${JSON.stringify(cdef.backgrounds)}`);
      bg = cdef.backgrounds[0];
    }
    if (!cdef.scales.map((n) => `${n}`).includes(scale)) {
      Util.DebugOnly(`Scale ${scale} not in ${JSON.stringify(cdef.scales)}`);
      scale = cdef.scales[0];
    }
    /* Figure out the tier we're using */
    let curr_bits = 0;
    let tier = cdef.tiers[0];
    for (let tdef of Object.values(cdef.tiers)) {
      if (tdef.min_bits > curr_bits && bits >= tdef.min_bits) {
        tier = tdef;
      }
    }
    /* Return the derived URL */
    try {
      if (this.animated) {
        return tier.images[bg].animated[scale];
      } else {
        return tier.images[bg].static[scale];
      }
    }
    catch (e) {
      Util.ErrorOnly(e);
      Util.ErrorOnly(tier, bg, scale);
      return "";
    }
  }

  /* Determine the image URL to use */
  get imageUrl() {
    if (this.config("cheerurl")) {
      return this.config("cheerurl");
    } else if (this.config("imageurl")) {
      return this.config("imageurl");
    } else if (!this._client.cheersLoaded) {
      Util.Warn("Cheers are not yet loaded");
    } else {
      let cheermote = "Cheer";
      let [bg, scale] = [null, null];
      if (this.config("cheermote")) {
        cheermote = this.config("cheermote");
      }
      if (this.config("cheerbg")) {
        bg = this.config("cheerbg");
      }
      if (this.config("cheerscale")) {
        scale = this.config("cheerscale");
      }
      let cdef = this._client.GetGlobalCheer(cheermote);
      return this.cheerToURL(cdef, this._bits, bg, scale);
    }
    return "";
  }

  /* Called by base class */
  initialize() {
    const pw = this.imageWidth || 30;
    const ph = this.imageHeight || 30;
    for (let i = 0; i < this.num; ++i) {
      this._particles.push(new FanfareParticle({
        xmin: 0,
        xmax: this._host.width - pw,
        ymin: this._host.height - ph - 60,
        ymax: this._host.height - ph,
        dxrange: [0, 1],
        dyrange: [0, 1],
        dvxrange: [-0.1, 0.1],
        dvyrange: [-0.5, 0],
        image: this._image,
        canvasWidth: this._host.width,
        canvasHeight: this._host.height,
        borderAction: FanfareParticle.BORDER_BOUNCE
      }));
    }
  }
} /* 0}}} */

class FanfareSubEffect extends FanfareEffect { /* {{{0 */
  constructor(host, config, event) {
    super(host, config);
    this._event = event;
    this._kind = event.kind || TwitchSubEvent.KIND_SUB;
    this._tier = event.plan || TwitchSubEvent.PLAN_TIER1;
  }

  /* Fanfare name */
  get name() { return "FanfareSubEffect"; }

  /* Determine the emote and size for the given kind and tier */
  _emote(kind, tier) {
    let emote = "HolidayPresent";
    let size = "1.0";
    if (this.config("emote")) {
      emote = this.config("emote");
    } else if (this.config("subemote")) {
      emote = this.config("subemote");
    } else if (kind === TwitchSubEvent.KIND_SUB) {
      if (this.config("subemote_sub")) {
        emote = this.config("subemote_sub");
      } else {
        emote = "MrDestructoid";
      }
    } else if (kind === TwitchSubEvent.KIND_RESUB) {
      if (this.config("subemote_resub")) {
        emote = this.config("subemote_resub");
      } else {
        emote = "PraiseIt";
      }
    } else if (kind === TwitchSubEvent.KIND_GIFTSUB) {
      if (this.config("subemote_giftsub")) {
        emote = this.config("subemote_giftsub");
      } else {
        emote = "HolidayPresent";
      }
    } else if (kind === TwitchSubEvent.KIND_ANONGIFTSUB) {
      if (this.config("subemote_anongiftsub")) {
        emote = this.config("subemote_anongiftsub");
      } else {
        emote = "HolidayPresent";
      }
    }
    if (tier === TwitchSubEvent.PLAN_TIER2) {
      size = "2.0";
    } else if (tier === TwitchSubEvent.PLAN_TIER3) {
      size = "3.0";
    }
    return [emote, size];
  }

  /* Determine the image URL to use */
  get imageUrl() {
    if (this.config("suburl")) {
      return this.config("suburl");
    } else if (this.config("imageurl")) {
      return this.config("imageurl");
    } else {
      let [emote, size] = this._emote(this._kind, this._tier);
      return this._client.GetEmote(emote, size);
    }
  }

  /* Called by base class */
  initialize() {
    const pw = this.imageWidth || 30;
    const ph = this.imageHeight || 30;
    for (let i = 0; i < this.num; ++i) {
      this._particles.push(new FanfareParticle({
        /* Start anywhere along the bottom of the screen */
        xmin: 0,
        xmax: this._host.width - pw,
        ymin: this._host.height - ph - 60,
        ymax: this._host.height - ph,
        /* Ease through [0, 1, 0, -1, 0] over 80 ticks; using a random starting
         * location through the ease */
        dxFunc: function(t, dx) {
          return 4 * Math.sin((t % 80) / 80 * 2 * Math.PI + this.seed);
        },
        /* Particles gradually move upwards */
        dyrange: [-1, 1],
        dvyrange: [-0.15, 0],
        /* Random starting ease */
        seed: Math.random() * 2 * Math.PI,
        image: this._image,
        canvasWidth: this._host.width,
        canvasHeight: this._host.height,
        /* Particles last much longer than usual */
        lifeTick: 0.005,
        /* Ignore the borders */
        borderAction: FanfareParticle.BORDER_DEFAULT
      }));
    }
  }
} /* 0}}} */

/* exported FanfareEffect FanfareCheerEffect FanfareSubEffect */
/* globals FanfareParticle */
/* vim: set ts=2 sts=2 sw=2 et: */
