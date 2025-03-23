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

  // 全局頁面類型追蹤
  let currentPageType = 'home';

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
        // 使用結構化的 category 物件，優先使用中文
        catP.textContent = item.category.zh || item.category.en || item.category;

        const titleP = document.createElement('p');
        titleP.classList.add('work-title');
        // 使用結構化的 title 物件，優先使用中文
        titleP.textContent = item.title.zh || item.title.en || item.title;

        workInfo.appendChild(catP);
        workInfo.appendChild(titleP);
        slide.appendChild(workInfo);

        if (item.images && item.images.length > 0) {
          const imagesContainer = document.createElement('div');
          imagesContainer.classList.add('images-container');

          const link = document.createElement('a');
          // 使用 category 物件的英文值作為 URL 參數
          const categorySlug = (item.category.en || item.category).toLowerCase().replace(/\s+/g, '');
          link.href = item.slug ? `#${categorySlug}/${item.slug}` : `#${categorySlug}`;

          const img = document.createElement('img');
          img.src = 'images/' + item.images[0];
          img.alt = item.title.zh || item.title.en || item.title;
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
    
    // 映射舊分類名稱到新分類名稱 (photography -> visual)
    let mappedCategory = category;
    if (category === 'photography') {
      mappedCategory = 'visual';
      console.log('分類已從 photography 重新對應到 visual');
    }
    
    // 封裝頁面轉換邏輯
    navigateToPage(mappedCategory, slug);
  }

  // 新增：統一頁面導航函數 - 所有頁面導航統一通過此函數處理
  function navigateToPage(category, slug = null) {
    console.log(`頁面導航: ${currentPageType} → ${category}${slug ? '/' + slug : ''}`);
    
    // 先重置基本頁面狀態
    resetBasicPageState();
    
    // 根據目標頁面類型執行相應的頁面轉換操作
    if (category === 'about') {
      prepareForAboutPage();
      showAboutPage();
    } else if (category === 'message') {
      prepareForStandardPage();
      showMessageForm();
    } else if (slug) {
      prepareForStandardPage();
      showItemDetail(category, slug);
    } else {
      prepareForStandardPage();
      showContent(category);
    }
    
    // 更新當前頁面類型
    currentPageType = category;
    
    // 更新頁面顯示狀態
    updatePageState(category);
  }
  
  // 新增：基本頁面狀態重置
  function resetBasicPageState() {
    // 確保 overlay-content 顯示
    overlay.classList.add('active');
    document.body.classList.add('overlay-active');
    
    // 更新頭部顯示
    headerHome.style.display = 'none';
    headerBack.style.display = 'inline-block';
  }
  
  // 新增：為標準內容頁面準備 DOM 結構
  function prepareForStandardPage() {
    // 重設 overlay 布局為標準雙列式結構
    overlay.style.display = 'flex';
    overlay.style.flexDirection = 'row';
    
    // 獲取並重置容器樣式
    const listContainer = overlay.querySelector('.vertical-list-container');
    const imageContainer = overlay.querySelector('.vertical-image-container');
    
    if (listContainer) {
      listContainer.style.width = '66.667%';
      listContainer.style.height = '100%';
      listContainer.style.overflowY = 'auto';
    }
    
    if (imageContainer) {
      imageContainer.style.display = 'block';
      imageContainer.style.width = '33.333%';
      imageContainer.style.height = '100%';
    }
    
    // 重置預覽圖樣式
    const previewImg = overlay.querySelector('#vertical-preview');
    if (previewImg) {
      previewImg.style.display = 'block';
      previewImg.style.opacity = '1';
    }
    
    // 清空現有內容
    if (listContainer) {
      listContainer.innerHTML = "";
    }
  }
  
  // 新增：為 About 頁面準備 DOM 結構
  function prepareForAboutPage() {
    // 確保 overlay 基本結構
    overlay.style.display = 'flex';
    
    // 獲取容器
    const listContainer = overlay.querySelector('.vertical-list-container');
    const imageContainer = overlay.querySelector('.vertical-image-container');
    
    // 設置 About 頁面專用布局
    if (listContainer) {
      listContainer.style.width = '100%';  // 使左側容器佔據全部寬度
      listContainer.style.height = '100%';
      listContainer.style.overflowY = 'auto';
      listContainer.innerHTML = ""; // 清空現有內容
    }
    
    // 隱藏右側預覽區
    if (imageContainer) {
      imageContainer.style.display = 'none';
      imageContainer.style.width = '0';
    }
    
    // 隱藏預覽圖片
    const previewImg = overlay.querySelector('#vertical-preview');
    if (previewImg) {
      previewImg.style.display = 'none';
    }
  }
  
  // 更新頁面狀態
  function updatePageState(category) {
    // 更新菜單激活狀態
    document.querySelectorAll('.header-nav a').forEach(navLink => {
      if (navLink.getAttribute('data-target') === category) {
        navLink.classList.add('active');
      } else {
        navLink.classList.remove('active');
      }
    });
  }

  // 展示分類內容
  function showContent(category) {
    const listContainer = overlay.querySelector('.vertical-list-container');
    const previewImg = overlay.querySelector('#vertical-preview');

    const titleMap = {
      "layout": {
        zh: "版面設計",
        en: "Layout Design"
      },
      "exhibition": {
        zh: "展覽設計",
        en: "Exhibition Design"
      },
      "commercial": {
        zh: "商業視覺設計",
        en: "Commercial Visual Design"
      },
      "visual": {
        zh: "商品視覺設計",
        en: "Product Marketing Visuals"
      },
      "about": {
        zh: "關於我",
        en: "About Me"
      }
    };

    // 創建分類標題容器
    const categoryTitleContainer = document.createElement('div');
    categoryTitleContainer.classList.add('list-category-title');
    
    // 創建中文標題
    const categoryTitleZh = document.createElement('span');
    categoryTitleZh.classList.add('category-title-zh');
    categoryTitleZh.textContent = titleMap[category]?.zh || "未命名";
    
    // 創建英文標題
    const categoryTitleEn = document.createElement('span');
    categoryTitleEn.classList.add('category-title-en');
    categoryTitleEn.textContent = titleMap[category]?.en || "Untitled";
    
    // 組合標題
    categoryTitleContainer.appendChild(categoryTitleZh);
    categoryTitleContainer.appendChild(categoryTitleEn);
    listContainer.appendChild(categoryTitleContainer);

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
      
      // 建立中文標題元素
      const titleZhElement = document.createElement('div');
      titleZhElement.classList.add('item-title-zh');
      titleZhElement.textContent = item.title.zh || "";
      
      // 建立英文標題元素
      const titleEnElement = document.createElement('div');
      titleEnElement.classList.add('item-title-en');
      titleEnElement.textContent = item.title.en || "";
      
      // 內容容器（用於hover效果）
      const contentContainer = document.createElement('div');
      contentContainer.classList.add('item-content');
      
      // 建立摘要元素
      const summaryElement = document.createElement('div');
      summaryElement.classList.add('item-summary');
      summaryElement.textContent = item.summary || '';
      
      // 組合內容元素
      contentContainer.appendChild(summaryElement);

      // 將所有元素加入列表項
      li.appendChild(titleZhElement);
      li.appendChild(titleEnElement);
      li.appendChild(contentContainer);

      // 添加滑鼠懸停事件，更新右側預覽圖片
      li.addEventListener('mouseenter', () => {
        const images = JSON.parse(li.dataset.images);
        if (images && images.length > 0) {
          // 為預覽圖片添加淡入效果
          previewImg.style.opacity = 0;
          setTimeout(() => {
            previewImg.src = 'images/' + images[0];
            previewImg.style.opacity = 1;
          }, 200);
        }
      });

      // 優化點擊事件處理，統一處理所有項目，無論是否有 slug
      li.addEventListener('click', () => {
        if (item.slug) {
          navigateToPage(category, item.slug);
        } else {
          // 為無 slug 的項目提供視覺反饋
          document.querySelectorAll('.vertical-item').forEach(el => {
            el.classList.remove('active');
          });
          li.classList.add('active');
          
          // 確保預覽圖顯示
          const images = JSON.parse(li.dataset.images);
          if (images && images.length > 0) {
            previewImg.style.opacity = 0;
            setTimeout(() => {
              previewImg.src = 'images/' + images[0];
              previewImg.style.opacity = 1;
            }, 200);
          }
        }
      });

      ul.appendChild(li);
    });

    listContainer.appendChild(ul);

    // 設置初始預覽圖片
    if (items.length > 0 && items[0].images && items[0].images.length > 0) {
      previewImg.src = 'images/' + items[0].images[0];
    } else {
      previewImg.src = 'images/default.jpg';
    }

    history.pushState(null, null, window.location.pathname + `#${category}`);
  }
  
  // 實現作品詳情頁功能
  function showItemDetail(category, slug) {
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
    
    const listContainer = overlay.querySelector('.vertical-list-container');
    
    // 創建返回按鈕
    const backButton = document.createElement('div');
    backButton.classList.add('back-to-category');
    // 使用中文分類名稱
    const categoryTitle = {
      "layout": "版面設計",
      "exhibition": "展覽設計",
      "commercial": "商業視覺設計",
      "visual": "商品視覺設計"
    };
    backButton.textContent = `返回${categoryTitle[category] || category}`;
    backButton.addEventListener('click', () => {
      navigateToPage(category);
    });
    
    // 創建作品詳情內容
    const detailContent = document.createElement('div');
    detailContent.classList.add('item-detail');
    
    // 標題
    const title = document.createElement('h1');
    title.classList.add('detail-title');
    // 使用結構化的 title 物件，優先使用中文
    title.textContent = item.title.zh || item.title.en || item.title;
    
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
        // 使用結構化的 title 物件，優先使用中文
        const titleText = item.title.zh || item.title.en || item.title;
        img.alt = `${titleText} - 圖片 ${index + 1}`;
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
  }
  
  // 顯示「關於我」頁面
  function showAboutPage() {
    const listContainer = overlay.querySelector('.vertical-list-container');
    
    // 創建「關於我」內容 - 使用兩欄布局
    const aboutContent = document.createElement('div');
    aboutContent.classList.add('about-content');
    
    // 創建左側經歷欄位
    const experienceColumn = document.createElement('div');
    experienceColumn.classList.add('about-experience-column');
    
    // 經歷標題
    const experienceTitle = document.createElement('h2');
    experienceTitle.classList.add('experience-title');
    experienceTitle.innerHTML = 'Experience <span class="zh-title">經歷</span>';
    
    experienceColumn.appendChild(experienceTitle);
    
    // 添加經歷項目
    // 經歷項目 1 - 自由工作者
    const exp1 = createExperienceItem(
      '自由工作者', 
      'Freelancer | Graphic Designer', 
      '2020 — Present',
      `離開公司行號，回台南定居，成為自由工作者。
       多經手台南在地餐飲重新設計 Logo、店面風格、菜單設計等。
       <ul>
         <li>21年　承接加點音樂舉辦「台北音樂節」，整合線上線下活動視覺設計。包含主視覺規劃、活動視覺、社群平台投放文章模板等。活動上線「探即曾經」。</li>
         <li>22年　承接臺中市政府重新編排「2023 年臺中市福利導航工作人員手冊」提升印刷刊物與線上閱讀之體驗，更利於弱勢群體快速便捷地查找資訊、更容易理解政策的轉變與保障自己之權益。</li>
       </ul>`
    );
    
    // 經歷項目 2 - 資深視覺設計師
    const exp2 = createExperienceItem(
      '資深視覺設計師', 
      'Senior Graphic Designer', 
      '2019/03 — 2019/10',
      `任職於小宇宙數位智能，擔任視覺設計師。
       維護客戶形象網站（使用 Cyberbiz 電商平台、Tinybot 一頁式電商平台等）、製作廣告與社群平台投放素材、專案規劃；更為其合作伙伴於當年中秋檔期獲利百萬。`
    );
    
    // 經歷項目 3 - 品牌規劃專員
    const exp3 = createExperienceItem(
      '品牌規劃專員', 
      'Brand Designer', 
      '2018/03 — 2019/03',
      `任職於永聯物流開發，擔任品牌規劃專員。
       重新校正公司內外企業識別、網站更新(使用 WIX 網頁平台)、旗下產品線彙整；18 年 5 月策劃台北物流展，四天展覽期間為公司接觸多達 70% 潛在業界客戶。`
    );
    
    // 添加所有經歷到左側欄
    experienceColumn.appendChild(exp1);
    experienceColumn.appendChild(exp2);
    experienceColumn.appendChild(exp3);
    
    // 創建右側個人資訊欄位
    const profileColumn = document.createElement('div');
    profileColumn.classList.add('about-profile-column');
    
    // 添加個人照片
    const profilePhoto = document.createElement('div');
    profilePhoto.classList.add('profile-photo');
    profilePhoto.innerHTML = `<img src="images/profile.jpg" alt="Sywan Jeng 個人照片">`;
    
    // 添加姓名
    const profileName = document.createElement('h2');
    profileName.classList.add('profile-name');
    profileName.textContent = "Sywan Jeng.";
    
    // 添加自我介紹
    const profileIntro = document.createElement('div');
    profileIntro.classList.add('profile-intro');
    profileIntro.innerHTML = `
      <p>我是鄭嘉軒，現居台南，畢業於國立台灣科技大學工商業設計系。從畢業開始從事視覺設計已經長達7 年時間。</p>
      <p>我喜歡與人們產生連結，不管是形而上形而下。於我而言平面設計只是傳遞訊息的一種方式，嘗試著用不同的方法與人們互動、挑戰既有的框架。</p>
    `;
    
    // 添加技能區塊
    const profileSkills = updateSkillsSection();
    
    // 將右側欄的所有元素添加到欄位中
    profileColumn.appendChild(profilePhoto);
    profileColumn.appendChild(profileName);
    profileColumn.appendChild(profileIntro);
    profileColumn.appendChild(profileSkills);
    
    // 將左右欄添加到關於我頁面
    aboutContent.appendChild(experienceColumn);
    aboutContent.appendChild(profileColumn);
    
    // 將關於我頁面添加到容器中
    listContainer.appendChild(aboutContent);
    
    // 強制應用 About 頁面的布局樣式
    requestAnimationFrame(() => {
      const aboutContentElement = document.querySelector('.about-content');
      if (aboutContentElement) {
        aboutContentElement.style.display = 'flex';
        aboutContentElement.style.width = '100%';
      }
    });
    
    // 更新URL
    history.pushState(null, null, window.location.pathname + `#about`);
    
    // 立即顯示技能進度條動畫
    setTimeout(() => {
      document.querySelectorAll('.skill-level').forEach(element => {
        element.style.transition = 'width 1s ease-in-out';
        element.style.width = element.style.width;
      });
    }, 100);
  }
  
  // 創建經歷項目的輔助函數
  function createExperienceItem(title, subtitle, period, description) {
    const item = document.createElement('div');
    item.classList.add('experience-item');
    
    const itemHeader = document.createElement('div');
    itemHeader.classList.add('experience-header');
    
    const itemTitle = document.createElement('div');
    itemTitle.classList.add('experience-item-title');
    itemTitle.innerHTML = `
      <h3>${title}</h3>
      <h4>${subtitle}</h4>
    `;
    
    const itemPeriod = document.createElement('div');
    itemPeriod.classList.add('experience-period');
    itemPeriod.textContent = period;
    
    itemHeader.appendChild(itemTitle);
    itemHeader.appendChild(itemPeriod);
    
    const itemDescription = document.createElement('div');
    itemDescription.classList.add('experience-description');
    itemDescription.innerHTML = description;
    
    item.appendChild(itemHeader);
    item.appendChild(itemDescription);
    
    return item;
  }

  // 更新後的技能展示區域函數
  function updateSkillsSection() {
    // 創建技能區域標題
    const skillsTitle = document.createElement('h3');
    skillsTitle.classList.add('skills-title');
    skillsTitle.innerHTML = 'Skills <span class="zh-title">技能</span>';
    
    const skillsList = document.createElement('div');
    skillsList.classList.add('skills-list');
    
    // 軟體技能列表
    const softwareSkills = [
      { name: "Adobe Illustrator", level: 90 },
      { name: "Adobe Photoshop", level: 90 },
      { name: "Adobe InDesign", level: 50 },
      { name: "Figma", level: 50 },
      { name: "Procreate", level: 80 },
      { name: "Adobe After Effects", level: 70 },
      { name: "Adobe Premium", level: 50 },
      { name: "Capcut", level: 70 }
    ];
    
    // 專業領域技能列表
    const professionalSkills = [
      { name: "Graphic Design", level: 90 },
      { name: "Copywriting", level: 90 },
      { name: "Photography", level: 70 }
    ];
    
    // 創建軟體技能區域
    const softwareSkillsContainer = createSkillsContainer(softwareSkills);
    
    // 創建專業領域技能區域
    const professionalSkillsContainer = createSkillsContainer(professionalSkills);
    
    // 將所有元素添加到技能列表容器
    skillsList.appendChild(softwareSkillsContainer);
    skillsList.appendChild(professionalSkillsContainer);
    
    // 返回完整的技能區域元素
    const skillsSection = document.createElement('div');
    skillsSection.classList.add('profile-skills');
    skillsSection.appendChild(skillsTitle);
    skillsSection.appendChild(skillsList);
    
    return skillsSection;
  }

  // 創建技能容器的輔助函數
  function createSkillsContainer(skills) {
    const container = document.createElement('div');
    container.classList.add('skills-group');
    
    skills.forEach(skill => {
      const skillItem = document.createElement('div');
      skillItem.classList.add('skill-item');
      
      // 技能名稱元素
      const skillName = document.createElement('div');
      skillName.classList.add('skill-name');
      skillName.textContent = skill.name;
      
      // 技能進度條
      const skillBar = document.createElement('div');
      skillBar.classList.add('skill-bar');
      
      // 技能等級指示器
      const skillLevel = document.createElement('div');
      skillLevel.classList.add('skill-level');
      skillLevel.style.width = `${skill.level}%`;
      
      // 組裝技能項目
      skillBar.appendChild(skillLevel);
      skillItem.appendChild(skillName);
      skillItem.appendChild(skillBar);
      container.appendChild(skillItem);
    });
    
    return container;
  }

  // 顯示訊息表單
  function showMessageForm() {
    const listContainer = overlay.querySelector('.vertical-list-container');
    
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
      const target = this.getAttribute('data-target');
      navigateToPage(target);
    });
  });
  
  // 監聽「訊息」連結點擊
  document.querySelector('.header-right a').addEventListener('click', function(event) {
    event.preventDefault();
    navigateToPage('message');
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