// save-transfer.js - RPG Maker MV plugin: copy-paste save codes.
// F6 = export (shows the code), F7 = import (paste it back).
// Codes are just every "RPG*" localStorage key (the engine already
// LZString-compresses its own save slots) packed into one base64 string.
/*:
 * @plugindesc file:// friendly save export/import via paste codes
 */
(function () {
  "use strict";

  function exportCode() {
    var bag = {};
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k && k.indexOf("RPG") === 0) bag[k] = localStorage.getItem(k);
    }
    return btoa(unescape(encodeURIComponent(JSON.stringify(bag))));
  }

  function importCode(code) {
    var bag = JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
    Object.keys(bag).forEach(function (k) { localStorage.setItem(k, bag[k]); });
  }

  function showDialog(title, text, readonly) {
    var ta = document.createElement("textarea");
    ta.value = text; ta.readOnly = !!readonly;
    ta.style.cssText =
      "position:fixed;left:5%;top:10%;width:90%;height:70%;z-index:99;" +
      "background:#000;color:#0f0;font:12px monospace;";
    document.body.appendChild(ta);
    ta.select();
    var close = document.createElement("button");
    close.textContent = "close (" + title + ")";
    close.style.cssText = "position:fixed;left:5%;top:83%;z-index:99;";
    close.onclick = function () {
      if (!readonly && ta.value.trim()) {
        try { importCode(ta.value); alert("save imported - restart to continue"); }
        catch (e) { alert("bad code"); }
      }
      ta.remove(); close.remove();
    };
    document.body.appendChild(close);
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "F6") showDialog("copy this code", exportCode(), true);
    if (e.key === "F7") showDialog("paste your code, then close", "", false);
  });
})();
