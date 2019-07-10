/* Twitch Filtered Chat Fanfare: Particle */

"use strict";

/** Particle configuration
 *
 * Particles have the following attributes. Defaults are in brackets.
 *  x             [0] Horizontal offset from the left side of the canvas
 *  dx            [0] Horizontal starting velocity
 *  dvx           [0] Horizontal change in velocity per tick (acceleration)
 *  dxFunc        [Id] Advanced function to calculate x velocity (see below)
 *  dvxFunc       [Id] Advanced function to calculate dvx (see below)
 *  y             [0] Vertical offset from the top of the canvas
 *  dy            [0] Vertical starting velocity
 *  dvy           [0] Vertical change in velocity per tick (acceleration)
 *  dyFunc        [Id] Advanced function to calculate y velocity (see below)
 *  dvyFunc       [Id] Advanced function to calculate dvy (see below)
 *  dv            [0] Directionless change in velocity per tick; can be used
 *                to simulate friction
 *  dvFunc        [Id] Advanced function to calculate dv (see below)
 *  a             [1] Opacity: decrements every tick; particles "die" at 0
 *  image         [null] Image instance or image array (for animated GIFs)
 *  width         [0] Default image width
 *  height        [0] Default image height
 *  canvasWidth   [0] Width of the containing canvas (for "bounce")
 *  canvasHeight  [0] Height of the containing canvas (for "bounce")
 *  lifeTick      [0.01] Amount which particles "decay" per tick
 *  seed          [0] Arbitrary number available to the advanced functions
 *  borderAction  ["default"] Behavior when hitting a screen border: "default"
 *                ignores the border, "bounce" bounces off the screen border
 * [Id]: function(t, v) { return v; }
 *
 * Most of the variables above can be set via one of the following
 * configuration formats:
 *  "X"                 use value directly
 *  "Xmin", "Xmax"      use a random number between "Xmin" and "Xmax"
 *  "Xrange"            use a random number between Xrange[0] and Xrange[1]
 * The attributes supporting this format are:
 *   x, y               position
 *   dx, dy             velocity
 *   dvx, dvy           acceleration
 *   dv                 directionless acceleration
 *
 * Particles support animated images via passing an array to the "image"
 * configuration key. This is used by setting effect.animated to true and
 * using a GIF for the image URL. See FanfareCheerEffect (fanfare/effect.js)
 * for an example.
 *
 * Every "tick", "living" particles are animated according to the following:
 *  p.tick += 1
 *  p.a -= p.lifeTick
 *  p.x += p.dx
 *  p.y += p.dy
 *  p.dx = dxFunc(p.tick, p.dx + p.dvx)
 *  p.dy = dyFunc(p.tick, p.dy + p.dvy)
 *  If p.dv is nonzero:
 *    p.dx += p.dv * Math.hypot(p.x, p.y) * Math.cos(Math.atan2(p.y, p.x))
 *    p.dy += p.dv * Math.hypot(p.x, p.y) * Math.sin(Math.atan2(p.y, p.x))
 *  p.dvx = dvxFunc(p.tick, p.dvx)
 *  p.dvy = dvyFunc(p.tick, p.dvy)
 *  p.dv = dvFunc(p.tick, p.dv)
 */

class FanfareParticle { /* exported FanfareParticle */
  static get BORDER_DEFAULT() { return "default"; }
  static get BORDER_BOUNCE() { return "bounce"; }
  static get BORDER_ACTIONS() {
    return [FanfareParticle.BORDER_DEFAULT, FanfareParticle.BORDER_BOUNCE];
  }
  static get DEFAULT_FUNC() { return (tick, dv) => dv; }

  constructor(config) {
    this._config = config;
    /* Configurable attributes */
    [this.x, this.y] = [0, 0];
    [this.dx, this.dy] = [0, 0];
    [this.dvx, this.dvy] = [0, 0];
    this.dv = 0;
    this.a = 1;
    this.lifeTick = 0.01;
    this.seed = 0;
    this.borderAction = FanfareParticle.BORDER_DEFAULT;
    /* Advanced motion functions */
    this._tick = 0;
    this._dxFunc = (tick, dx) => dx;
    this._dyFunc = (tick, dy) => dy;
    this._dvxFunc = (tick, dvx) => dvx;
    this._dvyFunc = (tick, dvy) => dvy;
    this._dvFunc = (tick, dv) => dv;
    /* Effect extrema */
    [this._xmin, this._xmax] = [0, 0];
    [this._ymin, this._ymax] = [0, 0];
    /* Image information */
    this._image = null;
    this._frames = null;
    this._framenr = 0;
    /* Set the variables listed above */
    this._applyConfig(config);
  }

  /* Position */
  get top() { return this.y; }
  get left() { return this.x; }
  get bottom() { return this.y + this.height; }
  get right() { return this.x + this.width; }

  /* Position at next timestep */
  get nextTop() { return this.top + this.dy; }
  get nextLeft() { return this.left + this.dx; }
  get nextBottom() { return this.bottom + this.dy; }
  get nextRight() { return this.right + this.dx; }

  /* Size */
  get width() { return this._image ? this._image.width : 0; }
  get height() { return this._image ? this._image.height : 0; }

