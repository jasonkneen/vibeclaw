(function () {
  // TEMP: only show on localhost
  if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') return;
  // Avoid double-mounting (e.g. index.html already inits via module import)
  if (window.__clawdioMounted) return;
  window.__clawdioMounted = true;

  function init() {
    // UMD build exposes window.TinyClaw.TinyClawWidget
    var W = window.TinyClaw && window.TinyClaw.TinyClawWidget;
    if (!W) return;

    var widget = new W({
      accent:    '#ff5c5c',
      title:     'Clawdio',
      position:  'bottom-right',
    });

    widget.mount();

    // Re-open if the user had it open on the previous page
    if (localStorage.getItem('tc-open') === '1') {
      // Wait for ready (bubble animates in first)
      var attempts = 0;
      var poll = setInterval(function () {
        attempts++;
        try { widget.open(); clearInterval(poll); } catch (e) {}
        if (attempts > 40) clearInterval(poll);
      }, 250);
    }
  }

  // If UMD already loaded (same page), init immediately
  if (window.TinyClaw) {
    init();
  } else {
    // Otherwise inject the script then init
    var s = document.createElement('script');
    s.src = '/tinyclaw-widget.js';
    s.onload = init;
    document.head.appendChild(s);
  }
})();
