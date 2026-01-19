// Shared helpers for Telegram Gifts bridge (used by TelegramGifts.jslib).
// Loaded from WebGL template before Unity loader.
(function (global) {
  var helpers = {
    lastError: "",
    setError: function (msg) {
      helpers.lastError = msg || "";
    },
    getError: function () {
      return helpers.lastError || "";
    },
    clearError: function () {
      helpers.lastError = "";
    },
    getWebApp: function () {
      try {
        if (typeof global === "undefined") {
          return null;
        }
        var tg = global.Telegram && global.Telegram.WebApp ? global.Telegram.WebApp : null;
        return tg || null;
      } catch (e) {
        return null;
      }
    },
  };

  // Expose a single namespace to be used from the jslib.
  global.TelegramGiftsHelpers = helpers;
})(typeof window !== "undefined" ? window : this);
