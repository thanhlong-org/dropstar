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
  const circle = document.getElementById('bf-main-circle');
  const prevButton = document.getElementById('bf-prev');
  const nextButton = document.getElementById('bf-next');
  const numberElement = document.getElementById('bf-num');
  const titleElement = document.getElementById('bf-ttl');
  const dots = document.querySelectorAll('.bf-sp-dot');

  if (!circle || !prevButton || !nextButton || !numberElement || !titleElement) {
    return;
  }

  const businessFieldItems = [
    { num: '01', ttl: '業務改善 / 効率化支援', bg: 'bf-bg--01' },
    { num: '02', ttl: '資金調達 /資金繰計画支援', bg: 'bf-bg--02' },
    { num: '03', ttl: '国内・海外 不動産購入支援', bg: 'bf-bg--03' },
    { num: '04', ttl: 'コスト削減支援', bg: 'bf-bg--04' },
    { num: '05', ttl: '生命・損害 保険の最適化', bg: 'bf-bg--05' },
    { num: '06', ttl: '投資 / 資産運用支援', bg: 'bf-bg--06' }
  ];

  let currentIndex = 0;

  const goToBusinessField = (nextIndex) => {
    const previousItem = businessFieldItems[currentIndex];
    circle.classList.add('fade');

    window.setTimeout(() => {
      circle.classList.remove(previousItem.bg);
      currentIndex = ((nextIndex % businessFieldItems.length) + businessFieldItems.length) % businessFieldItems.length;

      const nextItem = businessFieldItems[currentIndex];
      numberElement.textContent = nextItem.num;
      titleElement.textContent = nextItem.ttl;
      circle.classList.add(nextItem.bg);
      if (dots.length) {
        dots.forEach((dot, index) => {
          dot.classList.toggle('active', index === currentIndex);
        });
      }
      circle.classList.remove('fade');
    }, 220);
  };

  prevButton.addEventListener('click', () => {
    goToBusinessField(currentIndex - 1);
  });

  nextButton.addEventListener('click', () => {
    goToBusinessField(currentIndex + 1);
  });

  if (dots.length) {
    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        goToBusinessField(Number(dot.dataset.index));
      });
    });
  }
}

function animateCloudBackground() {
  if (typeof gsap === 'undefined') {
    return;
  }

  const wrappers = document.querySelectorAll('.clouds');
  const loopPairs = Array.from(wrappers).map((wrapper) => {
    return {
      primary: wrapper.querySelector('.cloud--1'),
      duplicate: wrapper.querySelector('.cloud--2'),
      duration: Number(wrapper.dataset.cloudDuration) || 250,
      y: Number(wrapper.dataset.cloudY) || 0,
      directionX: Number(wrapper.dataset.cloudDirectionX) || 1
    };
  });

  const setupCloudLoop = ({ primary, duplicate, duration, y, directionX = 1 }) => {
    if (!primary || !duplicate) {
      return;
    }

    const primaryStyle = window.getComputedStyle(primary);

    duplicate.style.top = primaryStyle.top;
    duplicate.style.opacity = primaryStyle.opacity;
    duplicate.style.filter = primaryStyle.filter;
    duplicate.style.backgroundPosition = primaryStyle.backgroundPosition;
    duplicate.style.backgroundSize = primaryStyle.backgroundSize;

    let loopTween;

    const refresh = () => {
      if (loopTween) {
        loopTween.kill();
      }

      const travelDistance = primary.offsetWidth;

      if (!travelDistance) {
        return;
      }

      const shiftX = travelDistance * (directionX >= 0 ? 1 : -1);
      const shiftY = primary.offsetHeight;
      const wrapX = gsap.utils.wrap(-Math.abs(shiftX), Math.abs(shiftX));
      const minY = y - Math.abs(shiftY);
      const maxY = y + Math.abs(shiftY);
      const wrapY = gsap.utils.wrap(minY, maxY);

      gsap.set([primary, duplicate], {
        xPercent: 0,
        x: (index) => index * -shiftX,
        y: (index) => y + index * -shiftY
      });

      loopTween = gsap.to([primary, duplicate], {
        x: `+=${shiftX}`,
        y: shiftY ? `+=${shiftY}` : undefined,
        duration,
        repeat: -1,
        ease: 'none',
        modifiers: {
          x: gsap.utils.unitize((value) => {
            return wrapX(parseFloat(value));
          }),
          y: gsap.utils.unitize((value) => {
            return wrapY(parseFloat(value));
          })
        }
      });
    };

    refresh();
    window.addEventListener('resize', refresh);
  };

  loopPairs.forEach(setupCloudLoop);
}

