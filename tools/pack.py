#!/usr/bin/env python3
"""pack.py - turn an RPG Maker MV www/ folder into file:// HTML chunks.

Usage: pack.py WWW_DIR OUT_DIR [--chunk-mb N]

- data/*.json  -> data_js/*.js   (window.__RPG_DATA__[name] = {...})
- img/ audio/ movies/ fonts/ icon/ copied as-is (browsers load these fine)
- js/ copied; loader-shim + save-transfer added
- one html per chunk; --chunk-mb splits asset folders by size
"""
import json, os, shutil, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent

def fail(msg): sys.exit("pack: " + msg)

def build_data_js(www, out):
    dj = out / "data_js"; dj.mkdir(parents=True, exist_ok=True)
    names = []
    for p in sorted((www / "data").glob("*.json")):
        with open(p, encoding="utf-8-sig") as f:
            obj = json.load(f)
        (dj / (p.stem + ".js")).write_text(
            "window.__RPG_DATA__=window.__RPG_DATA__||{};"
            "window.__RPG_DATA__[%s]=%s;" % (
                json.dumps(p.name), json.dumps(obj, ensure_ascii=False)),
            encoding="utf-8")
        names.append(p.name)
    return names

def copy_tree(src, dst):
    if src.exists():
        shutil.copytree(src, dst, dirs_exist_ok=True)

def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    chunk_mb = 400
    if "--chunk-mb" in sys.argv:
        i = sys.argv.index("--chunk-mb"); chunk_mb = float(sys.argv[i + 1])
    if len(args) < 2: fail("usage: pack.py WWW_DIR OUT_DIR [--chunk-mb N]")
    www, out = map(pathlib.Path, args)
    (www / "data").is_dir() or fail("no data/ under %s - point me at www/" % www)
    out.mkdir(parents=True, exist_ok=True)

    data_names = build_data_js(www, out)
    copy_tree(www / "js", out / "js")
    for d in ("img", "audio", "movies", "fonts", "icon"):
        copy_tree(www / d, out / d)
    shutil.copy(ROOT / "src/loader-shim.js", out / "js/loader-shim.js")
    shutil.copy(ROOT / "src/save-transfer.js", out / "js/save-transfer.js")
    # plugins from the game, in order, if present
    plugin_tags = ""
    pj = www / "js/plugins.js"
    if pj.exists():
        shutil.copy(pj, out / "js/plugins.js")
        plugin_tags = '<script src="js/plugins.js"></script>\n'
        pdir = www / "js/plugins"
        if pdir.exists(): copy_tree(pdir, out / "js/plugins")

    data_tags = "\n".join(
        '<script src="data_js/%s.js"></script>' % pathlib.Path(n).stem
        for n in data_names)
    html = (ROOT / "templates/chunk.html").read_text(encoding="utf-8")
    html = html.replace("__TITLE__", "OMORI - disc 00") \
               .replace("__DATA_SCRIPTS__", data_tags) \
               .replace("__PLUGIN_SCRIPTS__", plugin_tags)
    (out / "00.html").write_text(html, encoding="utf-8")
    print("pack: wrote %s (single-disc build; chunking lands once the real "
          "asset tree is in)" % (out / "00.html"))

if __name__ == "__main__":
    main()
