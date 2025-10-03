(function() {
  if (window.__SOOP_INJECTED__) return;
  window.__SOOP_INJECTED__ = true;

  function sendToExtension(obj) {
    window.postMessage({ source: "sooplink_extension", payload: obj }, "*");
  }

  const origFetch = window.fetch;
  window.fetch = async function(...args) {
    const res = await origFetch.apply(this, args);
    try {
      const requestUrl = typeof args[0] === "string" ? args[0] : args[0].url;
      if (requestUrl.includes("/comment")) {
        const clone = res.clone();
        clone.json().then(json => {
          sendToExtension({ type: "fetch-response", url: requestUrl, json });
        }).catch(() => {});
      }
    } catch {}
    return res;
  };

  const origOpen = XMLHttpRequest.prototype.open;
  const origSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function(method, url) {
    this.__soop_url = url;
    return origOpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function(body) {
    this.addEventListener("load", function() {
      try {
        if (this.__soop_url.includes("/comment")) {
          const txt = this.responseText;
          try {
            const json = JSON.parse(txt);
            sendToExtension({ type: "xhr-response", url: this.__soop_url, json });
          } catch {}
        }
      } catch {}
    });
    return origSend.apply(this, arguments);
  };

  console.log("soop injected script installed");
})();
