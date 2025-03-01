document.addEventListener('DOMContentLoaded', () => {
  let assetsData = {}; // 儲存 assets.json 資料
  const overlay = document.getElementById('overlay-content');
  const contents = document.querySelectorAll('.content');
  const headerLeft = document.querySelector('.header-left'); // 🚀 找到 header 左側區域

  // 先載入 assets.json
  fetch('assets.json')
    .then(response => response.json())
    .then(data => {
      assetsData = data; // 存到變數
      generateSlides(data); // 生成作品輪播
      syncOverlayMargin(); // 🚀 確保 overlay-inner margin 與 header 一致
      checkInitialHash(); // 🚀 頁面載入時檢查 URL hash 並顯示對應內容
    })
    .catch(error => console.error('Error loading assets:', error));

  function generateSlides(data) {
    const slider = document.querySelector('.slider');
    let slideCounter = 0;

    Object.keys(data).forEach(category => {
      data[category].forEach(item => {
        const slide = document.createElement('div');
        slide.classList.add('slide');

        const workInfo = document.createElement('div');
        workInfo.classList.add('work-info');

        const catP = document.createElement('p');
        catP.classList.add('work-category');
        catP.textContent = item.category;

        const titleP = document.createElement('p');
        titleP.classList.add('work-title');
        titleP.textContent = item.title;

        workInfo.appendChild(catP);
        workInfo.appendChild(titleP);
        slide.appendChild(workInfo);

        if (item.images && item.images.length > 0) {
          const imagesContainer = document.createElement('div');
          imagesContainer.classList.add('images-container');
          const img = document.createElement('img');
          img.src = 'images/' + item.images[0];
          img.alt = item.title;
          img.setAttribute('loading', 'lazy');
          imagesContainer.appendChild(img);
          slide.appendChild(imagesContainer);
        }

        slide.addEventListener('mouseenter', () => {
          document.querySelectorAll('.slide').forEach(s => s.classList.remove('enlarged'));
          slide.classList.add('enlarged');
          slide.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        });

        slide.addEventListener('mouseleave', () => {
          setTimeout(() => {
            if (!slider.matches(':hover')) {
              document.querySelectorAll('.slide').forEach(s => s.classList.remove('enlarged'));
              const defaultSlide = slider.querySelectorAll('.slide')[3];
              if (defaultSlide) {
                defaultSlide.classList.add('enlarged');
              }
            }
          }, 100);
        });

        slider.appendChild(slide);
        slideCounter++;
      });
    });

    const defaultSlide = slider.querySelectorAll('.slide')[3];
    if (defaultSlide) {
      defaultSlide.classList.add('enlarged');
      defaultSlide.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }

  // 🚀 創建返回按鈕
  const backButton = document.createElement('span');
  backButton.classList.add('back-button');
  backButton.innerHTML = '⭠'; // 左箭頭
  backButton.style.display = 'none'; // 預設隱藏
  headerLeft.prepend(backButton); // 插入到 header-left 的最前面

  // 🚀 點擊返回按鈕時關閉 overlay
  backButton.addEventListener('click', () => {
    overlay.classList.remove('active');
    document.body.classList.remove("overlay-active");
    backButton.style.display = 'none'; // 隱藏返回按鈕
    history.pushState(null, null, '/'); // 回到首頁
  });

  function showContent(targetId, updateUrl = true) {
    overlay.classList.add('active');
    document.body.classList.add("overlay-active"); // ✅ 禁止 body 滾動
    backButton.style.display = 'inline-block'; // 顯示返回按鈕
    contents.forEach(content => {
      content.classList.remove('active');
      content.innerHTML = ""; // 清空內容，避免舊資料殘留
    });

    if (!assetsData[targetId]) {
      console.warn(`⚠ 無法找到 "${targetId}" 的資料`);
      return;
    }

    const contentElement = document.getElementById(targetId);
    if (contentElement) {
      contentElement.classList.add('active');

      // 🚀 插入內容
      const overlayInner = document.createElement('div');
      overlayInner.classList.add('overlay-inner');

      // 手動設定標題
      const titleMap = {
        "layout": "Layouts",
        "exhibition": "Exhibitions",
        "commercial": "Commercial Projects",
        "photography": "Photography Collection",
        "about": "About Me"
      };

      // 插入大標題
      const header = document.createElement('h1');
      header.classList.add('content-title');
      header.textContent = titleMap[targetId] || "Untitled";
      overlayInner.appendChild(header);

      // 讀取該分類的所有資料
      assetsData[targetId].forEach(item => {
        const itemContainer = document.createElement('div');
        itemContainer.classList.add('content-item', 'fade-in');

        // 🚀 **隨機決定圖片的寬度 (300 - 600px)**
        const randomWidth = Math.floor(Math.random() * (600 - 300 + 1)) + 300;

        // 🚀 **隨機決定圖片插入的位置**
        const words = item.summary.split(" ");
        const imgTag = `<img src="images/${item.images?.[0] || 'default.jpg'}" 
                        alt="${item.title}" loading="lazy" class="inline-img" 
                        style="width:${randomWidth}px; height:auto;">`;

        let insertIndex;
        const positionType = Math.random();

        if (positionType < 0.3) {
          insertIndex = 0; // 30% 機率圖片插入到開頭
        } else if (positionType > 0.7) {
          insertIndex = words.length; // 30% 機率圖片插入到結尾
        } else {
          insertIndex = Math.floor(Math.random() * words.length); // 40% 機率隨機插入
        }

        words.splice(insertIndex, 0, imgTag);
        const formattedSummary = words.join(" ");

        itemContainer.innerHTML = `
          <h2 class="item-summary">${formattedSummary}</h2>
          <p class="item-title">${item.title}</p>
        `;

        overlayInner.appendChild(itemContainer);
      });

      contentElement.appendChild(overlayInner);
      syncOverlayMargin(); // 🚀 確保內容 margin 與 header 一致
    }

    // ✅ 只有當 hash 真的變更時才更新網址，避免影響重新整理
    if (updateUrl && window.location.hash !== `#${targetId}`) {
      history.pushState(null, null, `#${targetId}`);
    }
  }

  // 🚀 **監聽選單點擊，展開對應內容**
  document.querySelectorAll('.header-center a').forEach(link => {
    link.addEventListener('click', function(event) {
      event.preventDefault();
      const targetId = this.getAttribute('data-target');
      showContent(targetId);
    });
  });

  // 🚀 **當用戶點擊「上一頁/下一頁」時，自動更新 overlay**
  window.addEventListener('popstate', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      showContent(hash, false);
    } else {
      overlay.classList.remove('active');
      backButton.style.display = 'none'; // 隱藏返回按鈕
    }
  });

  // 🚀 **頁面載入時，若有 hash，則自動展開對應內容**
  function checkInitialHash() {
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash) {
      showContent(initialHash, false);
    }
  }

  // 🚀 監聽滾動事件，確保 overlay 在滾動時覆蓋 header
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      overlay.classList.add("scroll-active");
    } else {
      overlay.classList.remove("scroll-active");
    }
  });

  // 🚀 確保 overlay-inner margin 與 header 一致
  function syncOverlayMargin() {
    const header = document.querySelector("header");
    const overlayInner = document.querySelector("#overlay-content .overlay-inner");

    if (header && overlayInner) {
      const headerMargin = (window.innerWidth - header.clientWidth) / 2;
      overlayInner.style.marginLeft = `${headerMargin}px`;
      overlayInner.style.marginRight = `${headerMargin}px`;
    }
  }

  window.addEventListener("resize", syncOverlayMargin);
  window.addEventListener("DOMContentLoaded", syncOverlayMargin);

  function adjustResponsiveText() {
    const container = document.querySelector('.logo');
    if (!container) return;
    const textElement = container.querySelector('p');
    if (!textElement) return;

    let fontSize = 250;
    textElement.style.fontSize = fontSize + 'px';

    while (textElement.scrollWidth > container.clientWidth && fontSize > 10) {
      fontSize -= 1;
      textElement.style.fontSize = fontSize + 'px';
    }

    while (textElement.scrollWidth < container.clientWidth && fontSize < 250) {
      fontSize += 1;
      textElement.style.fontSize = fontSize + 'px';
      if (textElement.scrollWidth > container.clientWidth) {
        fontSize -= 1;
        textElement.style.fontSize = fontSize + 'px';
        break;
      }
    }
  }

  adjustResponsiveText();
  window.addEventListener('resize', adjustResponsiveText);
});
