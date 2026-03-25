// Hàm chung: gán index cho các items (nhận selector string hoặc NodeList/Array)
function setItemsIndex(selectorOrItems, indexVariable = '--item-index') {
  let items;

  if (typeof selectorOrItems === 'string') {
    // Nếu là string selector
    items = document.querySelectorAll(selectorOrItems);
  } else {
    // Nếu là NodeList hoặc Array
    items = selectorOrItems;
  }

  items.forEach((item, index) => {
    item.style.setProperty(indexVariable, index);
  });
}

function initBusinessCarousel() {
  setItemsIndex('.company-body-list-item', '--company-index');
}

function initBusinessFieldMobileCarousel() {
  if (typeof Swiper === 'undefined') {
    return;
  }

  const swiperEl = document.querySelector('.bf-swiper');
  if (!swiperEl) {
    return;
  }

  const slidesCount = swiperEl.querySelectorAll('.swiper-slide').length;
  if (slidesCount === 0) {
    return;
  }

  const bfSwiper = new Swiper('.bf-swiper', {
    loop: slidesCount > 1,
    speed: 1000,
    slidesPerView: 1,
    spaceBetween: 20,
    effect: 'fade',
    mousewheel: true,
    fadeEffect: {
      crossFade: true
    },
    navigation: {
      nextEl: '#bf-next',
      prevEl: '#bf-prev',
    },
    on: {
      slideChange: function () {
        const dots = document.querySelectorAll('.bf-sp-dot');
        if (dots.length) {
          dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.realIndex);
          });
        }
      }
    }
  });

  const dots = document.querySelectorAll('.bf-sp-dot');
  if (dots.length) {
    dots.forEach((dot) => {
      dot.addEventListener('click', function() {
        if (bfSwiper) {
          bfSwiper.slideToLoop(Number(this.dataset.index));
        }
      });
    });
  }
}

function animateCloudBackground() {
  if (typeof gsap === 'undefined') {
    return;
  }

  const cloudLayers = document.querySelectorAll('.clouds .cloud');

  cloudLayers.forEach((cloudLayer) => {
    // Remove duplication logic that forced cloud--2 to merge with cloud--1
    // By cloning individually, we preserve the unique parallax, top offsets and CSS filters.
    if (cloudLayer.classList.contains('cloud-clone')) return;
    if (cloudLayer.dataset.initialized) return;
    cloudLayer.dataset.initialized = 'true';

    const wrapper = cloudLayer.closest('.clouds');
    if (!wrapper) return;

    const duration = Number(wrapper.dataset.cloudDuration) || 250;
    const y = Number(wrapper.dataset.cloudY) || 0;
    const directionX = Number(wrapper.dataset.cloudDirectionX) || 1;

    // Create a duplicate for seamless infinite looping
    const duplicate = cloudLayer.cloneNode(true);
    duplicate.classList.add('cloud-clone');
    duplicate.setAttribute('aria-hidden', 'true');
    wrapper.appendChild(duplicate);

    let loopTween;

    const refresh = () => {
      if (loopTween) loopTween.kill();

      const directionX = Number(wrapper.dataset.cloudDirectionX) || 1; // 1 = right
      const directionY = Number(wrapper.dataset.cloudDirectionY) || 1; // 1 = down

      // Tọa độ nối góc hoàn hảo (Corner-to-corner attachment)
      // Nếu mây kéo từ Trái-Trên xuống Phải-Dưới (+X, +Y), 
      // mây dự phòng sẽ nấp sẵn ở góc Trái-Trên (-100%, -100%) để nối đuôi.
      const offsetVal = Number(wrapper.dataset.cloudOffset) || 100;
      const startOffset = -offsetVal;

      gsap.set(cloudLayer, { xPercent: 0, yPercent: 0 });
      gsap.set(duplicate, {
        xPercent: startOffset * directionX,
        yPercent: startOffset * directionY
      });

      const wrapFn = gsap.utils.wrap(-offsetVal, offsetVal);

      loopTween = gsap.to([cloudLayer, duplicate], {
        xPercent: `+=${offsetVal * directionX}`,
        yPercent: `+=${offsetVal * directionY}`,
        duration,
        repeat: -1,
        ease: 'none',
        modifiers: {
          xPercent: (value) => wrapFn(parseFloat(value)),
          yPercent: (value) => wrapFn(parseFloat(value))
        }
      });
    };

    refresh();
    window.addEventListener('resize', refresh);
  });
}

