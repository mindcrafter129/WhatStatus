import json, pathlib
here = pathlib.Path(__file__).parent
src = (here / "ui.src.js").read_text(encoding="utf-8")
tpl = (here / "wa-templates.json").read_text(encoding="utf-8")
(here.parent / "ext" / "ui.js").write_text(src.replace("/*TEMPLATES*/null", tpl), encoding="utf-8")
print("ui.js written")
