document.addEventListener('DOMContentLoaded', () => {
  // 請確認 assets.json 與此檔案在同一目錄，或調整路徑
  fetch('assets.json')
    .then(response => response.json())
    .then(data => {
      const slider = document.querySelector('.slider');
      // 作品分類
      const categories = ['Layout', 'Exhibition', 'Commercial', 'Photography', 'AboutMe'];

      categories.forEach(category => {
        if (data[category]) {
          data[category].forEach(item => {
            // 建立 slide 容器
            const slide = document.createElement('div');
            slide.classList.add('slide');

            // 建立作品資訊區塊
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

            // 將資訊區塊加入 slide
            slide.appendChild(workInfo);

            // 建立圖片
            const img = document.createElement('img');
            img.src = item.src;
            img.alt = item.title;
            // 透過 JavaScript 自動加入 lazy-loading 屬性
            img.setAttribute('loading', 'lazy');

            slide.appendChild(img);
            // 將 slide 加入 slider
            slider.appendChild(slide);
          });
        }
      });
    })
    .catch(error => console.error('Error loading assets:', error));

  // 另外，若頁面上有其他圖片，也可自動設定 lazy-loading 屬性：
  document.querySelectorAll('img').forEach(img => {
    if (!img.hasAttribute('loading')) {
      img.setAttribute('loading', 'lazy');
    }
  });

  /* --------------------
      7. 展開內容區域 (修正並更新 Photography & AboutMe)
  -------------------- */
  const links = document.querySelectorAll('.header-center a');
  const overlay = document.getElementById('overlay-content');
  const contents = document.querySelectorAll('.content');

  links.forEach(link => {
    link.addEventListener('click', function(event) {
      event.preventDefault();
      const targetId = this.getAttribute('data-target');

      // 顯示 overlay
      overlay.classList.add('active');

      // 隱藏所有內容，僅顯示點擊的內容
      contents.forEach(content => {
        content.classList.remove('active');
        if (content.id === targetId) {
          content.classList.add('active');
        }
      });

      // 監聽滾動事件，讓 overlay 蓋住 header
      window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
          overlay.classList.add('scroll-active');
        } else {
          overlay.classList.remove('scroll-active');
        }
      });
    });
  });
});
