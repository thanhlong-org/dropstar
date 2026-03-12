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

function animateCloudBackground() {
  if (typeof gsap === 'undefined') {
    return;
  }

  const loopPairs = [
    {
      primary: document.querySelector('.concept-cloud--1'),
      duplicate: document.querySelector('.concept-cloud--2'),
      duration: 250,
      y: 0,
      directionX: 1
    },
    {
      primary: document.querySelector('.company-cloud--1'),
      duplicate: document.querySelector('.company-cloud--2'),
      duration: 250,
      y: 0,
      directionX: -1
    }
  ];

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

  gsap.to('.concept-cloud--1, .concept-cloud--2', {
    yPercent: -14,
    ease: 'none',
    scrollTrigger: {
      trigger: '.concept',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true
    }
  });

  gsap.to('.company-cloud--1, .company-cloud--2', {
    xPercent: -8,
    yPercent: -10,
    ease: 'none',
    scrollTrigger: {
      trigger: '.company',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true
    }
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

  gsap.from('.company-body-list-item', {
    scale: 0.74,
    opacity: 0,
    rotate: -7,
    duration: 0.85,
    stagger: 0.16,
    ease: 'back.out(1.6)',
    scrollTrigger: {
      trigger: '.company-body-list',
      start: 'top 80%'
    }
  });
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

  gsap.to(orbitState, {
    angle: Math.PI * 2,
    duration: orbitDuration,
    ease: 'none',
    repeat: -1,
    onUpdate: () => {
      const angle = orbitState.angle;

      gsap.set(moonEl, {
        x: Math.cos(angle) * orbitRadiusX,
        y: Math.sin(angle) * orbitRadiusY
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

// Cosmic Slider Logic
const initCosmicSlider = () => {
  const slider = document.getElementById('cosmic-slider');
  const items = gsap.utils.toArray('.slider-item');
  const nextBtns = gsap.utils.toArray('.nav-arrow.next');
  const prevBtns = gsap.utils.toArray('.nav-arrow.prev');

  let currentIndex = 0;
  const totalItems = items.length;

  // Define 6 fixed "Slots" on the ellipse
  // Slot 0 is Active (Bottom)
  // Slots 1-5 are distributed on the Top Arc (Left to Right)
  // We adjust angles to match the slanted flow
  const slotAngles = [
    -0.1,           // Slot 0: Active (Bottom-Center)
    Math.PI + 0.9,  // Slot 1: Item 2 (Lowest Inactive, Left)
    Math.PI + 0.4,  // Slot 2: Item 3
    Math.PI,        // Slot 3: Item 4
    Math.PI - 0.4,  // Slot 4: Item 5
    Math.PI - 1   // Slot 5: Item 6 (Highest Inactive, Right)
  ];

  const getRadii = () => {
    // Follow the real slider width (already constrained by container/max-width)
    // so the ellipse always scales with layout instead of viewport size.
    const wrapperWidth = slider?.clientWidth || 0;
    const baseWidth = wrapperWidth > 0 ? wrapperWidth : window.innerWidth;

    return {
      x: window.innerWidth >= 768 ? baseWidth * 0.5 : baseWidth * 0.4,
      y: window.innerWidth > 768 ? 220 : 140
    };
  };

  let radii = getRadii();
  const tilt = -0.25; // Tilt angle in radians (approx -15 degrees)

  // Initialize each item with its starting angle
  items.forEach((item, i) => {
    item._gsapAngle = slotAngles[i];
  });

  const applyPosition = (item, angle, isActive) => {
    // Standard elliptical coordinates
    const rawX = Math.sin(angle) * radii.x;
    const rawY = Math.cos(angle) * radii.y;

    // Apply rotation to tilt the ellipse
    const x = rawX * Math.cos(tilt) - rawY * Math.sin(tilt);
    const y = rawX * Math.sin(tilt) + rawY * Math.cos(tilt);

    // normY: 0 at top, 1 at bottom (based on rotated Y)
    // We use a simplified normY for visual scaling
    const normY = (rawY + radii.y) / (2 * radii.y);

    gsap.set(item, {
      x: x,
      y: y
    });
  };

  const updateSlider = (isStepMove = false) => {
    items.forEach((item, i) => {
      let slotIdx = (i - currentIndex + totalItems) % totalItems;
      let targetAngle = slotAngles[slotIdx];
      const isActive = i === currentIndex;

      if (isStepMove) {
        let currentAngle = item._gsapAngle;
        let delta = targetAngle - currentAngle;

        while (delta > Math.PI) delta -= Math.PI * 2;
        while (delta < -Math.PI) delta += Math.PI * 2;

        gsap.to(item, {
          _gsapAngle: currentAngle + delta,
          duration: 1.2,
          ease: "power3.inOut",
          onUpdate: function() {
            applyPosition(item, this.targets()[0]._gsapAngle, isActive);
          },
          onStart: () => {
            if (isActive) item.classList.add('active');
            else item.classList.remove('active');
          }
        });
      } else {
        item._gsapAngle = targetAngle;
        applyPosition(item, targetAngle, isActive);
        if (isActive) item.classList.add('active');
        else item.classList.remove('active');
      }
    });
  };

  const next = () => {
    currentIndex = (currentIndex + 1) % totalItems;
    updateSlider(true);
  };

  const prev = () => {
    currentIndex = (currentIndex - 1 + totalItems) % totalItems;
    updateSlider(true);
  };

  // Event Listeners
  nextBtns.forEach(btn => btn.addEventListener('click', (e) => {
    e.stopPropagation();
    next();
  }));

  prevBtns.forEach(btn => btn.addEventListener('click', (e) => {
    e.stopPropagation();
    prev();
  }));

  items.forEach((item, i) => {
    item.addEventListener('click', () => {
      if (i !== currentIndex) {
        const diff = Math.abs(i - currentIndex);
        const isAdjacent = diff === 1 || diff === totalItems - 1;

        currentIndex = i;
        // Only use orbital animation if adjacent, otherwise "swap" (direct move)
        updateSlider(isAdjacent);
      }
    });
  });

  // Initial position
  updateSlider(false);

  window.addEventListener('resize', () => {
    radii = getRadii();
    updateSlider(false);
  });
};

function initPageScripts() {
  if (window.__dropstarScriptsInitialized) {
    return;
  }

  window.__dropstarScriptsInitialized = true;

  const businessController = initBusinessCarousel();
  initMobileMenu();
  animateCloudBackground();
  animateScrollSections(businessController);
  addMicroInteractions();
  initPageTopAnimation();
  initMoonAnimation();
  if (document.getElementById('cosmic-slider')) {
    initCosmicSlider();
  }
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