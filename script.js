// 為 header 中間與右側所有連結加上點擊事件
document.querySelectorAll('.header-center a, .header-right a').forEach(link => {
    link.addEventListener('click', function(e) {
      // 先移除所有連結的 active 類別
      document.querySelectorAll('.header-center a, .header-right a').forEach(el => {
        el.classList.remove('active');
      });
      // 為被點擊的連結加上 active 類別
      this.classList.add('active');
    });
  });
  