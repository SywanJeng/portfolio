document.addEventListener('DOMContentLoaded', () => {
  let assetsData = {};
  const overlay = document.getElementById('overlay-content');
  const slider = document.querySelector('.slider');

  // 取得 header 左側兩個元素
  const headerHome = document.querySelector('.header-home');
  const headerBack = document.querySelector('.header-back');

  // 初始首頁狀態
  headerHome.style.display = 'inline-block';
  headerBack.style.display = 'none';

  // **點擊返回箭頭時，關閉 overlay**
  headerBack.addEventListener('click', () => {
    overlay.classList.remove('active');
    document.body.classList.remove("overlay-active");
    headerHome.style.display = 'inline-block';
    headerBack.style.display = 'none';
    history.pushState(null, null, window.location.origin + window.location.pathname);
    document.querySelectorAll('.header-nav a').forEach(navLink => navLink.classList.remove('active'));
  });

  // **載入 JSON 並生成作品輪播**
  fetch('assets.json')
    .then(response => {
      if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      assetsData = data;
      console.log("✅ assets.json 載入成功:", data);
      generateSlides(data); // **載入作品**
      syncOverlayMargin();
      handleHashChange();
      enableSliderDrag(); // **修復滑鼠拖動**
    })
    .catch(error => {
      console.error('❌ Error loading assets.json:', error);
      alert("⚠ 無法載入作品資料，請稍後再試！");
    });

  // **修正 generateSlides()**
  function generateSlides(data) {
    slider.innerHTML = ""; // **清空 slider 內容**
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

        slider.appendChild(slide);
      });
    });

    enableSliderDrag(); // **確保 `.slider` 內容載入後，啟用拖動**
  }

  // **修正滑鼠拖動 `.slider`**
  function enableSliderDrag() {
    let isDown = false;
    let startX;
    let scrollLeft;

    slider.addEventListener('mousedown', (e) => {
      isDown = true;
      slider.classList.add('active');
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
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 2;
      slider.scrollLeft = scrollLeft - walk;
    });
  }

  // **解析 Hash URL**
  function parseHash() {
    const fullHash = window.location.hash.replace("#", "");
    const parts = fullHash.split("/");
    return {
      category: parts[0] || null,
      slug: parts[1] || null
    };
  }

  // **處理 Hash 變更**
  function handleHashChange() {
    const { category, slug } = parseHash();
    if (!category) return;
    if (!slug) {
      showContent(category);
    } else {
      showItemDetail(category, slug);
    }
  }

  
  // 展開 overlay-content
  function showContent(category) {
    const listContainer = overlay.querySelector('.vertical-list-container');
    const previewImg = overlay.querySelector('#vertical-preview');
  
    // 清空現有內容
    listContainer.innerHTML = "";
  
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
    listContainer.appendChild(categoryTitle);
  
    const ul = document.createElement('ul');
    ul.classList.add('vertical-list');
  
    const items = assetsData[category];
    if (!items) {
      console.warn(`找不到分類: ${category}`);
      return;
    }
  
    items.forEach(item => {
      const li = document.createElement('li');
      li.classList.add('vertical-item');
      li.textContent = item.title;
      li.dataset.images = JSON.stringify(item.images);
  
      li.addEventListener('mouseenter', () => {
        const images = JSON.parse(li.dataset.images);
        previewImg.src = 'images/' + (images && images.length > 0 ? images[0] : 'default.jpg');
      });
  
      li.addEventListener('click', () => {
        if (item.slug) {
          showItemDetail(category, item.slug);
        }
      });
  
      ul.appendChild(li);
    });
  
    listContainer.appendChild(ul);
  
    // **這裡確保 overlay-content 顯示**
    overlay.classList.add('active');
    document.body.classList.add('overlay-active');
  
    if (items.length > 0 && items[0].images && items[0].images.length > 0) {
      previewImg.src = 'images/' + items[0].images[0];
    } else {
      previewImg.src = 'images/default.jpg';
    }
  
    history.pushState(null, null, window.location.pathname + `#${category}`);
    headerHome.style.display = 'none';
    headerBack.style.display = 'inline-block';
  }  

  // **同步 overlay 與 header 的左右邊距**
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

  // **監聽導航點擊**
  document.querySelectorAll('.header-nav a').forEach(link => {
    link.addEventListener('click', function(event) {
      event.preventDefault();
      document.querySelectorAll('.header-nav a').forEach(navLink => navLink.classList.remove('active'));
      this.classList.add('active');
      showContent(this.getAttribute('data-target'));
    });
  });

  // **處理瀏覽器返回/前進**
  window.addEventListener('popstate', handleHashChange);

  // **LOGO 自動縮放**
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
  }
  window.addEventListener('resize', adjustResponsiveText);
  adjustResponsiveText();
});
