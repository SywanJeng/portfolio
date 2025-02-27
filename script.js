document.addEventListener('DOMContentLoaded', () => {
  let assetsData = {}; // 儲存 assets.json 資料

  // 先載入 assets.json
  fetch('assets.json')
    .then(response => response.json())
    .then(data => {
      assetsData = data; // 存到變數
      generateSlides(data); // 生成作品輪播
    })
    .catch(error => console.error('Error loading assets:', error));

  function generateSlides(data) {
    const slider = document.querySelector('.slider');
    let slideCounter = 0;

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
          const img = document.createElement('img');
          img.src = 'images/' + item.images[0];
          img.alt = item.title;
          img.setAttribute('loading', 'lazy');
          imagesContainer.appendChild(img);
          slide.appendChild(imagesContainer);
        }

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

    const defaultSlide = slider.querySelectorAll('.slide')[3];
    if (defaultSlide) {
      defaultSlide.classList.add('enlarged');
      defaultSlide.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }

  const overlay = document.getElementById('overlay-content');
  const contents = document.querySelectorAll('.content');

  function showContent(targetId, updateUrl = true) {
    overlay.classList.add('active');
    contents.forEach(content => content.classList.remove('active'));

    if (assetsData[targetId]) {
      const categoryData = assetsData[targetId][0]; // 取第一筆資料
      const contentElement = document.getElementById(targetId);

      if (contentElement) {
        contentElement.classList.add('active');
        contentElement.innerHTML = `
          <h2>${categoryData.title}</h2>
          <p>${categoryData.summary}</p>
          <img src="images/${categoryData.images[0]}" alt="${categoryData.title}" loading="lazy">
        `;
      }
    }

    if (updateUrl) {
      history.pushState(null, null, `#${targetId}`);
    }
  }

  document.querySelectorAll('.header-center a').forEach(link => {
    link.addEventListener('click', function(event) {
      event.preventDefault();
      const targetId = this.getAttribute('data-target');
      showContent(targetId);
    });
  });

  window.addEventListener('popstate', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      showContent(hash, false);
    } else {
      overlay.classList.remove('active');
    }
  });

  const initialHash = window.location.hash.replace('#', '');
  if (initialHash) {
    showContent(initialHash, false);
  }

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
