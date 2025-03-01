document.addEventListener('DOMContentLoaded', () => {
  let assetsData = {}; 
  const overlay = document.getElementById('overlay-content');
  const contents = document.querySelectorAll('.content');
  const headerBack = document.querySelector('.header-back'); 
  const slider = document.querySelector('.slider'); // 作品輪播

  // 直接取得 HTML 中的 back-button（已放在 header-back 裡）
  const backButton = document.querySelector('.back-button');
  
  // 首頁狀態：整個欄位 + 箭頭都隱藏
  headerBack.style.display = 'none';
  backButton.style.display = 'none';

  // 🚀 點擊返回箭頭時關閉 overlay
  backButton.addEventListener('click', () => {
    overlay.classList.remove('active');
    document.body.classList.remove("overlay-active");
    // 回到首頁狀態：隱藏整個欄位 + 箭頭
    headerBack.style.display = 'none';
    backButton.style.display = 'none';
    history.pushState(null, null, window.location.origin); // 修正網址
  });

  // 🚀 載入 assets.json
  fetch('assets.json')
    .then(response => {
      if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      assetsData = data;
      console.log("✅ assets.json 載入成功:", data);
      generateSlides(data);
      syncOverlayMargin();
      checkInitialHash();
    })
    .catch(error => {
      console.error('❌ Error loading assets.json:', error);
      alert("⚠ 無法載入作品資料，請稍後再試！");
    });

  // 🎡 **生成作品輪播**
  function generateSlides(data) {
    let slideCounter = 0;
    slider.innerHTML = ""; // 清空舊的內容

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

    // 預設讓中間的 slide 被放大
    const defaultSlide = slider.querySelectorAll('.slide')[3];
    if (defaultSlide) {
      defaultSlide.classList.add('enlarged');
      defaultSlide.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }

  // 🚀 展開內容
  function showContent(targetId, updateUrl = true) {
    overlay.classList.add('active');
    document.body.classList.add("overlay-active"); // 禁止 body 滾動
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

      // 建立 .overlay-inner 讓內容對齊 header
      const overlayInner = document.createElement('div');
      overlayInner.classList.add('overlay-inner');

      // 設定大標題
      const titleMap = {
        "layout": "Layouts",
        "exhibition": "Exhibitions",
        "commercial": "Commercial Projects",
        "photography": "Photography Collection",
        "about": "About Me"
      };

      const headerTitle = document.createElement('h1');
      headerTitle.classList.add('content-title');
      headerTitle.textContent = titleMap[targetId] || "Untitled";
      overlayInner.appendChild(headerTitle);

      // 讀取該分類所有資料
      assetsData[targetId].forEach(item => {
        const itemContainer = document.createElement('div');
        itemContainer.classList.add('content-item', 'fade-in');

        const randomWidth = Math.floor(Math.random() * (600 - 300 + 1)) + 300;
        const words = item.summary.split(" ");
        const imgTag = `<img src="images/${item.images?.[0] || 'default.jpg'}" 
                        alt="${item.title}" loading="lazy" class="inline-img" 
                        style="width:${randomWidth}px; height:auto;">`;

        let insertIndex;
        const positionType = Math.random();
        if (positionType < 0.3) {
          insertIndex = 0;
        } else if (positionType > 0.7) {
          insertIndex = words.length;
        } else {
          insertIndex = Math.floor(Math.random() * words.length);
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
      syncOverlayMargin();
    }

    if (updateUrl && window.location.hash !== `#${targetId}`) {
      history.pushState(null, null, `#${targetId}`);
    }

    // 當 overlay 展開時，顯示整個欄位 + 箭頭
    headerBack.style.display = 'flex';
    backButton.style.display = 'inline-block';
  }

  // 監聽導覽連結
  document.querySelectorAll('.header-nav a').forEach(link => {
    link.addEventListener('click', function(event) {
      event.preventDefault();
      const targetId = this.getAttribute('data-target');
      showContent(targetId);
    });
  });

  // 當使用瀏覽器上一頁/下一頁時更新 overlay
  window.addEventListener('popstate', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      showContent(hash, false);
    } else {
      overlay.classList.remove('active');
      document.body.classList.remove("overlay-active");
      // 回到首頁狀態：隱藏整個欄位 + 箭頭
      headerBack.style.display = 'none';
      backButton.style.display = 'none';
    }
  });

  // 頁面載入時若有 hash 自動展開對應內容
  function checkInitialHash() {
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash) {
      showContent(initialHash, false);
    }
  }

  // 監聽滾動事件，讓 overlay 在滾動時覆蓋 header
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      overlay.classList.add("scroll-active");
    } else {
      overlay.classList.remove("scroll-active");
    }
  });

  // 確保 overlay-inner margin 與 header 一致
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
