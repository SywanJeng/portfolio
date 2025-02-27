document.addEventListener('DOMContentLoaded', () => {
  let projectData = {}; // 儲存 JSON 內容

  // 讀取 JSON
  fetch('assets.json')
    .then(response => {
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      return response.json();
    })
    .then(data => {
      projectData = data;
      loadSlider(projectData);
    });

  const overlay = document.getElementById('overlay-content');
  const overlayInner = document.getElementById('overlay-inner');
  const navLinks = document.querySelectorAll('.header-center a');

  function loadSlider(data) {
    const slider = document.querySelector('.slider');
    Object.keys(data).forEach(category => {
      data[category].forEach(item => {
        const slide = document.createElement('div');
        slide.classList.add('slide');

        // 作品資訊
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

        // 圖片（讀取第一張）
        if (item.images && item.images.length > 0) {
          const img = document.createElement('img');
          img.src = 'images/' + item.images[0];
          img.alt = item.title;
          img.setAttribute('loading', 'lazy');
          slide.appendChild(img);
        }

        // 滑鼠進入與離開效果
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
              if (defaultSlide) defaultSlide.classList.add('enlarged');
            }
          }, 100);
        });

        slider.appendChild(slide);
      });
    });

    // 設定預設第四張 slide 放大
    const defaultSlide = slider.querySelectorAll('.slide')[3];
    if (defaultSlide) {
      defaultSlide.classList.add('enlarged');
      defaultSlide.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }

  function showContent(category) {
    overlay.style.display = "block";
    setTimeout(() => overlay.classList.add("active"), 10);
    overlayInner.innerHTML = '';

    // 設定大標題
    const overlayTitle = document.createElement('h1');
    overlayTitle.textContent = category.toUpperCase();
    overlayInner.appendChild(overlayTitle);

    // 建立列表容器
    const overlayList = document.createElement('div');
    overlayList.id = 'overlay-list';
    overlayInner.appendChild(overlayList);

    if (projectData[category]) {
      projectData[category].forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('overlay-item');
        itemDiv.innerHTML = `
          <h2>${item.title}</h2>
          <p class="summary">${item.summary}</p>
          <img src="images/${item.images[0]}" class="overlay-image" alt="${item.title}">
        `;
        overlayList.appendChild(itemDiv);
      });
    } else {
      overlayList.innerHTML = '<p>沒有找到對應的內容。</p>';
    }
    history.pushState(null, null, `#${category}`);
  }

  // 點擊導覽按鈕展開內容
  navLinks.forEach(link => {
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
      showContent(hash);
    } else {
      overlay.classList.remove('active');
    }
  });

  // 頁面載入時，檢查網址的 hash，若有則展開對應內容
  const initialHash = window.location.hash.replace('#', '');
  if (initialHash) {
    showContent(initialHash);
  }

  // 調整 .logo 內的文字大小
  function adjustResponsiveText() {
    const container = document.querySelector('.logo');
    if (!container) return;
    const textElement = container.querySelector('p');
    if (!textElement) return;

    const maxFontSize = 288;
    let fontSize = maxFontSize;

    textElement.style.fontSize = fontSize + 'px';

    while (textElement.scrollWidth > container.clientWidth && fontSize > 10) {
      fontSize -= 1;
      textElement.style.fontSize = fontSize + 'px';
    }

    while (textElement.scrollWidth < container.clientWidth && fontSize < maxFontSize) {
      fontSize += 1;
      textElement.style.fontSize = fontSize + 'px';
      if (textElement.scrollWidth > container.clientWidth) {
        fontSize -= 1;
        textElement.style.fontSize = fontSize + 'px';
        break;
      }
    }
  }

  // 初次調整，並監聽 resize 事件
  adjustResponsiveText();
  window.addEventListener('resize', adjustResponsiveText);
});
