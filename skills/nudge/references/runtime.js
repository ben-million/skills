/**
 * Nudge Runtime
 *
 * Minimal toast bar at bottom-center of viewport for fine-tuning a single
 * CSS property. All property types use the same up/down arrow key paradigm.
 *
 * Lifecycle:
 *   - Installed once per project via `public/__nudge.js`.
 *   - Polls for config every 500ms. Panel appears automatically via HMR.
 *
 * Controls:
 *   - ArrowUp / ArrowDown: step value (numeric ±1, color lightness ±2%,
 *     options list walk). Shift = 10× for numeric.
 *   - Enter: submit (copies generic edit prompt to clipboard).
 *   - Escape: cancel (reverts to original value).
 *
 * DOM cleanup on submit/cancel:
 *   - Strips all data-* attributes from the config element.
 *   - Removes data-nudge-target from the target element.
 *   - Stores a dismissal hash in sessionStorage.
 */

(function () {
  'use strict';

  var pollId = null;

  function tryBoot() {
    var configEl = document.getElementById('__nudge');
    if (!configEl || !configEl.dataset.property) return false;
    var configHash = configEl.dataset.property + ':' + configEl.dataset.original;
    if (sessionStorage.getItem('__ndg_dismissed') === configHash) return false;
    if (document.querySelector('.__ndg-bar')) return false;
    var targetEl = document.querySelector('[data-nudge-target]');
    if (!targetEl) return false;
    boot(configEl, targetEl, configHash);
    return true;
  }

  function startPolling() {
    if (pollId) return;
    pollId = setInterval(function () {
      if (tryBoot()) stopPolling();
    }, 500);
  }

  function stopPolling() {
    if (pollId) { clearInterval(pollId); pollId = null; }
  }

  if (!tryBoot()) startPolling();

  // Reload fallback: if config is present but bar hasn't appeared within 2s,
  // do a single page reload so the script runs fresh against the current DOM.
  setTimeout(function () {
    var c = document.getElementById('__nudge');
    if (c && c.dataset.property && !document.querySelector('.__ndg-bar')) {
      if (sessionStorage.getItem('__ndg_reload_guard') !== c.dataset.property) {
        sessionStorage.setItem('__ndg_reload_guard', c.dataset.property);
        location.reload();
      }
    }
  }, 2000);

  // ---------------------------------------------------------------------------
  // HSL helpers
  // ---------------------------------------------------------------------------

  function hexToHSL(hex) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    var r = parseInt(hex.substring(0,2),16)/255;
    var g = parseInt(hex.substring(2,4),16)/255;
    var b = parseInt(hex.substring(4,6),16)/255;
    var max = Math.max(r,g,b), min = Math.min(r,g,b);
    var h = 0, s = 0, l = (max+min)/2;
    if (max !== min) {
      var d = max - min;
      s = l > 0.5 ? d/(2-max-min) : d/(max+min);
      if (max === r) h = ((g-b)/d + (g < b ? 6 : 0))/6;
      else if (max === g) h = ((b-r)/d + 2)/6;
      else h = ((r-g)/d + 4)/6;
    }
    return { h: Math.round(h*360), s: Math.round(s*100), l: Math.round(l*100) };
  }

  function hslToHex(hsl) {
    var h = hsl.h/360, s = hsl.s/100, l = hsl.l/100;
    if (s === 0) {
      var v = Math.round(l*255);
      return '#' + pad(v) + pad(v) + pad(v);
    }
    function hue2rgb(p, q, t) {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1/6) return p + (q-p)*6*t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q-p)*(2/3-t)*6;
      return p;
    }
    var q = l < 0.5 ? l*(1+s) : l+s-l*s;
    var p = 2*l - q;
    var r = Math.round(hue2rgb(p,q,h+1/3)*255);
    var g = Math.round(hue2rgb(p,q,h)*255);
    var b = Math.round(hue2rgb(p,q,h-1/3)*255);
    return '#' + pad(r) + pad(g) + pad(b);
  }

  function pad(n) {
    var s = n.toString(16);
    return s.length < 2 ? '0'+s : s;
  }

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  // ---------------------------------------------------------------------------
  // BOOT
  // ---------------------------------------------------------------------------

  function boot(configEl, targetEl, configHash) {

    document.querySelectorAll('.__ndg-bar').forEach(function (el) { el.remove(); });

    // -------------------------------------------------------------------------
    // STYLES
    // -------------------------------------------------------------------------

    if (!document.getElementById('__ndg-styles')) {
      var S = '\
        .__ndg-bar {\
          position: fixed;\
          bottom: 20px;\
          left: 50%;\
          transform: translateX(-50%);\
          z-index: 2147483647;\
          display: flex;\
          align-items: center;\
          gap: 8px;\
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;\
          font-size: 13px;\
          line-height: 1;\
          color: #1a1a1a;\
          background: #fff;\
          border: 1px solid #e0e0e0;\
          border-radius: 10px;\
          box-shadow: 0 4px 20px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06);\
          padding: 7px 12px;\
          pointer-events: auto;\
          user-select: none;\
        }\
        .__ndg-label {\
          font-weight: 600;\
          font-size: 11px;\
          text-transform: uppercase;\
          letter-spacing: 0.05em;\
          color: #999;\
        }\
        .__ndg-val {\
          font-weight: 600;\
          font-variant-numeric: tabular-nums;\
          min-width: 32px;\
        }\
        .__ndg-keys {\
          display: flex;\
          align-items: center;\
          gap: 3px;\
        }\
        .__ndg-kbd {\
          display: flex;\
          align-items: center;\
          justify-content: center;\
          width: 24px;\
          height: 24px;\
          border: 1px solid #d0d0d0;\
          border-bottom-width: 2px;\
          border-radius: 5px;\
          background: #f8f8f8;\
          font-size: 12px;\
          color: #666;\
          pointer-events: none;\
          transition: all 0.06s ease;\
        }\
        .__ndg-kbd-active {\
          background: #e0e0e0;\
          border-bottom-width: 1px;\
          border-color: #bbb;\
          color: #333;\
          transform: translateY(1px);\
        }\
        .__ndg-hints {\
          display: flex;\
          align-items: center;\
          gap: 6px;\
          margin-left: 2px;\
          font-size: 10px;\
          color: #c0c0c0;\
          letter-spacing: 0.02em;\
        }\
        .__ndg-toast {\
          position: fixed;\
          bottom: 64px;\
          left: 50%;\
          transform: translateX(-50%);\
          background: #333;\
          color: #fff;\
          padding: 6px 12px;\
          border-radius: 6px;\
          font-size: 12px;\
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;\
          z-index: 2147483647;\
          pointer-events: none;\
          transition: opacity 0.3s ease;\
        }\
      ';
      var styleEl = document.createElement('style');
      styleEl.id = '__ndg-styles';
      styleEl.textContent = S;
      document.head.appendChild(styleEl);
    }

    // -------------------------------------------------------------------------
    // CONFIG
    // -------------------------------------------------------------------------

    function tryParseJSON(str, fallback) {
      if (!str) return fallback;
      try { return JSON.parse(str); } catch (e) { return fallback; }
    }

    var config = {
      property: configEl.dataset.property,
      value: configEl.dataset.value,
      original: configEl.dataset.original,
      type: configEl.dataset.type || 'numeric',
      min: parseFloat(configEl.dataset.min),
      max: parseFloat(configEl.dataset.max),
      step: parseFloat(configEl.dataset.step) || 1,
      options: tryParseJSON(configEl.dataset.options, []),
      file: configEl.dataset.file || '',
      line: configEl.dataset.line || '',
    };

    if (isNaN(config.min)) config.min = 0;
    if (isNaN(config.max)) config.max = 1000;

    var savedInlineValue = targetEl.style.getPropertyValue(config.property);
    var currentValue = config.value;

    var isColor = config.type === 'color';
    var isOptions = config.options.length > 0;

    var unit = '';
    var numericValue = 0;
    var currentIndex = 0;

    if (isOptions) {
      for (var oi = 0; oi < config.options.length; oi++) {
        if (String(config.options[oi]) === String(config.value)) { currentIndex = oi; break; }
      }
    } else if (!isColor) {
      var unitMatch = String(config.value).match(/[\d.]+\s*(.*)/);
      unit = unitMatch ? unitMatch[1] : '';
      numericValue = parseFloat(config.value) || 0;
    }

    // -------------------------------------------------------------------------
    // BUILD BAR
    // -------------------------------------------------------------------------

    var bar = document.createElement('div');
    bar.className = '__ndg-bar';
    document.body.appendChild(bar);

    var labelSpan = document.createElement('span');
    labelSpan.className = '__ndg-label';
    labelSpan.textContent = config.property;
    bar.appendChild(labelSpan);

    var valSpan = document.createElement('span');
    valSpan.className = '__ndg-val';
    valSpan.textContent = config.value;
    bar.appendChild(valSpan);

    var keysDiv = document.createElement('span');
    keysDiv.className = '__ndg-keys';

    var kbdDown = document.createElement('span');
    kbdDown.className = '__ndg-kbd';
    kbdDown.textContent = '\u2193';
    keysDiv.appendChild(kbdDown);

    var kbdUp = document.createElement('span');
    kbdUp.className = '__ndg-kbd';
    kbdUp.textContent = '\u2191';
    keysDiv.appendChild(kbdUp);

    bar.appendChild(keysDiv);

    var hints = document.createElement('span');
    hints.className = '__ndg-hints';
    hints.textContent = 'esc \u00b7 enter';
    bar.appendChild(hints);

    // -------------------------------------------------------------------------
    // VALUE CHANGE
    // -------------------------------------------------------------------------

    function applyPreview(cssValue) {
      targetEl.style.setProperty(config.property, cssValue);
    }

    function onValueChange(cssValue) {
      applyPreview(cssValue);
      valSpan.textContent = cssValue;
      currentValue = cssValue;
    }

    function stepValue(direction, shift) {
      if (isOptions) {
        currentIndex = clamp(currentIndex + direction, 0, config.options.length - 1);
        onValueChange(String(config.options[currentIndex]));
      } else if (isColor) {
        var hsl = hexToHSL(currentValue);
        hsl.l = clamp(hsl.l + direction * 2, 0, 100);
        onValueChange(hslToHex(hsl));
      } else {
        var step = config.step;
        if (step >= 1) step = 1;
        var mult = shift ? 10 : 1;
        numericValue = Math.round((numericValue + direction * step * mult) * 1000) / 1000;
        numericValue = clamp(numericValue, config.min, config.max);
        onValueChange(unit ? numericValue + unit : String(numericValue));
      }
    }

    // -------------------------------------------------------------------------
    // CLIPBOARD
    // -------------------------------------------------------------------------

    function copyToClipboard(text) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(function () { fallbackCopy(text); });
      } else {
        fallbackCopy(text);
      }
    }

    function fallbackCopy(text) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0;pointer-events:none;';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      ta.remove();
    }

    function showToast(message) {
      var toast = document.createElement('div');
      toast.className = '__ndg-toast';
      toast.textContent = message;
      document.body.appendChild(toast);
      setTimeout(function () {
        toast.style.opacity = '0';
        setTimeout(function () { toast.remove(); }, 300);
      }, 1500);
    }

    // -------------------------------------------------------------------------
    // SUBMIT / CANCEL / CLEANUP
    // -------------------------------------------------------------------------

    function cleanupDOM() {
      var attrs = [].slice.call(configEl.attributes).map(function (a) { return a.name; });
      attrs.forEach(function (name) {
        if (name.indexOf('data-') === 0) configEl.removeAttribute(name);
      });
      targetEl.removeAttribute('data-nudge-target');
    }

    function dismiss() {
      sessionStorage.setItem('__ndg_dismissed', configHash);
      cleanupDOM();
      bar.remove();
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      startPolling();
    }

    function buildPrompt() {
      var parts = ['Set `' + config.property + '` to `' + currentValue + '`'];
      if (config.file) {
        parts.push('in `' + config.file + '`');
        if (config.line) parts.push('at line ' + config.line);
      }
      return parts.join(' ');
    }

    function handleSubmit() {
      copyToClipboard(buildPrompt());
      showToast('Copied to clipboard');
      dismiss();
    }

    function handleCancel() {
      if (savedInlineValue) {
        targetEl.style.setProperty(config.property, savedInlineValue);
      } else {
        targetEl.style.removeProperty(config.property);
      }
      dismiss();
    }

    // -------------------------------------------------------------------------
    // KEYBOARD
    // -------------------------------------------------------------------------

    function onKeyDown(e) {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCancel();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        stepValue(1, e.shiftKey);
        kbdUp.classList.add('__ndg-kbd-active');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        stepValue(-1, e.shiftKey);
        kbdDown.classList.add('__ndg-kbd-active');
      }
    }

    function onKeyUp(e) {
      if (e.key === 'ArrowUp') kbdUp.classList.remove('__ndg-kbd-active');
      if (e.key === 'ArrowDown') kbdDown.classList.remove('__ndg-kbd-active');
    }

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

  } // end boot()

})();