function animateScrollSections(businessController) {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  document.querySelectorAll('.clouds').forEach((wrapper) => {
    const cloudNodes = wrapper.querySelectorAll('.cloud');
    const triggerSection = wrapper.closest('section') || wrapper.parentElement;

    if (!triggerSection || !cloudNodes.length) {
      return;
    }

    const defaultX = 0;
    const defaultY = -14;
    const xPercent = wrapper.dataset.cloudScrollX ? Number(wrapper.dataset.cloudScrollX) : defaultX;
    const yPercent = wrapper.dataset.cloudScrollY ? Number(wrapper.dataset.cloudScrollY) : defaultY;

    gsap.to(cloudNodes, {
      xPercent,
      yPercent,
      ease: 'none',
      scrollTrigger: {
        trigger: triggerSection,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
  });

  gsap.utils.toArray('section').forEach((section) => {
    const header = section.querySelector('.section-header');
    const bodyCandidates = section.querySelectorAll(
      '.concept-body, .company-body, .business-body, .concept-btn'
    );

    if (header) {
      gsap.from(header, {
        y: 48,
        opacity: 0,
        duration: 0.95,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 76%'
        }
      });
    }

    if (bodyCandidates.length) {
      gsap.from(bodyCandidates, {
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: {
          trigger: section,
          start: 'top 68%'
        }
      });
    }
  });

  const companyBodyList = document.querySelector('.company-body-list');
  const companyBodyItems = gsap.utils.toArray('.company-body-list-item');
  if (companyBodyList && companyBodyItems.length) {
    gsap.from(companyBodyItems, {
      scale: 0.74,
      opacity: 0,
      rotate: -7,
      duration: 0.85,
      stagger: 0.16,
      ease: 'back.out(1.6)',
      scrollTrigger: {
        trigger: companyBodyList,
        start: 'top 80%'
      }
    });
  }
}

function addMicroInteractions() {
  if (typeof gsap === 'undefined') {
    return;
  }

  const buttonNodes = document.querySelectorAll('.section__btn');
  buttonNodes.forEach((button) => {
    button.addEventListener('mouseenter', () => {
      gsap.to(button, {
        y: -2,
        scale: 1.02,
        duration: 0.35,
        ease: 'power2.out'
      });
    });

    button.addEventListener('mouseleave', () => {
      gsap.to(button, {
        y: 0,
        scale: 1,
        duration: 0.35,
        ease: 'power2.out'
      });
    });
  });

  const companyCardNodes = document.querySelectorAll('.company-body-list-item');
  companyCardNodes.forEach((card) => {
    card.addEventListener('mouseenter', () => {
      gsap.to(card, {
        scale: 1.02,
        y: -4,
        duration: 0.35,
        ease: 'power2.out'
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        scale: 1,
        y: 0,
        duration: 0.4,
        ease: 'power2.out'
      });
    });
  });
}

function initPageTopAnimation() {
  if (typeof gsap === 'undefined') {
    return;
  }

  const scrollEl = document.querySelector('.scroll');
  if (!scrollEl) {
    return;
  }

  gsap.to(scrollEl, {
    y: -4,
    duration: 2.2,
    ease: 'sine.inOut',
    repeat: -1,
    yoyo: true
  });

  scrollEl.addEventListener('mouseenter', () => {
    gsap.to(scrollEl, {
      scale: 1.05,
      duration: 0.35,
      ease: 'power2.out'
    });
  });

  scrollEl.addEventListener('mouseleave', () => {
    gsap.to(scrollEl, {
      scale: 1,
      duration: 0.35,
      ease: 'power2.out'
    });
  });
}

function initMoonAnimation() {
  if (typeof gsap === 'undefined') {
    return;
  }

  const moonEl = document.querySelector('.moon');
  if (!moonEl) {
    return;
  }

  const orbitState = { angle: 0 };
  const orbitRadiusX = 30;
  const orbitRadiusY = 20;
  const orbitDuration = 22;

  const escapeOffset = { x: 0, y: 0 };
  const ESCAPE_RADIUS = 160;
  const ESCAPE_STRENGTH = 30;

  const applyTransform = () => {
    gsap.set(moonEl, {
      x: Math.cos(orbitState.angle) * orbitRadiusX + escapeOffset.x,
      y: Math.sin(orbitState.angle) * orbitRadiusY + escapeOffset.y
    });
  };

  gsap.to(orbitState, {
    angle: Math.PI * 2,
    duration: orbitDuration,
    ease: 'none',
    repeat: -1,
    onUpdate: applyTransform
  });

  let isInsideCircle = false;

  document.addEventListener('mousemove', (e) => {
    const rect = moonEl.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < ESCAPE_RADIUS && dist > 0 && !isInsideCircle) {
      isInsideCircle = true;
      gsap.killTweensOf(escapeOffset);
      gsap.to(escapeOffset, {
        x: -(dx / dist) * ESCAPE_STRENGTH,
        y: -(dy / dist) * ESCAPE_STRENGTH,
        duration: 0.8,
        ease: 'power3.out',
        onUpdate: applyTransform
      });
    } else if (dist >= ESCAPE_RADIUS && isInsideCircle) {
      isInsideCircle = false;
      gsap.killTweensOf(escapeOffset);
      gsap.to(escapeOffset, {
        x: 0,
        y: 0,
        duration: 1.0,
        ease: 'power2.inOut',
        onUpdate: applyTransform
      });
    }
  });
}

function initMobileMenu() {
  if (typeof gsap === 'undefined') {
    return;
  }

  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mmenuClose = document.getElementById('mmenu-close');

  if (!menuToggle || !mobileMenu) {
    return;
  }

  const mmenuTiles = gsap.utils.toArray('.mmenu-tile');
  let openMenuTimeline = null;
  let isMenuOpen = false;

  gsap.set(mobileMenu, { autoAlpha: 0, pointerEvents: 'none' });

  const toggleMenu = (forceState) => {
    isMenuOpen = typeof forceState === 'boolean' ? forceState : !isMenuOpen;

    if (isMenuOpen) {
      menuToggle.classList.add('is-active');

      gsap.killTweensOf([mobileMenu, ...mmenuTiles]);
      gsap.set(mobileMenu, { autoAlpha: 0, pointerEvents: 'auto' });
      gsap.set(mmenuTiles, { y: 14, opacity: 0 });

      openMenuTimeline = gsap.timeline();
      openMenuTimeline.to(mobileMenu, {
        autoAlpha: 1,
        duration: 0.3,
        ease: 'power2.out'
      });
      openMenuTimeline.to(mmenuTiles, {
        y: 0,
        opacity: 1,
        duration: 0.32,
        stagger: 0.04,
        ease: 'power2.out'
      }, '-=0.1');

      document.body.style.overflow = 'hidden';
      document.body.classList.add('menu-open');
    } else {
      menuToggle.classList.remove('is-active');

      if (openMenuTimeline) {
        openMenuTimeline.kill();
      }

      gsap.killTweensOf([mobileMenu, ...mmenuTiles]);
      gsap.to(mobileMenu, {
        autoAlpha: 0,
        pointerEvents: 'none',
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => {
          gsap.set(mmenuTiles, { clearProps: 'transform,opacity' });
        }
      });

      document.body.style.overflow = '';
      document.body.classList.remove('menu-open');
    }
  };

  menuToggle.addEventListener('click', () => {
    toggleMenu();
  });

  if (mmenuClose) {
    mmenuClose.addEventListener('click', () => {
      toggleMenu(false);
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isMenuOpen) {
      toggleMenu(false);
    }
  });
}

function initFlowSectionCarousel() {
  const flowData = [
    {
      num: '01',
      title: 'お問い合わせ',
      img: 'business-field/img/flow-img01.jpg',
      desc: 'まずはお気軽にご相談ください<br>現状の課題やお悩みをヒアリングし、<br>最適な支援方法を検討します。'
    },
    {
      num: '02',
      title: 'お打ち合わせ',
      img: 'business-field/img/flow-img02.jpg',
      desc: '対面・オンラインにて詳細を伺い、<br>課題の背景や目指したい方向性を<br>丁寧に整理します。'
    },
    {
      num: '03',
      title: '経営課題診断',
      img: 'business-field/img/flow-img03.jpg',
      desc: 'ヒアリング内容を基に、<br>収益構造・業務プロセス・資金状況等<br>を分析し、課題を可視化します。'
    },
    {
      num: '04',
      title: 'ご提案 / お見積もり',
      img: 'business-field/img/flow-img04.jpg',
      desc: '診断結果を踏まえ、<br>最適な支援プランと具体的な改善施策<br>費用をご提案します。'
    },
    {
      num: '05',
      title: 'ご支援開始',
      img: 'business-field/img/flow-img05.jpg',
      desc: 'ご契約後、伴走型での支援をスタート。<br class="u-pc">課題解決に向けて<br>実行フェーズへ進みます。'
    }
  ];

  const spCard = document.getElementById('flow-sp-card');
  const spDots = document.querySelectorAll('#sp-nav .flow-sp-dot');

  // PC Elements
  const pcCard = document.getElementById('flow-pc-card');
  const pcInner = pcCard?.querySelector('.flow-pc-card-inner');
  const pcNum = document.getElementById('pc-num');
  const pcTtl = document.getElementById('pc-ttl');
  const pcImg = document.getElementById('pc-img');
  const pcText = document.getElementById('pc-text');
  const pcNavItems = document.querySelectorAll('#pc-sidebar .flow-pc-nav-item');

  const hasPcFlow = pcInner && pcNum && pcTtl && pcImg && pcText && pcNavItems.length;

  // Initialize SP Swiper dynamically using flowData
  if (spCard && typeof Swiper !== 'undefined') {
    const slidesHtml = flowData.map(item => `
      <div class="swiper-slide">
        <div class="flow-card-inner">
          <div class="flow-card-head">
              <span class="flow-card-head__icon">
                  <img src="business-field/img/logo-icon02.png" alt="" width="61" height="64">
              </span>
              <span class="flow-card-head__num">${item.num}</span>
              <h3 class="flow-card-head__ttl">${item.title}</h3>
          </div>
          <div class="flow-card-img-wrap">
              <img class="flow-card-img" src="${item.img}" alt="${item.title}">
          </div>
          <div class="flow-card-desc">
              ${item.desc.split('\n').map(line => `<p>${line}</p>`).join('')}
          </div>
          <a href="#" class="flow-cta section__btn">今すぐ相談する</a>
        </div>
      </div>
    `).join('');

    spCard.innerHTML = `
      <div style="position: relative; max-width: 250px; margin: 0 auto;">
        <div class="swiper flow-swiper">
          <div class="swiper-wrapper">
            ${slidesHtml}
          </div>
        </div>
        <button class="flow-arrow flow-arrow--prev" id="sp-prev" aria-label="前へ"></button>
        <button class="flow-arrow flow-arrow--next" id="sp-next" aria-label="次へ"></button>
      </div>
    `;

    const spPrev = document.getElementById('sp-prev');

    const flowSwiper = new Swiper('.flow-swiper', {
      loop: false,
      speed: 600,
      effect: 'fade',
      fadeEffect: { crossFade: true },
      mousewheel: {
        releaseOnEdges: true
      },
      navigation: {
        nextEl: '#sp-next',
        prevEl: '#sp-prev',
      },
      on: {
        init: function () {
          if (this.isBeginning && spPrev) spPrev.style.display = 'none';
        },
        slideChange: function () {
          const index = this.activeIndex;
          spDots.forEach((dot, i) => dot.classList.toggle('active', i === index));

          if (spPrev) {
            spPrev.style.display = this.isBeginning ? 'none' : '';
          }
        }
      }
    });

    spDots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        flowSwiper.slideTo(idx);
      });
    });
  }

  // Initialize PC Flow
  if (hasPcFlow) {
    let pcIndex = 0;
    const updatePcFlow = (nextIndex) => {
      pcInner.style.opacity = '0';
      pcInner.style.transform = 'translateY(-10px)';

      window.setTimeout(() => {
        pcIndex = ((nextIndex % flowData.length) + flowData.length) % flowData.length;
        const item = flowData[pcIndex];

        pcNum.textContent = item.num;
        pcTtl.textContent = item.title;
        pcImg.src = item.img;
        pcImg.alt = item.title;
        pcText.innerHTML = `<p>${item.desc.replace(/\n/g, '<br>')}</p><a href="#" class="flow-pc-cta section__btn">今すぐ相談する</a>`;

        pcNavItems.forEach((node, index) => {
          node.classList.toggle('active', index === pcIndex);
        });

        pcInner.style.transition = 'none';
        pcInner.style.transform = 'translateY(14px)';

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            pcInner.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            pcInner.style.opacity = '1';
            pcInner.style.transform = 'translateY(0)';
          });
        });
      }, 260);
    };

    pcNavItems.forEach((item) => {
      item.addEventListener('click', () => {
        updatePcFlow(Number(item.dataset.index));
      });
    });
  }
}

