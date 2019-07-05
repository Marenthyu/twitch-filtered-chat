/* Twitch Filtered Chat Fanfare: Particle */

"use strict";

/** Particle configuration
 *
 * Particles have the following attributes:
 *  x         Horizontal offset from the left side of the canvas
 *  y         Vertical offset from the top of the canvas
 *  dx        Horizontal starting velocity
 *  dy        Vertical starting velocity
 *  xforce    Horizontal deceleration (i.e. gravity/drag) factor
 *  yforce    Vertical deceleration (i.e. gravity/drag) factor
 *  force     Directionless force (i.e. drag) coefficient
 *  a         Opacity: decrements every tick and particles "die" at 0
 *  image     Image instance or array of image instances (for animated GIFs)
 *  width     Image width
 *  height    Image height
 *
 * Most of the variables above can be set via one of the following
 * configuration formats:
 *   "X"                use value directly
 *   "Xmin", "Xmax"     use a random number between "Xmin" and "Xmax"
 *   "Xrange"           use a random number between Xrange[0] and Xrange[1]
 * The attributes supporting this format are:
 *   x, y               position
 *   dx, dy             velocity
 *   xforce, yforce     "acceleration"
 *   force              directionless force coefficient
 * Other attributes:
 *   a                  particle opacity (also lifetime)
 *   lifeTick           decrease in opacity per tick
 *   image              DOM Image object
 *   width              image width (or 0 if no image is set/loaded)
 *   height             image height (or 0 if no image is set/loaded)
 *   left, top          x, y
 *   right, bottom      x + width, y + height
 *   borderAction       behavior when hitting a screen border: "default",
 *                      "bounce" (default: "default")
 *
 * Particles support animated images via passing an array to the "image"
 * configuration key. See the cheer fanfare for an example of this (by simply
 * returning true for the `animated` getter).
 *
 * Every "tick", "living" particles are animated according to the following:
 *  p.a -= 0.01
 *  p.x += p.dx
 *  p.y += p.dy
 *  p.dx += p.xforce (if p.xforce is given)
 *  p.dy += p.yforce (if p.yforce is given)
 *  If p.force is given:
 *    p.dx = p.force * Math.hypot(p.x, p.y) * Math.cos(Math.atan2(p.y, p.x))
 *    p.dy = p.force * Math.hypot(p.x, p.y) * Math.sin(Math.atan2(p.y, p.x))
 *
 * Particles "die" if any of the following are true:
 *  p.a <= 0
 *  p.x + p.width < 0
 *  p.y + p.height < 0
 *  p.x > canvas width
 *  p.y > canvas height
 * Particles are "alive" if their opacity is greater than 0.
 */

class FanfareParticle { /* exported FanfareParticle */
  static get BORDER_ACTIONS() { return ["default", "bounce"]; }

  constructor(config) {
    this._config = config;
    this.x = 0;
    this.y = 0;
    this.dx = 0;
    this.dy = 0;
    this.xforce = 0;
    this.yforce = 0;
    this.force = 0;
    this.a = 1;
    this.lifeTick = 0.01;
    this.borderAction = "default";
    this._xmin = 0;
    this._xmax = 0;
    this._ymin = 0;
    this._ymax = 0;
    this._image = null;
    this._frames = null;
    this._framenr = 0;
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

  /* Get an image to draw: either a static image or the next frame */
  get image() {
    let img = this._image;
    if (this._frames && this._frames.length > 0) {
      img = this._frames[this._framenr];
      this._framenr += 1;
      if (this._framenr >= this._frames.length) {
        this._framenr = 0;
      }
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
    const hasNum = (k) => (typeof(opts[k]) === "number");
    const hasRange = (k) => (Util.IsArray(opts[k]) && opts[k].length === 2);
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
    this.xforce = getValue("xforce", 0);
    this.yforce = getValue("yforce", 0);
    this.force = getValue("force", 0);
    this.lifeTick = getValue("lifeTick", 0.01);
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
      }
    }
  }

  /* Handle particle movement and decrease opacity by this.lifeTick */
  tick() {
    if (this.alive) {
      this.a -= this.lifeTick;
      this.x += this.dx;
      this.y += this.dy;
      this.dx += !Number.isNaN(this.xforce) ? this.xforce : 0;
      this.dy += !Number.isNaN(this.yforce) ? this.yforce : 0;
      if (this.force !== 0) {
        const scale = this.force * Math.hypot(this.x, this.y);
        const angle = Math.atan2(this.y, this.x);
        this.dx = scale * Math.cos(angle);
        this.dy = scale * Math.sin(angle);
      }
      if (this.borderAction === "bounce") {
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
}

