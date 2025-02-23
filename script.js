document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('.header-center a');
  const overlay = document.getElementById('overlay-content');
  const contents = document.querySelectorAll('.content');

  // 這個函數用來顯示對應的展開內容
  function showContent(targetId, updateUrl = true) {
    // 顯示 overlay
    overlay.classList.add('active');

    // 隱藏所有內容，僅顯示點擊的內容
    contents.forEach(content => {
      content.classList.remove('active');
      if (content.id === targetId) {
        content.classList.add('active');
      }
    });

    // 更新網址（但不刷新頁面）
    if (updateUrl) {
      history.pushState(null, null, `#${targetId}`);
    }
  }

  // 監聽選單點擊，展開對應內容並更新網址
  links.forEach(link => {
    link.addEventListener('click', function(event) {
      event.preventDefault();
      const targetId = this.getAttribute('data-target');
      showContent(targetId);
    });
  });

  // 監聽網址變化，使用者按「上一頁/下一頁」時正確顯示內容
  window.addEventListener('popstate', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      showContent(hash, false); // 不要再 pushState，避免重複更新網址
    } else {
      overlay.classList.remove('active'); // 沒有 hash 時關閉 overlay
    }
  });

  // 頁面載入時，檢查網址的 hash，若有則展開對應內容
  const initialHash = window.location.hash.replace('#', '');
  if (initialHash) {
    showContent(initialHash, false); // 不要 pushState，因為網址已經是 hash 了
  }
});