function initFlowCloudParallax() {
  if (typeof gsap === 'undefined') {
    return;
  }

  const cloudDecor = document.querySelector('.flow-cloud-decor');
  if (!cloudDecor) {
    return;
  }

  // Animation mây rơi liên tục, vô hạn
  gsap.to(cloudDecor, {
    backgroundPosition: '0 4000px', // Trôi dần xuống
    duration: 100,                  // Tốc độ trôi chậm (100s)
    repeat: -1,                     // Lặp lại vô hạn
    ease: 'none'                    // Chuyển động đều vô tận
  });
}

function initStickyHeader() {
  const header = document.querySelector('.header');
  const banner = document.querySelector('.banner');

  if (!header || !banner) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      // Khi người dùng cuộn vượt qua KẼO (ra khỏi vùng nhìn thấy của) toàn bộ banner
      if (!entry.isIntersecting) {
        header.classList.add('is-fixed');
      } else {
        header.classList.remove('is-fixed');
      }
    },
    { threshold: 0 } // Trigger immediately when banner fully exits or touches viewport
  );

  observer.observe(banner);
}

function initPageScripts() {
  if (window.__dropstarScriptsInitialized) {
    return;
  }

  window.__dropstarScriptsInitialized = true;

  const businessController = initBusinessCarousel();
  initBusinessFieldMobileCarousel();
  initFlowSectionCarousel();
  initFlowCloudParallax();
  initMobileMenu();
  animateCloudBackground();
  animateScrollSections(businessController);
  addMicroInteractions();
  initPageTopAnimation();
  initMoonAnimation();
  initStickyHeader();
}

function bootstrapPageScripts() {
  const includesPromise = window.__includesReadyPromise;

  if (includesPromise && typeof includesPromise.then === 'function') {
    includesPromise.finally(() => {
      initPageScripts();
    });
    return;
  }

  initPageScripts();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapPageScripts);
} else {
  bootstrapPageScripts();
}