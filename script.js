// script.js
document.querySelectorAll('.header-center a, .header-right a').forEach(link => {
  link.addEventListener('click', function(e) {
    // 移除所有連結的 active 類別
    document.querySelectorAll('.header-center a, .header-right a').forEach(el => {
      el.classList.remove('active');
    });
    // 為點擊的連結加上 active 類別
    this.classList.add('active');
  });
});
