document.addEventListener('DOMContentLoaded', () => {
  let assetsData = {};
  const overlay = document.getElementById('overlay-content');
  // 原本的 .content 與 #item-detail 目前不再使用，故移除相關變數
  const slider = document.querySelector('.slider');

  // 取得 header 左側兩個元素
  const headerHome = document.querySelector('.header-home');
  const headerBack = document.querySelector('.header-back');

  // 初始首頁狀態：顯示 headerHome，隱藏 headerBack
  headerHome.style.display = 'inline-block';
  headerBack.style.display = 'none';

  // 點擊返回箭頭時，回到首頁（關閉 overlay）
  headerBack.addEventListener('click', () => {
    overlay.classList.remove('active');
    document.body.classList.remove("overlay-active");
    headerHome.style.display = 'inline-block';
    headerBack.style.display = 'none';
    history.pushState(null, null, window.location.origin + window.location.pathname);
    document.querySelectorAll('.header-nav a').forEach(navLink => navLink.classList.remove('active'));
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
    slider.innerHTML = "";
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

          // 建立連結，href 為 "#{category}/{slug}"
          const link = document.createElement('a');
          link.href = item.slug ? `#${item.category.toLowerCase()}/${item.slug}` : `#${item.category.toLowerCase()}`;

          const img = document.createElement('img');
          img.src = 'images/' + item.images[0];
          img.alt = item.title;
          img.setAttribute('loading', 'lazy');

          link.appendChild(img);
          imagesContainer.appendChild(link);
          slide.appendChild(imagesContainer);
        }

        // slide hover 效果
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

    // 讓 slider 可以用滑鼠拖動
const slider = document.querySelector('.slider');
let isDown = false;
let startX;
let scrollLeft;

slider.addEventListener('mousedown', (e) => {
  isDown = true;
  slider.classList.add('active'); // 可選，給拖動狀態加 class
  startX = e.pageX - slider.offsetLeft;
  scrollLeft = slider.scrollLeft;
});

slider.addEventListener('mouseleave', () => {
  isDown = false;
  slider.classList.remove('active');
});

slider.addEventListener('mouseup', () => {
  isDown = false;
  slider.classList.remove('active');
});

slider.addEventListener('mousemove', (e) => {
  if (!isDown) return; // 只有在按住滑鼠時才觸發
  e.preventDefault();
  const x = e.pageX - slider.offsetLeft;
  const walk = (x - startX) * 2; // 調整滑動速度
  slider.scrollLeft = scrollLeft - walk;
});

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
      return;
    }
    if (!slug) {
      showContent(category);
    } else {
      showItemDetail(category, slug);
    }
  }

  // 更新後的 showContent：依據新 overlay 結構（左側大字列表 + 右側預覽圖片）產生內容
  function showContent(category) {
    // 取得 overlay 中的左側列表容器與右側預覽圖片
    const listContainer = overlay.querySelector('.vertical-list-container');
    const previewImg = overlay.querySelector('#vertical-preview');
  
    // 清空左側容器內容（包括舊有標題與列表）
    listContainer.innerHTML = "";
  
    // 依照 category 產生標題，這邊可依需求擴充
    const titleMap = {
      "layout": "Layouts",
      "exhibition": "Exhibitions",
      "commercial": "Commercial Projects",
      "photography": "Photography Collection",
      "about": "About Me"
    };
    const categoryTitle = document.createElement('h1');
    categoryTitle.classList.add('list-category-title');
    categoryTitle.textContent = titleMap[category] || "Untitled";
  
    // 將標題加入左側容器
    listContainer.appendChild(categoryTitle);
  
    // 建立新的 <ul> 來存放作品列表
    const ul = document.createElement('ul');
    ul.classList.add('vertical-list');
  
    // 取得對應分類的資料
    const items = assetsData[category];
    if (!items) {
      console.warn(`找不到分類: ${category}`);
      return;
    }
  
    // 為每個作品產生一個列表項目
    items.forEach(item => {
      const li = document.createElement('li');
      li.classList.add('vertical-item');
      li.textContent = item.title;
      li.dataset.images = JSON.stringify(item.images);
  
      // 滑鼠移入時更新右側預覽圖片（取第一張）
      li.addEventListener('mouseenter', () => {
        const images = JSON.parse(li.dataset.images);
        previewImg.src = 'images/' + (images && images.length > 0 ? images[0] : 'default.jpg');
      });
  
      // 點擊列表項目時，若該作品有 slug 則進入詳細內容
      li.addEventListener('click', () => {
        if (item.slug) {
          showItemDetail(category, item.slug);
        }
      });
  
      ul.appendChild(li);
    });
  
    // 將作品列表 <ul> 加入左側容器
    listContainer.appendChild(ul);
  
    // 顯示 overlay 並禁止 body 捲動
    overlay.classList.add('active');
    document.body.classList.add('overlay-active');
  
    // 預設右側預覽圖片為第一個作品的第一張圖
    if (items.length > 0 && items[0].images && items[0].images.length > 0) {
      previewImg.src = 'images/' + items[0].images[0];
    } else {
      previewImg.src = 'images/default.jpg';
    }
  
    // 更新 URL hash
    if (window.location.hash !== `#${category}`) {
      history.pushState(null, null, window.location.pathname + `#${category}`);
    }
  
    // 更新 header 狀態：隱藏首頁文字，顯示返回箭頭
    headerHome.style.display = 'none';
    headerBack.style.display = 'inline-block';
  }
  

  // 更新後的 showItemDetail：簡易示範點擊後顯示詳情（你可根據需求進一步優化）
  function showItemDetail(category, slug) {
    const item = assetsData[category].find(work => work.slug === slug);
    if (!item) {
      console.warn(`找不到 slug 為 ${slug} 的作品`);
      return;
    }
    // 這裡示範用 overlay 全屏顯示 detail view，並提供返回功能
    overlay.innerHTML = `
      <div class="detail-view">
        <button id="detail-close">返回</button>
        <h2>${item.title}</h2>
        <p>${item.description}</p>
        <div class="detail-images">
          ${item.images.map(img => `<img src="images/${img}" alt="${item.title}" loading="lazy">`).join('')}
        </div>
      </div>
    `;
    headerHome.style.display = 'none';
    headerBack.style.display = 'inline-block';
    history.pushState(null, null, window.location.pathname + `#${category}/${slug}`);

    document.getElementById('detail-close').addEventListener('click', () => {
      // 返回列表視圖
      showContent(category);
    });
  }

  // 監聽導覽連結點擊事件
  document.querySelectorAll('.header-nav a').forEach(link => {
    link.addEventListener('click', function(event) {
      event.preventDefault();
      document.querySelectorAll('.header-nav a').forEach(navLink => navLink.classList.remove('active'));
      this.classList.add('active');
      const targetId = this.getAttribute('data-target');
      showContent(targetId);
    });
  });

  // 監聽 popstate 事件（處理瀏覽器上一頁/下一頁）
  window.addEventListener('popstate', () => {
    const { category, slug } = parseHash();
    if (category) {
      if (slug) {
        showItemDetail(category, slug);
      } else {
        showContent(category);
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

  // 監聽滾動事件（可選）
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      overlay.classList.add("scroll-active");
    } else {
      overlay.classList.remove("scroll-active");
    }
  });

  // 同步 overlay 與 header 的左右邊距（若使用 overlay-inner，可調整）
  function syncOverlayMargin() {
    const header = document.querySelector("header");
    const overlayInner = overlay.querySelector(".overlay-inner");
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