  /* Get the image to draw: either a static image or the next frame */
  get image() {
    let img = this._image;
    if (this._frames && this._frames.length > 0) {
      img = this._frames[this._framenr];
      this._framenr = (this._framenr + 1) % this._frames.length;
    }
    return img;
  }

  /* Set the image to draw: a string (URL), Image instance, or array */
  set image(img) {
    if (typeof(img) === "string") {
      this._image = new Image();
      this._image.src = img;
    } else if (Util.IsArray(img) && img.length > 0) {
      this._image = img[0];
      this._frames = img;
      this._framenr = 0;
    } else {
      this._image = img;
    }
  }

  /* Return whether or not the particle is "alive" */
  get alive() {
    return this.a > 0;
  }

  /* Draw the particle to the given context */
  draw(context) {
    if (!this.image || !this.image.complete) {
      /* No need to draw if the image isn't loaded */
      return;
    }
    context.globalAlpha = this.a;
    context.drawImage(this.image, this.x, this.y);
  }

  /* Apply the configuration object (see large comment above) */
  _applyConfig(config) {
    const opts = config || {};
    const hasNum = (k) => typeof(opts[k]) === "number";
    const hasRange = (k) => Util.IsArray(opts[k]) && opts[k].length === 2;
    const randNum = (min, max) => Math.random() * (max - min) + min;
    const getValue = (k, dflt) => {
      if (hasNum(k)) {
        return opts[k];
      } else if (hasNum(`${k}min`) && hasNum(`${k}max`)) {
        return randNum(opts[`${k}min`], opts[`${k}max`]);
      } else if (hasRange(`${k}range`)) {
        return randNum(opts[`${k}range`][0], opts[`${k}range`][1]);
      } else {
        return dflt;
      }
    };
    this.x = getValue("x", 0);
    this.y = getValue("y", 0);
    this.dx = getValue("dx", 0);
    this.dy = getValue("dy", 0);
    this.a = getValue("a", 1);
    this.dvx = getValue("dvx", 0);
    this.dvy = getValue("dvy", 0);
    this.dv = getValue("dv", 0);
    this.lifeTick = getValue("lifeTick", 0.01);
    this._dxFunc = opts.dxFunc || FanfareParticle.DEFAULT_FUNC;
    this._dyFunc = opts.dyFunc || FanfareParticle.DEFAULT_FUNC;
    this._dvxFunc = opts.dvxFunc || FanfareParticle.DEFAULT_FUNC;
    this._dvyFunc = opts.dvyFunc || FanfareParticle.DEFAULT_FUNC;
    this._dvFunc = opts.dvFunc || FanfareParticle.DEFAULT_FUNC;
    if (opts.seed) {
      this.seed = opts.seed;
    }
    if (opts.image) {
      this.image = opts.image;
    }
    if (opts.canvasWidth) {
      this._xmin = 0;
      this._xmax = opts.canvasWidth;
    }
    if (opts.canvasHeight) {
      this._ymin = 0;
      this._ymax = opts.canvasHeight;
    }
    if (opts.borderAction) {
      if (FanfareParticle.BORDER_ACTIONS.indexOf(opts.borderAction) > -1) {
        this.borderAction = opts.borderAction;
      } else {
        Util.Warn(`Invalid border action ${opts.borderAction}; ignoring`);
      }
    }
  }

  /* Calculate new velocity */
  _calcAccel() {
    let [dx, dy] = [this.dx, this.dy];

    let dvx = Number.isNaN(this.dvx) ? 0 : this.dvx;
    let dvy = Number.isNaN(this.dvy) ? 0 : this.dvy;
    let dv = Number.isNaN(this.dv) ? 0 : this.dv;
    dvx = this._dvxFunc(this._tick, dvx);
    dvy = this._dvyFunc(this._tick, dvy);
    dv = this._dvFunc(this._tick, dv);

    dx += dvx;
    dy += dvy;
    if (dv !== 0) {
      const scale = dv * Math.hypot(this.x, this.y);
      const angle = Math.atan2(this.y, this.x);
      dx += scale * Math.cos(angle);
      dy += scale * Math.sin(angle);
    }
    return [
      this._dxFunc(this._tick, dx),
      this._dyFunc(this._tick, dy)
    ];
  }

  /* Handle particle movement and decrease opacity by this.lifeTick */
  tick() {
    if (!this.alive) return;
    this._tick += 1;
    this.a -= this.lifeTick;
    this.x += this.dx;
    this.y += this.dy;
    [this.dx, this.dy] = this._calcAccel();
    if (this.borderAction === FanfareParticle.BORDER_BOUNCE) {
      /* Handle bounce (if xmin !== xmax) */
      if (this._xmin !== this._xmax) {
        if (this.dx < 0 && this.nextLeft < this._xmin) {
          this.dx *= -1;
        } else if (this.dx > 0 && this.nextRight > this._xmax) {
          this.dx *= -1;
        }
      }
      /* Handle bounce (if ymin !== ymax) */
      if (this._ymin !== this._ymax) {
        if (this.dy < 0 && this.nextTop < this._ymin) {
          this.dy *= -1;
        } else if (this.dy > 0 && this.nextBottom > this._ymax) {
          this.dy *= -1;
        }
      }
    }
  }
}

/* vim: set ts=2 sts=2 sw=2 et: */
