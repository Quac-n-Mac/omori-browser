// loader-shim.js - makes an RPG Maker MV web build boot from file://
// Load AFTER js/rpg_core.js and BEFORE js/rpg_managers.js? No:
// loaded from chunk.html before main.js, after the rpg_* core files.
// It needs no XHR: all data/*.json arrive as window.__RPG_DATA__ globals
// emitted by pack.py (data_js/<Name>.js files).
(function () {
  "use strict";

  // --- 1. DataManager: serve json from inline globals ---------------------
  var _loadDataFile = DataManager.loadDataFile;
  DataManager.loadDataFile = function (name, src) {
    var inline = window.__RPG_DATA__ && window.__RPG_DATA__[src];
    if (inline !== undefined) {
      window[name] = inline;
      DataManager.onLoad(window[name]);
    } else {
      _loadDataFile.call(this, name, src);
    }
  };

  // Some MV builds pre-load $dataSystem etc. through this same function, so
  // the single patch above covers System.json, MapInfos, Actors, ... and
  // every map file (Map%1.json -> window.__RPG_DATA__ too).
  var _loadMapData = DataManager.loadMapData;
  DataManager.loadMapData = function (mapId) {
    if (mapId > 0 && window.__RPG_DATA__) {
      var src = "Map" + ("000" + mapId).slice(-3) + ".json";
      var inline = window.__RPG_DATA__[src];
      if (inline !== undefined) {
        $dataMap = inline;
        DataManager.onLoad($dataMap);
        return;
      }
    }
    _loadMapData.call(this, mapId);
  };

  // --- 2. Audio: WebAudio needs fetch(); force the <audio> path -----------
  // rpg_core picks WebAudio unless this returns true.
  Utils.isMobileSafari = function () { return true; };

  // --- 3. Fonts: FontFace API uses fetch; plain CSS does not --------------
  Graphics._loadFontFace = function (name, url) {
    var style = document.createElement("style");
    style.textContent =
      "@font-face{font-family:'" + name + "';src:url('" + url + "');}";
    document.head.appendChild(style);
    Graphics._fontLoaded = true; // skip the "did it load?" polling
  };

  // --- 4. Stop the engine's file-exists probes (XHR HEAD) -----------------
  DataManager.checkError = function () {};
})();