function animateScrollSections(businessController) {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  document.querySelectorAll('.clouds').forEach((wrapper) => {
    const cloudNodes = wrapper.querySelectorAll('.cloud--1, .cloud--2');
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
  const menuFooter = document.getElementById('menu-footer');

  if (!menuToggle || !mobileMenu || !menuFooter) {
    return;
  }

  const menuLinks = gsap.utils.toArray('.menu-link');
  let openMenuTimeline = null;
  let isMenuOpen = false;

  gsap.set(mobileMenu, { autoAlpha: 0, pointerEvents: 'none' });

  const toggleMenu = (forceState) => {
    isMenuOpen = typeof forceState === 'boolean' ? forceState : !isMenuOpen;

    if (isMenuOpen) {
      menuToggle.classList.add('is-active');

      gsap.killTweensOf([mobileMenu, ...menuLinks, menuFooter]);
      gsap.set(mobileMenu, { autoAlpha: 0, pointerEvents: 'auto' });
      gsap.set(menuLinks, { y: 20, opacity: 0 });
      gsap.set(menuFooter, { y: 20, opacity: 0 });

      openMenuTimeline = gsap.timeline();
      openMenuTimeline.to(mobileMenu, {
        autoAlpha: 1,
        duration: 0.35,
        ease: 'power2.out'
      });
      openMenuTimeline.to(menuLinks, {
        y: 0,
        opacity: 1,
        duration: 0.4,
        stagger: 0.08,
        ease: 'power2.out'
      }, '-=0.15');
      openMenuTimeline.to(menuFooter, {
        y: 0,
        opacity: 1,
        duration: 0.35,
        ease: 'power2.out'
      }, '-=0.18');

      document.body.style.overflow = 'hidden';
    } else {
      menuToggle.classList.remove('is-active');

      if (openMenuTimeline) {
        openMenuTimeline.kill();
      }

      gsap.killTweensOf([mobileMenu, ...menuLinks, menuFooter]);
      gsap.to(mobileMenu, {
        autoAlpha: 0,
        pointerEvents: 'none',
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          gsap.set([menuLinks, menuFooter], { clearProps: 'transform,opacity' });
        }
      });

      document.body.style.overflow = '';
    }
  };

  menuToggle.addEventListener('click', () => {
    toggleMenu();
  });

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    const targetId = anchor.getAttribute('href');
    if (!targetId || targetId === '#') {
      return;
    }

    const targetElement = document.querySelector(targetId);
    if (!targetElement) {
      return;
    }

    anchor.addEventListener('click', (event) => {
      event.preventDefault();

      if (isMenuOpen) {
        toggleMenu(false);
      }

      const headerOffset = 80;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    });
  });

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
      img: 'business-field/img/img-03.png',
      desc: 'まずはお気軽にご相談ください\n現状の課題やお悩みをヒアリングし、\n最適な支援方法を検討します。'
    },
    {
      num: '02',
      title: 'お打ち合わせ',
      img: 'business-field/img/img-03.png',
      desc: '詳しいヒアリングを行い、\n課題の本質を丁寧に整理します。\n何でもお話しください。'
    },
    {
      num: '03',
      title: '経営課題診断',
      img: 'business-field/img/img-03.png',
      desc: '現状を分析し、優先すべき課題を\n明確にします。的確な診断で\n本質に迫ります。'
    },
    {
      num: '04',
      title: 'ご提案/お見積り',
      img: 'business-field/img/img-03.png',
      desc: '課題解決のための最適なプランを\nご提案いたします。貴社に合わせた\nオーダーメイドの支援策です。'
    },
    {
      num: '05',
      title: 'ご支援開始',
      img: 'business-field/img/img-03.png',
      desc: '提案したプランの実行を\n伴走支援します。\n現場に寄り添い、共に進めます。'
    }
  ];

  const spCard = document.getElementById('flow-sp-card');
  const spInner = spCard?.querySelector('.flow-card-inner');
  const spNum = document.getElementById('sp-num');
  const spTtl = document.getElementById('sp-ttl');
  const spImg = document.getElementById('sp-img');
  const spDesc = document.getElementById('sp-desc');
  const spPrev = document.getElementById('sp-prev');
  const spNext = document.getElementById('sp-next');
  const spDots = document.querySelectorAll('#sp-nav .flow-sp-dot');

  const pcCard = document.getElementById('flow-pc-card');
  const pcInner = pcCard?.querySelector('.flow-pc-card-inner');
  const pcNum = document.getElementById('pc-num');
  const pcTtl = document.getElementById('pc-ttl');
  const pcImg = document.getElementById('pc-img');
  const pcText = document.getElementById('pc-text');
  const pcNavItems = document.querySelectorAll('#pc-sidebar .flow-pc-nav-item');

  const hasSpFlow = spInner && spNum && spTtl && spImg && spDesc && spPrev && spNext && spDots.length;
  const hasPcFlow = pcInner && pcNum && pcTtl && pcImg && pcText && pcNavItems.length;

  if (!hasSpFlow && !hasPcFlow) {
    return;
  }

  let spIndex = 0;
  let pcIndex = 0;

  const updateSpFlow = (nextIndex) => {
    if (!hasSpFlow) {
      return;
    }

    spInner.style.opacity = '0';
    spInner.style.transform = 'translateY(-12px)';

    window.setTimeout(() => {
      spIndex = ((nextIndex % flowData.length) + flowData.length) % flowData.length;
      const item = flowData[spIndex];

      spNum.textContent = item.num;
      spTtl.textContent = item.title;
      spImg.src = item.img;
      spImg.alt = item.title;
      spDesc.innerHTML = item.desc.split('\n').map((line) => `<p>${line}</p>`).join('');

      spDots.forEach((dot, index) => {
        dot.classList.toggle('active', index === spIndex);
      });

      spInner.style.transition = 'none';
      spInner.style.transform = 'translateY(16px)';

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          spInner.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
          spInner.style.opacity = '1';
          spInner.style.transform = 'translateY(0)';
        });
      });
    }, 280);
  };

  const updatePcFlow = (nextIndex) => {
    if (!hasPcFlow) {
      return;
    }

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

  if (hasSpFlow) {
    spPrev.addEventListener('click', () => {
      updateSpFlow(spIndex - 1);
    });

    spNext.addEventListener('click', () => {
      updateSpFlow(spIndex + 1);
    });

    spDots.forEach((dot) => {
      dot.addEventListener('click', () => {
        updateSpFlow(Number(dot.dataset.index));
      });
    });
  }

  if (hasPcFlow) {
    pcNavItems.forEach((item) => {
      item.addEventListener('click', () => {
        updatePcFlow(Number(item.dataset.index));
      });
    });
  }
}

function initPageScripts() {
  if (window.__dropstarScriptsInitialized) {
    return;
  }

  window.__dropstarScriptsInitialized = true;

  const businessController = initBusinessCarousel();
  initBusinessFieldMobileCarousel();
  initFlowSectionCarousel();
  initMobileMenu();
  animateCloudBackground();
  animateScrollSections(businessController);
  addMicroInteractions();
  initPageTopAnimation();
  initMoonAnimation();
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