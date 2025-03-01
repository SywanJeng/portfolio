document.addEventListener('DOMContentLoaded', () => {
  let assetsData = {};
  const overlay = document.getElementById('overlay-content');
  const contents = document.querySelectorAll('.content'); // 各分類容器（例如 #layout、#commercial 等）
  const slider = document.querySelector('.slider'); // 作品輪播

  // 取得 header 左側兩個元素
  const headerHome = document.querySelector('.header-home');
  const headerBack = document.querySelector('.header-back');

  // 新增一個用來顯示作品詳情的容器（請確保 index.html 中有此容器）
  const detailContainer = document.getElementById('item-detail');

  // 初始首頁狀態：顯示 headerHome，隱藏 headerBack
  headerHome.style.display = 'inline-block';
  headerBack.style.display = 'none';

  // 點擊返回箭頭時，回到分類列表（首頁狀態）
  headerBack.addEventListener('click', () => {
    overlay.classList.remove('active');
    document.body.classList.remove("overlay-active");
    // 回到首頁：顯示 headerHome，隱藏 headerBack
    headerHome.style.display = 'inline-block';
    headerBack.style.display = 'none';
    // 更新 URL 回到子目錄（不含 hash）
    history.pushState(null, null, window.location.origin + window.location.pathname);
    // 清除所有導覽連結的 active 狀態
    document.querySelectorAll('.header-nav a').forEach(navLink => navLink.classList.remove('active'));
    // 若有顯示作品詳情，清空 detailContainer
    if (detailContainer) detailContainer.innerHTML = "";
  });

  // 載入 JSON 資料並生成輪播內容
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
      handleHashChange();
    })
    .catch(error => {
      console.error('❌ Error loading assets.json:', error);
      alert("⚠ 無法載入作品資料，請稍後再試！");
    });

  // 生成作品輪播（原有功能維持）
  function generateSlides(data) {
    let slideCounter = 0;
    slider.innerHTML = ""; // 清空舊內容

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

          // 建立一個連結，將圖片包起來，href 為 "#{category}/{slug}"
          const link = document.createElement('a');
          // 若 item.slug 存在才設定，否則僅用分類
          link.href = item.slug ? `#${item.category.toLowerCase()}/${item.slug}` : `#${item.category.toLowerCase()}`;

          const img = document.createElement('img');
          img.src = 'images/' + item.images[0];
          img.alt = item.title;
          img.setAttribute('loading', 'lazy');

          link.appendChild(img);
          imagesContainer.appendChild(link);
          slide.appendChild(imagesContainer);
        }

        // slide hover 效果（保持原有功能）
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

  // Hash 解析函式：將 hash 拆成 category 與 slug（如果有）
  function parseHash() {
    const fullHash = window.location.hash.replace("#", ""); // e.g. "layout/2024yydesign"
    const parts = fullHash.split("/");
    return {
      category: parts[0] || null,
      slug: parts[1] || null
    };
  }

  // 根據 hash 決定顯示內容
  function handleHashChange() {
    const { category, slug } = parseHash();
    if (!category) {
      // 沒有 hash → 回首頁（你可以呼叫現有的首頁函式）
      return;
    }
    // 如果只有一層 hash（例如 "#layout"），則顯示該分類列表
    if (!slug) {
      showContent(category);
    } else {
      // 如果有 slug，則顯示作品詳情
      showItemDetail(category, slug);
    }
  }

  // 顯示分類列表（保持原有 showContent 邏輯）
  function showContent(targetId, updateUrl = true) {
    overlay.classList.add('active');
    document.body.classList.add("overlay-active");
    // 清空各分類容器
    contents.forEach(content => {
      content.classList.remove('active');
      content.innerHTML = "";
    });
    // 同時清空作品詳情容器
    if (detailContainer) detailContainer.innerHTML = "";

    if (!assetsData[targetId]) {
      console.warn(`⚠ 無法找到 "${targetId}" 的資料`);
      return;
    }

    const contentElement = document.getElementById(targetId);
    if (contentElement) {
      contentElement.classList.add('active');
      const overlayInner = document.createElement('div');
      overlayInner.classList.add('overlay-inner');

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

      // 讀取該分類所有資料並生成列表（這裡你可依需求擴充更多內容）
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
      history.pushState(null, null, window.location.pathname + `#${targetId}`);
    }

    // 切換 header 左側：隱藏首頁文字，顯示返回箭頭
    headerHome.style.display = 'none';
    headerBack.style.display = 'inline-block';
  }

  // 顯示作品詳情
  function showItemDetail(category, slug) {
    // 清空 overlay 中所有分類內容
    contents.forEach(content => {
      content.classList.remove('active');
      content.innerHTML = "";
    });
    // 清空作品詳情區
    if (detailContainer) detailContainer.innerHTML = "";

    if (!assetsData[category]) {
      console.warn(`⚠ 找不到分類: ${category}`);
      return;
    }
    // 從該分類中找出 slug 對應的作品
    const item = assetsData[category].find(work => work.slug === slug);
    if (!item) {
      console.warn(`⚠ 找不到 slug 為 ${slug} 的作品`);
      return;
    }

    // 動態生成作品詳情 HTML
    const detailHtml = `
      <h2>${item.title}</h2>
      <p>${item.description}</p>
      <div class="detail-images">
        ${item.images.map(img => `<img src="images/${img}" alt="${item.title}" loading="lazy">`).join('')}
      </div>
    `;
    if (detailContainer) {
      detailContainer.innerHTML = detailHtml;
    }

    // 顯示 overlay 並更新 URL
    overlay.classList.add("active");
    document.body.classList.add("overlay-active");
    history.pushState(null, null, window.location.pathname + `#${category}/${slug}`);

    // 切換 header 左側
    headerHome.style.display = 'none';
    headerBack.style.display = 'inline-block';
  }

  // 監聽導覽連結點擊事件，同時控制 active class
  document.querySelectorAll('.header-nav a').forEach(link => {
    link.addEventListener('click', function(event) {
      event.preventDefault();
      // 清除其他連結的 active class
      document.querySelectorAll('.header-nav a').forEach(navLink => navLink.classList.remove('active'));
      this.classList.add('active');

      const targetId = this.getAttribute('data-target');
      showContent(targetId);
    });
  });

  // 監聽 popstate（瀏覽器上一頁/下一頁）
  window.addEventListener('popstate', () => {
    const { category, slug } = parseHash();
    if (category) {
      if (slug) {
        showItemDetail(category, slug);
      } else {
        showContent(category, false);
      }
    } else {
      overlay.classList.remove('active');
      document.body.classList.remove("overlay-active");
      headerHome.style.display = 'inline-block';
      headerBack.style.display = 'none';
      document.querySelectorAll('.header-nav a').forEach(navLink => navLink.classList.remove('active'));
      history.pushState(null, null, window.location.origin + window.location.pathname);
    }
  });

  // 頁面載入時處理 hash
  function checkInitialHash() {
    if (window.location.hash) {
      handleHashChange();
    }
  }

  function handleHashChange() {
    const { category, slug } = parseHash();
    if (category) {
      if (slug) {
        showItemDetail(category, slug);
      } else {
        showContent(category);
      }
    }
  }

  // 監聽滾動事件（可選）
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      overlay.classList.add("scroll-active");
    } else {
      overlay.classList.remove("scroll-active");
    }
  });

  // 同步 overlay-inner 與 header 的左右邊距（原有功能）
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

  // 調整 logo 文字大小（原有功能）
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
