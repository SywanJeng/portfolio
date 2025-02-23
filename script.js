document.addEventListener('DOMContentLoaded', () => {
  // 請確認 assets.json 與此檔案在同一目錄，或調整路徑
  fetch('assets.json')
    .then(response => response.json())
    .then(data => {
      const slider = document.querySelector('.slider');
      // 假設您想依序載入 Layout, Exhibition, Commercial 的作品
      const categories = ['Layout', 'Exhibition', 'Commercial'];
      
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
});