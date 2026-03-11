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

  const container = document.querySelector('.business-body-list');
  const nav = document.getElementById('carouselNav');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  if (!container || !nav || !prevBtn || !nextBtn) {
    return null;
  }

  const positions = ['active', '1', '2', '3', '4', '5'];
  const activeScale = 1.1;
  const inactiveScale = 0.94;
  const shiftDuration = 1;
  const scaleDelay = 1;
  const prevIncomingScaleDelay = 1;
  const prevIncomingScaleDuration = 0;
  const defaultUpwardGapFactor = 0;
  const nextOutgoingUpwardGapFactor = 1.2;
  const defaultSidePushFactor = 0;
  const nextOutgoingSidePushFactor = 2.2;

  let orderedItems = Array.from(container.querySelectorAll('.business-body-list-item'));
  let coordinateSlots = [];
  let isAnimating = false;
  let hasEnteredViewport = false;

  function applyDataOrder() {
    orderedItems.forEach((item, index) => {
      item.setAttribute('data-position', positions[index]);
      item.style.zIndex = index === 0 ? '20' : String(12 - index);
    });

    setItemsIndex(orderedItems.slice(1), '--business-index');

    const activeItem = orderedItems[0];
    if (activeItem) {
      activeItem.appendChild(nav);
    }
  }

  function captureCoordinateSlots() {
    const containerRect = container.getBoundingClientRect();

    coordinateSlots = positions.map((positionKey) => {
      const item = container.querySelector(
        `.business-body-list-item[data-position="${positionKey}"]`
      );

      if (!item) {
        return { x: 0, y: 0, width: 0, height: 0 };
      }

      const rect = item.getBoundingClientRect();
      return {
        x: rect.left - containerRect.left,
        y: rect.top - containerRect.top,
        width: rect.width,
        height: rect.height,
        centerX: rect.left - containerRect.left + rect.width / 2,
        centerY: rect.top - containerRect.top + rect.height / 2
      };
    });

    const maxBottom = Math.max(
      ...coordinateSlots.map((slot) => slot.y + slot.height),
      0
    );

    container.style.position = 'relative';
    container.style.minHeight = `${Math.ceil(maxBottom)}px`;
  }

  function getTargetCoordinates(item, index) {
    const slot = coordinateSlots[index];

    if (!slot) {
      return { x: 0, y: 0 };
    }

    return {
      x: slot.centerX - item.offsetWidth / 2,
      y: slot.centerY - item.offsetHeight / 2
    };
  }

  function activateAbsoluteLayout() {
    orderedItems.forEach((item) => {
      item.style.position = 'absolute';
      item.style.top = '0';
      item.style.left = '0';
      item.style.bottom = 'auto';
      item.style.margin = '0';
    });
  }

  function syncToCoordinates() {
    if (typeof gsap === 'undefined') {
      return;
    }

    orderedItems.forEach((item, index) => {
      const target = getTargetCoordinates(item, index);
      const slot = coordinateSlots[index];

      gsap.set(item, {
        x: target.x,
        y: target.y,
        width: slot ? slot.width : item.offsetWidth,
        height: slot ? slot.height : item.offsetHeight,
        scale: index === 0 ? activeScale : inactiveScale,
        filter: index === 0 ? 'brightness(1.12)' : 'brightness(1)'
      });
    });
  }

  function animateActiveContent() {
    const activeItem = container.querySelector(
      '.business-body-list-item[data-position="active"]'
    );

    if (!activeItem || typeof gsap === 'undefined') {
      return;
    }

    const contentNodes = activeItem.querySelectorAll(
      '.business-body-list-item__num, .business-body-list-item__ttl'
    );

    gsap.fromTo(
      contentNodes,
      {
        y: 10,
        opacity: 0
      },
      {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.06,
        ease: 'power2.out'
      }
    );
  }

  function getTypographyTargets() {
    const activeItem = orderedItems[0];
    const inactiveItem = orderedItems[1] || orderedItems[0];

    const activeNumNode = activeItem?.querySelector('.business-body-list-item__num');
    const activeTtlNode = activeItem?.querySelector('.business-body-list-item__ttl');
    const inactiveNumNode = inactiveItem?.querySelector('.business-body-list-item__num');
    const inactiveTtlNode = inactiveItem?.querySelector('.business-body-list-item__ttl');

    return {
      activeNum: activeNumNode ? window.getComputedStyle(activeNumNode).fontSize : '50px',
      activeTtl: activeTtlNode ? window.getComputedStyle(activeTtlNode).fontSize : '24px',
      inactiveNum: inactiveNumNode
        ? window.getComputedStyle(inactiveNumNode).fontSize
        : '20px',
      inactiveTtl: inactiveTtlNode
        ? window.getComputedStyle(inactiveTtlNode).fontSize
        : '10px'
    };
  }

  function lockCurrentTypography() {
    orderedItems.forEach((item) => {
      const numNode = item.querySelector('.business-body-list-item__num');
      const ttlNode = item.querySelector('.business-body-list-item__ttl');

      if (numNode) {
        numNode.style.fontSize = window.getComputedStyle(numNode).fontSize;
      }

      if (ttlNode) {
        ttlNode.style.fontSize = window.getComputedStyle(ttlNode).fontSize;
      }
    });
  }

  function animateCircularShift(typographyTargets, direction = 'next') {
    if (typeof gsap === 'undefined') {
      syncToCoordinates();
      animateActiveContent();
      return;
    }

    const transitionDuration = direction === 'prev'
      ? Math.max(shiftDuration, prevIncomingScaleDelay + prevIncomingScaleDuration)
      : shiftDuration;

    const timeline = gsap.timeline({
      defaults: {
        duration: transitionDuration,
        ease: 'power2.inOut'
      },
      onComplete: () => {
        syncToCoordinates();

        orderedItems.forEach((item) => {
          const numNode = item.querySelector('.business-body-list-item__num');
          const ttlNode = item.querySelector('.business-body-list-item__ttl');

          if (numNode) {
            numNode.style.fontSize = '';
          }

          if (ttlNode) {
            ttlNode.style.fontSize = '';
          }
        });

        isAnimating = false;
        animateActiveContent();
      }
    });

    const incomingActive = orderedItems[0];
    const delayedDetailNodes = incomingActive
      ? incomingActive.querySelectorAll(
          '.business-body-list-item__txt, .business-body-list-item-btn'
        )
      : [];

    gsap.set(delayedDetailNodes, {
      autoAlpha: 0,
      y: 8
    });

    const outgoingActive = direction === 'next'
      ? orderedItems[orderedItems.length - 1]
      : orderedItems[1];

    const arcItems = new Set([incomingActive, outgoingActive]);

    function addParabolaMotion(item, target, arcStrength = 120) {
      const startX = Number(gsap.getProperty(item, 'x')) || 0;
      const startY = Number(gsap.getProperty(item, 'y')) || 0;

      const midX = (startX + target.x) / 2;
      const isIncoming = item === incomingActive;
      const isNextOutgoing = direction === 'next' && !isIncoming;
      const horizontalGap = Math.abs(target.x - startX);
      const sidePushFactor = isNextOutgoing
        ? nextOutgoingSidePushFactor
        : defaultSidePushFactor;
      const sidePush = horizontalGap * sidePushFactor;
      const controlX = Math.max(startX, target.x) + sidePush;
      const upwardTargetGap = Math.max(0, startY - target.y);
      const upwardGapFactor = isNextOutgoing
        ? nextOutgoingUpwardGapFactor
        : defaultUpwardGapFactor;
      const extraDrop = upwardTargetGap * upwardGapFactor;
      const controlY = Math.max(startY, target.y) + Math.abs(arcStrength) + extraDrop;

      const progress = { t: 0 };

      timeline.to(
        progress,
        {
          t: 1,
          onUpdate: () => {
            const t = progress.t;
            const oneMinusT = 1 - t;

            const nextX =
              oneMinusT * oneMinusT * startX +
              2 * oneMinusT * t * controlX +
              t * t * target.x;

            const nextY =
              oneMinusT * oneMinusT * startY +
              2 * oneMinusT * t * controlY +
              t * t * target.y;

            gsap.set(item, {
              x: nextX,
              y: nextY
            });
          }
        },
        0
      );
    }

    orderedItems.forEach((item, index) => {
      const target = getTargetCoordinates(item, index);
      const slot = coordinateSlots[index];

      if (arcItems.has(item)) {
        addParabolaMotion(item, target, index === 0 ? 1000 : 115);
      } else {
        timeline.to(
          item,
          {
            x: target.x,
            y: target.y
          },
          0
        );
      }

      timeline.to(
        item,
        {
          width: slot ? slot.width : item.offsetWidth,
          height: slot ? slot.height : item.offsetHeight,
          filter: index === 0 ? 'brightness(1.12)' : 'brightness(1)'
        },
        0
      );

      timeline.to(
        item,
        {
          scale: index === 0 ? activeScale : inactiveScale,
          duration:
            direction === 'prev' && item === incomingActive
              ? prevIncomingScaleDuration
              : Math.max(0.2, transitionDuration - scaleDelay)
        },
        direction === 'prev' && item === incomingActive
          ? prevIncomingScaleDelay
          : scaleDelay
      );

      const numNode = item.querySelector('.business-body-list-item__num');
      const ttlNode = item.querySelector('.business-body-list-item__ttl');

      if (numNode) {
        timeline.to(
          numNode,
          {
            fontSize: index === 0 ? typographyTargets.activeNum : typographyTargets.inactiveNum
          },
          0
        );
      }

      if (ttlNode) {
        timeline.to(
          ttlNode,
          {
            fontSize: index === 0 ? typographyTargets.activeTtl : typographyTargets.inactiveTtl
          },
          0
        );
      }
    });

    timeline.to(
      delayedDetailNodes,
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.28,
        ease: 'power2.out'
      },
      transitionDuration * 0.72
    );
  }

  function shiftDataOrder(direction = 'next') {
    if (isAnimating || !orderedItems.length) {
      return;
    }

    isAnimating = true;

    const typographyTargets = getTypographyTargets();

    orderedItems.forEach((item) => {
      const rect = item.getBoundingClientRect();
      item.style.width = `${rect.width}px`;
      item.style.height = `${rect.height}px`;
    });

    lockCurrentTypography();

    if (direction === 'next') {
      const firstItem = orderedItems.shift();
      orderedItems.push(firstItem);
    } else {
      const lastItem = orderedItems.pop();
      orderedItems.unshift(lastItem);
    }

    applyDataOrder();
    animateCircularShift(typographyTargets, direction);
  }

  applyDataOrder();
  captureCoordinateSlots();
  activateAbsoluteLayout();
  syncToCoordinates();

  nextBtn.addEventListener('click', () => shiftDataOrder('next'));
  prevBtn.addEventListener('click', () => shiftDataOrder('prev'));

  return {
    revealAndStart() {
      if (hasEnteredViewport) {
        return;
      }

      hasEnteredViewport = true;

      if (typeof gsap !== 'undefined') {
        gsap.fromTo(orderedItems, { opacity: 0 }, {
          opacity: 1,
          duration: 0.6,
          stagger: 0.06,
          ease: 'power2.out'
        });
      }

      animateActiveContent();
    }
  };
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

  if (businessController) {
    ScrollTrigger.create({
      trigger: '.business-body-list',
      start: 'top 82%',
      once: true,
      onEnter: () => businessController.revealAndStart()
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

  const businessCardNodes = document.querySelectorAll('.business-body-list-item');
  businessCardNodes.forEach((card) => {
    card.addEventListener('mouseenter', () => {
      const baseY = Number(gsap.getProperty(card, 'y')) || 0;

      gsap.fromTo(
        card,
        { y: baseY },
        {
          y: baseY + 10,
          duration: 0.2,
          repeat: 1,
          yoyo: true,
          ease: 'power2.inOut',
          overwrite: 'auto'
        }
      );
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

document.addEventListener('DOMContentLoaded', () => {
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
});