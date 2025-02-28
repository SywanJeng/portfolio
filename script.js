document.addEventListener('DOMContentLoaded', () => {
  let assetsData = {}; // 儲存 assets.json 資料
  const overlay = document.getElementById('overlay-content');
  const contents = document.querySelectorAll('.content');

  // 先載入 assets.json
  fetch('assets.json')
    .then(response => response.json())
    .then(data => {
      assetsData = data; // 存到變數
      generateSlides(data); // 生成作品輪播
      syncOverlayWidth(); // 🚀 **確保 overlay 內部與 header 同寬**
      checkInitialHash(); // 🚀 **頁面載入時檢查 URL hash 並顯示對應內容**
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

  function showContent(targetId, updateUrl = true) {
    overlay.classList.add('active');
    document.body.classList.add("overlay-active"); // ✅ 禁止 body 滾動
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

      // 建立 `.overlay-inner` 容器，讓內容對齊 header 內的文字
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

        itemContainer.innerHTML = `
          <h2 class="item-summary">${item.summary}</h2>
          <p class="item-title">${item.title}</p>
        `;

        overlayInner.appendChild(itemContainer);
      });

      contentElement.appendChild(overlayInner);
      syncOverlayWidth(); // 🚀 **確保內容寬度與 header 一致**
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
    }
  });

  // 🚀 **頁面載入時，若有 hash，則自動展開對應內容**
  function checkInitialHash() {
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash) {
      showContent(initialHash, false);
    }
  }

  // 🚀 監聽滾動事件，當滾動超過 50px，讓 `overlay` 覆蓋 `header`
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      document.getElementById("overlay-content").classList.add("scroll-active");
    } else {
      document.getElementById("overlay-content").classList.remove("scroll-active");
    }
  });

  // 🚀 **同步 overlay-content 與 header 寬度**
  function syncOverlayWidth() {
    const header = document.querySelector("header");
    const overlayInner = document.querySelector("#overlay-content .overlay-inner");

    if (header && overlayInner) {
      overlayInner.style.maxWidth = `${header.clientWidth}px`; // ✅ 讓 overlay 內部與 header 同寬
    }
  }

  window.addEventListener("resize", syncOverlayWidth);
  window.addEventListener("DOMContentLoaded", syncOverlayWidth);

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
