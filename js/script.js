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

  // 點擊返回箭頭時，關閉 overlay
  headerBack.addEventListener('click', () => {
    overlay.classList.remove('active');
    document.body.classList.remove("overlay-active");
    headerHome.style.display = 'inline-block';
    headerBack.style.display = 'none';
    history.pushState(null, null, window.location.origin + window.location.pathname);
    document.querySelectorAll('.header-nav a').forEach(navLink => navLink.classList.remove('active'));
  });

  // 載入 JSON 並生成作品輪播
  fetch('data/assets.json')
    .then(response => {
      if (!response.ok) throw new Error(`HTTP Error! Status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      assetsData = data;
      console.log("✅ assets.json 載入成功:", data);
      generateSlides(data); // 載入作品
      syncOverlayMargin();
      handleHashChange();
      enableSliderDrag(); // 啟用滑鼠拖動
    })
    .catch(error => {
      console.error('❌ Error loading assets.json:', error);
      alert("⚠ 無法載入作品資料，請稍後再試！");
    });

  // 生成作品輪播項目
  function generateSlides(data) {
    slider.innerHTML = ""; // 清空 slider 內容
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

    enableSliderDrag(); // 確保 `.slider` 內容載入後，啟用拖動
  }

  // 實現滑鼠拖動 `.slider` 功能
  function enableSliderDrag() {
    if (overlay.classList.contains('active')) return; // 如果 overlay 是開啟的，不啟用拖動
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

  // 解析 URL Hash
  function parseHash() {
    const fullHash = window.location.hash.replace("#", "");
    const parts = fullHash.split("/");
    return {
      category: parts[0] || null,
      slug: parts[1] || null
    };
  }

  // 處理 Hash 變更
  function handleHashChange() {
    const { category, slug } = parseHash();
    if (!category) return;
    
    if (category === 'about') {
      showAboutPage();
    } else if (category === 'message') {
      showMessageForm();
    } else if (!slug) {
      showContent(category);
    } else {
      showItemDetail(category, slug);
    }
  }

  // 展示分類內容
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

  items.forEach((item, index) => {
    const li = document.createElement('li');
    li.classList.add('vertical-item');
    li.style.animationDelay = `${index * 0.1}s`;
    li.style.animation = `slideInRight 0.5s ease forwards`;
    li.dataset.images = JSON.stringify(item.images);
    
    // 建立標題元素
    const titleElement = document.createElement('div');
    titleElement.classList.add('item-title');
    titleElement.textContent = item.title;
    
    // 建立摘要元素
    const summaryElement = document.createElement('div');
    summaryElement.classList.add('item-summary');
    summaryElement.textContent = item.summary || '';

    // 將標題和摘要加入列表項
    li.appendChild(titleElement);
    li.appendChild(summaryElement);

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

  // 確保 overlay-content 顯示
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
  
  // 實現作品詳情頁功能
  function showItemDetail(category, slug) {
    const overlay = document.getElementById('overlay-content');
    
    // 確保overlay顯示
    overlay.classList.add('active');
    document.body.classList.add('overlay-active');
    
    // 尋找指定slug的作品項目
    const items = assetsData[category];
    if (!items) {
      console.warn(`找不到分類: ${category}`);
      return;
    }
    
    const item = items.find(i => i.slug === slug);
    if (!item) {
      console.warn(`找不到作品: ${slug}`);
      return;
    }
    
    // 清空現有內容
    const listContainer = overlay.querySelector('.vertical-list-container');
    listContainer.innerHTML = "";
    
    // 創建返回按鈕
    const backButton = document.createElement('div');
    backButton.classList.add('back-to-category');
    backButton.textContent = `返回 ${category.charAt(0).toUpperCase() + category.slice(1)}`;
    backButton.addEventListener('click', () => {
      showContent(category);
    });
    
    // 創建作品詳情內容
    const detailContent = document.createElement('div');
    detailContent.classList.add('item-detail');
    
    // 標題
    const title = document.createElement('h1');
    title.classList.add('detail-title');
    title.textContent = item.title;
    
    // 描述
    const description = document.createElement('div');
    description.classList.add('detail-description');
    description.textContent = item.description;
    
    // 圖片畫廊
    const gallery = document.createElement('div');
    gallery.classList.add('detail-gallery');
    
    if (item.images && item.images.length > 0) {
      item.images.forEach((imagePath, index) => {
        const imgContainer = document.createElement('div');
        imgContainer.classList.add('gallery-item');
        
        const img = document.createElement('img');
        img.src = 'images/' + imagePath;
        img.alt = `${item.title} - 圖片 ${index + 1}`;
        img.setAttribute('loading', 'lazy');
        
        imgContainer.appendChild(img);
        gallery.appendChild(imgContainer);
        
        // 點擊圖片時，在右側預覽區顯示大圖
        imgContainer.addEventListener('click', () => {
          const previewImg = document.getElementById('vertical-preview');
          previewImg.src = 'images/' + imagePath;
        });
      });
    }
    
    // 組裝詳情內容
    detailContent.appendChild(title);
    detailContent.appendChild(description);
    detailContent.appendChild(gallery);
    
    listContainer.appendChild(backButton);
    listContainer.appendChild(detailContent);
    
    // 設置右側預覽圖
    const previewImg = document.getElementById('vertical-preview');
    if (item.images && item.images.length > 0) {
      previewImg.src = 'images/' + item.images[0];
    } else {
      previewImg.src = 'images/default.jpg';
    }
    
    // 更新URL
    history.pushState(null, null, window.location.pathname + `#${category}/${slug}`);
    
    // 更新頁面顯示狀態
    document.querySelectorAll('.header-nav a').forEach(navLink => {
      if (navLink.getAttribute('data-target') === category) {
        navLink.classList.add('active');
      } else {
        navLink.classList.remove('active');
      }
    });
    
    // 更新頭部顯示
    const headerHome = document.querySelector('.header-home');
    const headerBack = document.querySelector('.header-back');
    headerHome.style.display = 'none';
    headerBack.style.display = 'inline-block';
  }
  
  // 顯示「關於我」頁面
  function showAboutPage() {
    const overlay = document.getElementById('overlay-content');
    
    // 確保overlay顯示
    overlay.classList.add('active');
    document.body.classList.add('overlay-active');
    
    // 清空現有內容
    const listContainer = overlay.querySelector('.vertical-list-container');
    listContainer.innerHTML = "";
    
    // 創建「關於我」內容
    const aboutContent = document.createElement('div');
    aboutContent.classList.add('about-content');
    
    // 標題
    const title = document.createElement('h1');
    title.classList.add('about-title');
    title.textContent = "關於我";
    
    // 個人介紹
    const intro = document.createElement('div');
    intro.classList.add('about-intro');
    intro.innerHTML = `
      <p class="intro-text">我是一名專注於使用者體驗與視覺設計的UI/UX設計師，擁有多年實務經驗。</p>
      <p>我相信設計不僅是關於美感，更是解決問題的過程。通過深入了解使用者需求和商業目標，我創造既美觀又實用的設計方案。</p>
    `;
    
    // 專業技能
    const skills = document.createElement('div');
    skills.classList.add('about-skills');
    skills.innerHTML = `
      <h2>專業技能</h2>
      <div class="skills-grid">
        <div class="skill-item">
          <span class="skill-name">UI/UX設計</span>
          <div class="skill-bar"><div class="skill-level" style="width: 95%"></div></div>
        </div>
        <div class="skill-item">
          <span class="skill-name">平面設計</span>
          <div class="skill-bar"><div class="skill-level" style="width: 90%"></div></div>
        </div>
        <div class="skill-item">
          <span class="skill-name">攝影與後製</span>
          <div class="skill-bar"><div class="skill-level" style="width: 85%"></div></div>
        </div>
        <div class="skill-item">
          <span class="skill-name">展場設計</span>
          <div class="skill-bar"><div class="skill-level" style="width: 80%"></div></div>
        </div>
        <div class="skill-item">
          <span class="skill-name">前端開發</span>
          <div class="skill-bar"><div class="skill-level" style="width: 70%"></div></div>
        </div>
      </div>
    `;
    
    // 聯絡信息
    const contact = document.createElement('div');
    contact.classList.add('about-contact');
    contact.innerHTML = `
      <h2>聯絡方式</h2>
      <div class="contact-grid">
        <div class="contact-item">
          <span class="contact-label">Email</span>
          <a href="mailto:yourname@example.com" class="contact-value">yourname@example.com</a>
        </div>
        <div class="contact-item">
          <span class="contact-label">LinkedIn</span>
          <a href="#" class="contact-value">linkedin.com/in/yourname</a>
        </div>
        <div class="contact-item">
          <span class="contact-label">Behance</span>
          <a href="#" class="contact-value">behance.net/yourname</a>
        </div>
      </div>
    `;
    
    // 組裝「關於我」內容
    aboutContent.appendChild(title);
    aboutContent.appendChild(intro);
    aboutContent.appendChild(skills);
    aboutContent.appendChild(contact);
    
    listContainer.appendChild(aboutContent);
    
    // 設置右側預覽圖 (可替換為個人照片)
    const previewImg = document.getElementById('vertical-preview');
    previewImg.src = 'images/profile.jpg'; // 假設有自的個人照片
    
    // 更新URL
    history.pushState(null, null, window.location.pathname + `#about`);
    
    // 更新頁面顯示狀態
    document.querySelectorAll('.header-nav a').forEach(navLink => {
      if (navLink.getAttribute('data-target') === 'about') {
        navLink.classList.add('active');
      } else {
        navLink.classList.remove('active');
      }
    });
    
    // 更新頭部顯示
    const headerHome = document.querySelector('.header-home');
    const headerBack = document.querySelector('.header-back');
    headerHome.style.display = 'none';
    headerBack.style.display = 'inline-block';
  }
  
  // 顯示訊息表單
  function showMessageForm() {
    const overlay = document.getElementById('overlay-content');
    
    // 確保overlay顯示
    overlay.classList.add('active');
    document.body.classList.add('overlay-active');
    
    // 清空現有內容
    const listContainer = overlay.querySelector('.vertical-list-container');
    listContainer.innerHTML = "";
    
    // 創建訊息表單內容
    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');
    
    // 標題
    const title = document.createElement('h1');
    title.classList.add('message-title');
    title.textContent = "聯絡我";
    
    // 介紹文字
    const intro = document.createElement('p');
    intro.classList.add('message-intro');
    intro.textContent = "如果您對我的作品有任何疑問，或者想討論合作機會，請填寫以下表單與我聯繫。";
    
    // 創建表單
    const form = document.createElement('form');
    form.classList.add('message-form');
    form.setAttribute('id', 'contact-form');
    form.innerHTML = `
      <div class="form-row">
        <div class="form-group">
          <label for="name">姓名</label>
          <input type="text" id="name" name="name" required>
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" required>
        </div>
      </div>
      <div class="form-group">
        <label for="subject">主旨</label>
        <input type="text" id="subject" name="subject" required>
      </div>
      <div class="form-group">
        <label for="message">訊息內容</label>
        <textarea id="message" name="message" rows="5" required></textarea>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn-submit">發送訊息</button>
      </div>
    `;
    
    // 處理表單提交
    form.addEventListener('submit', function(event) {
      event.preventDefault();
      
      // 獲取表單數據
      const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value
      };
      
      // 在實際應用中，這裡會發送 AJAX 請求到後端
      // 由於這是靜態網站，我們模擬提交成功
      console.log('表單數據:', formData);
      
      // 顯示成功訊息
      showFormSuccess();
    });
    
    // 組裝訊息表單內容
    messageContent.appendChild(title);
    messageContent.appendChild(intro);
    messageContent.appendChild(form);
    
    listContainer.appendChild(messageContent);
    
    // 設置右側預覽圖
    const previewImg = document.getElementById('vertical-preview');
    previewImg.src = 'images/contact.jpg'; // 假設有聯絡頁面的圖片
    
    // 更新URL
    history.pushState(null, null, window.location.pathname + `#message`);
    
    // 更新頭部顯示
    const headerHome = document.querySelector('.header-home');
    const headerBack = document.querySelector('.header-back');
    headerHome.style.display = 'none';
    headerBack.style.display = 'inline-block';
  }
  
  // 顯示表單提交成功訊息
  function showFormSuccess() {
    const form = document.getElementById('contact-form');
    
    // 創建成功訊息元素
    const successMessage = document.createElement('div');
    successMessage.classList.add('success-message');
    successMessage.innerHTML = `
      <div class="success-icon">✓</div>
      <h2>訊息已成功送出</h2>
      <p>感謝您的聯繫，我會盡快回覆您。</p>
      <button class="btn-back" id="btn-back-to-form">返回表單</button>
    `;
    
    // 隱藏表單並顯示成功訊息
    form.style.display = 'none';
    form.parentNode.appendChild(successMessage);
    
    // 添加「返回表單」按鈕事件
    document.getElementById('btn-back-to-form').addEventListener('click', function() {
      form.reset(); // 重置表單
      form.style.display = 'block';
      successMessage.remove();
    });
  }

  // 同步 overlay 與 header 的左右邊距
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

  // 監聽導航點擊
  document.querySelectorAll('.header-nav a').forEach(link => {
    link.addEventListener('click', function(event) {
      event.preventDefault();
      document.querySelectorAll('.header-nav a').forEach(navLink => navLink.classList.remove('active'));
      this.classList.add('active');
      
      const target = this.getAttribute('data-target');
      if (target === 'about') {
        showAboutPage();
      } else {
        showContent(target);
      }
    });
  });
  
  // 監聽「訊息」連結點擊
  document.querySelector('.header-right a').addEventListener('click', function(event) {
    event.preventDefault();
    showMessageForm();
  });

  // 處理瀏覽器返回/前進
  window.addEventListener('popstate', handleHashChange);

  // LOGO 自動縮放
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