document.addEventListener('DOMContentLoaded', () => {
  let assetsData = {}; // 儲存 assets.json 資料

  // 先載入 assets.json
  fetch('assets.json')
    .then(response => response.json())
    .then(data => {
      assetsData = data; // 存入變數
      console.log("✅ assets.json 已載入", assetsData);
    })
    .catch(error => console.error('❌ Error loading assets:', error));

  const overlay = document.getElementById('overlay-content');
  const contents = document.querySelectorAll('.content');

  function showContent(targetId, updateUrl = true) {
    console.log(`📢 嘗試顯示 ${targetId}`);

    overlay.classList.add('active');

    // 隱藏所有內容
    contents.forEach(content => {
      content.classList.remove('active');
      content.innerHTML = ""; // 清空內容，避免舊資料殘留
    });

    if (assetsData[targetId]) {
      const categoryData = assetsData[targetId][0]; // 取第一筆資料
      const contentElement = document.getElementById(targetId);

      if (contentElement) {
        console.log(`📌 找到 ${targetId}，填充資料中...`);

        contentElement.classList.add('active');
        contentElement.innerHTML = `
          <h2>${categoryData.title}</h2>
          <p>${categoryData.summary}</p>
          <img src="images/${categoryData.images[0]}" alt="${categoryData.title}" loading="lazy">
        `;
      } else {
        console.warn(`⚠ 找不到 id="${targetId}" 的 .content 區塊`);
      }
    } else {
      console.warn(`⚠ assets.json 中沒有 "${targetId}" 的資料`);
    }

    // 更新網址
    if (updateUrl) {
      history.pushState(null, null, `#${targetId}`);
    }
  }

  document.querySelectorAll('.header-center a').forEach(link => {
    link.addEventListener('click', function(event) {
      event.preventDefault();
      const targetId = this.getAttribute('data-target');
      showContent(targetId);
    });
  });

  // 監聽網址變化
  window.addEventListener('popstate', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      showContent(hash, false);
    } else {
      overlay.classList.remove('active');
    }
  });

  // 頁面載入時，檢查網址的 hash
  const initialHash = window.location.hash.replace('#', '');
  if (initialHash) {
    showContent(initialHash, false);
  }
});
