
PLUGINS_PATH := plugins
FANFARE_PATH := fanfare

# Distributed sources to be transpiled
PLUGINS := $(wildcard $(PLUGINS_PATH)/*.js)
FANFARE := $(wildcard $(FANFARE_PATH)/*.js)
SOURCES := $(wildcard *.js) $(wildcard $(PLUGINS_PATH)/*.js) $(wildcard $(FANFARE_PATH)/*.js)

# Distributed sources not to be transpiled
EXTRA_SOURCES := tests/inject.js extras/effects.js

# Transpile destination directory
DIST := ./dist
DIST_PLUGINS := $(patsubst %,$(DIST)/%,$(PLUGINS))
DIST_FANFARE := $(patsubst %,$(DIST)/%,$(FANFARE))
DISTS := $(patsubst %,$(DIST)/%,$(SOURCES))

.PHONY: all twitch-api lint babel

$(shell test -d $(DIST) || mkdir $(DIST))

all: twitch-api lint babel

twitch-api:
	-cd twitch-api && git pull

lint:
	npx eslint $(SOURCES) $(EXTRA_SOURCES)

babel: $(DIST) $(DISTS)

$(DIST)/%.js: %.js
	test -d $(DIST) || mkdir $(DIST)
	npx babel --presets babel-preset-env $< -o "$@"

.PHONY: plugins
plugins: $(DIST_PLUGINS)

$(DIST)/$(PLUGINS_PATH)/%.js: $(PLUGINS_PATH)/%.js
	test -d $(DIST)/$(PLUGINS_PATH) || mkdir -p $(DIST)/$(PLUGINS_PATH)
	npx babel --presets babel-preset-env $< -o "$@"

.PHONY: fanfare
fanfare: $(DIST_FANFARE)

$(DIST)/$(FANFARE_PATH)/%.js: $(FANFARE_PATH)/%.js
	test -d $(DIST)/$(FANFARE_PATH) || mkdir -p $(DIST)/$(FANFARE_PATH)
	npx babel --presets babel-preset-env $< -o "$@"

$(DIST)/polyfill.js: node_modules/babel-polyfill/dist/polyfill.js
	test -f "$<" && echo cp "$<" "$@"

print-% : ; $(info $* is a $(flavor $*) variable set to [$($*)]) @true

# vim: sw=4 ts=4 sts=4 noet
