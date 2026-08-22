(function () {
  "use strict";

  var STORAGE_KEY = "el-codigo-del-piano:completed";
  var TOTAL = 8;
  var memoryStore = {};
  var canStore = false;

  try {
    var probe = "__course_probe__";
    localStorage.setItem(probe, "1");
    localStorage.removeItem(probe);
    canStore = true;
  } catch (err) {
    canStore = false;
  }

  function readMap() {
    if (!canStore) return memoryStore;
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      var parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
      return parsed;
    } catch (err) {
      return {};
    }
  }

  function writeMap(map) {
    if (!canStore) {
      memoryStore = map;
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    } catch (err) {
      canStore = false;
      memoryStore = map;
    }
  }

  function isComplete(id) {
    return !!readMap()[String(id)];
  }

  function setComplete(id, value) {
    var map = readMap();
    if (value) map[String(id)] = true;
    else delete map[String(id)];
    writeMap(map);
  }

  function countComplete() {
    var map = readMap();
    var n = 0;
    for (var i = 1; i <= TOTAL; i++) {
      if (map[String(i)]) n += 1;
    }
    return n;
  }

  function buttonLabel(done) {
    return done ? "Quitar marca de completado" : "Marcar como completado";
  }

  function updateCompleteButton(btn) {
    var id = btn.getAttribute("data-course-complete");
    if (!id) return;
    var done = isComplete(id);
    var pressed = done ? "true" : "false";
    var label = buttonLabel(done);
    if (btn.getAttribute("aria-pressed") !== pressed) btn.setAttribute("aria-pressed", pressed);
    if (btn.textContent !== label) btn.textContent = label;
    btn.classList.toggle("btn-primary", done);
    btn.classList.toggle("btn-secondary", !done);
    var status = btn.parentElement && btn.parentElement.querySelector(".course-complete-status");
    if (status) {
      status.textContent = done
        ? "Este capítulo queda marcado en este navegador."
        : "Cuando termines, marca el capítulo para ver tu avance en el inicio.";
    }
  }

  function refreshChapterButtons(root) {
    var scope = root || document;
    var buttons = scope.querySelectorAll("[data-course-complete]");
    for (var i = 0; i < buttons.length; i++) updateCompleteButton(buttons[i]);
  }

  function updateHome() {
    var home = document.querySelector("[data-course-home]");
    if (!home) return;

    var done = countComplete();
    var countEl = home.querySelector("[data-course-count]");
    var fill = home.querySelector("[data-course-fill]");
    var bar = home.querySelector("[role='progressbar']");
    var note = home.querySelector("[data-course-storage-note]");

    if (countEl) countEl.textContent = done + " de " + TOTAL + " capítulos";
    if (fill) fill.style.width = Math.round((done / TOTAL) * 100) + "%";
    if (bar) {
      bar.setAttribute("aria-valuenow", String(done));
      bar.setAttribute("aria-valuetext", done + " de " + TOTAL + " capítulos completados");
    }
    if (note) note.hidden = canStore;

    var cards = home.querySelectorAll("[data-course-card]");
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      var id = card.getAttribute("data-course-card");
      var complete = isComplete(id);
      card.classList.toggle("is-complete", complete);
      var badge = card.querySelector("[data-course-badge]");
      if (badge) {
        badge.hidden = !complete;
      }
    }
  }

  function asElement(node) {
    if (!node) return null;
    return node.nodeType === 1 ? node : node.parentElement;
  }

  document.addEventListener(
    "click",
    function (event) {
      var el = asElement(event.target);
      if (!el || typeof el.closest !== "function") return;

      var btn = el.closest("[data-course-complete]");
      if (!btn) return;
      event.preventDefault();
      var id = btn.getAttribute("data-course-complete");
      if (!id) return;
      setComplete(id, !isComplete(id));
      updateCompleteButton(btn);
    },
    false
  );

  function boot() {
    updateHome();
    refreshChapterButtons(document);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
