document.addEventListener("DOMContentLoaded", () => {
  const div = document.getElementById("link");
  const copyBtn = document.getElementById("copyBtn");

  chrome.storage.local.get("lastLink", (res) => {
    if (res.lastLink) {
      div.innerHTML = `<a href="${res.lastLink}" target="_blank">${res.lastLink}</a>`;
      copyBtn.disabled = false;
      copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(res.lastLink).then(() => {
          copyBtn.textContent = "복사됨!";
          setTimeout(() => copyBtn.textContent = "복사하기", 1500);
        });
      });
    } else {
      div.textContent = "저장된 링크가 없습니다.";
      copyBtn.disabled = true;
    }
  });
});
