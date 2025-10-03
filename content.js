console.log("Soop content script loaded (document_start)");

// injected.js 주입
(function inject() {
  const s = document.createElement("script");
  s.src = chrome.runtime.getURL("injected.js");
  s.type = "text/javascript";
  s.async = false;
  (document.head || document.documentElement).appendChild(s);
  s.onload = () => s.remove();
})();

// 메시지 수신
window.addEventListener("message", (ev) => {
  if (!ev.data || ev.data.source !== "sooplink_extension") return;

  const payload = ev.data.payload;
  let data = payload.json || (payload.text ? tryParseJSON(payload.text) : null);
  if (!data) return;

  let found = null;
  if (data.pCommentNo && data.titleNo) {
    found = { pCommentNo: data.pCommentNo, titleNo: data.titleNo };
  } else if (Array.isArray(data.data)) {
    for (const it of data.data) {
      if (it.pCommentNo && it.titleNo) {
        found = { pCommentNo: it.pCommentNo, titleNo: it.titleNo };
        break;
      }
    }
  }

  if (found) {
    const match = window.location.href.match(/station\/([^/]+)/);
    const stationId = match ? match[1] : null;
    if (!stationId) return;

    const finalUrl = `https://www.sooplive.co.kr/station/${stationId}/post/${found.titleNo}#comment_noti${found.pCommentNo}`;
    console.log("Final comment URL:", finalUrl);

    chrome.storage.local.set({ lastLink: finalUrl }, () => {
      console.log("Saved lastLink:", finalUrl);
    });
  }
}, false);

function tryParseJSON(txt) {
  try { return JSON.parse(txt); } catch { return null; }
}
