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
  const shiftDuration = 0.9;

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

  function animateCircularShift(typographyTargets) {
    if (typeof gsap === 'undefined') {
      syncToCoordinates();
      animateActiveContent();
      return;
    }

    const timeline = gsap.timeline({
      defaults: {
        duration: shiftDuration,
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

    orderedItems.forEach((item, index) => {
      const target = getTargetCoordinates(item, index);
      const slot = coordinateSlots[index];

      timeline.to(
        item,
        {
          x: target.x,
          y: target.y,
          width: slot ? slot.width : item.offsetWidth,
          height: slot ? slot.height : item.offsetHeight,
          scale: index === 0 ? activeScale : inactiveScale,
          filter: index === 0 ? 'brightness(1.12)' : 'brightness(1)'
        },
        0
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
      shiftDuration * 0.72
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
    animateCircularShift(typographyTargets);
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

  const cloudMotionConfig = {
    duration: 10,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
  };

  const cloudLayers = [
    {
      node: document.querySelector('.concept-cloud--1'),
      from: { xPercent: -2, yPercent: 0 },
      to: { xPercent: 10, yPercent: -2 }
    },
    {
      node: document.querySelector('.concept-cloud--2'),
      from: { xPercent: 2, yPercent: 0 },
      to: { xPercent: -9, yPercent: 1.8 }
    },
    {
      node: document.querySelector('.company-cloud--1'),
      from: { xPercent: 7, yPercent: -7, y: -50 },
      to: { xPercent: -7, yPercent: 7, y: -50 }
    },
    {
      node: document.querySelector('.company-cloud--2'),
      from: { xPercent: 10, yPercent: -10, y: -50 },
      to: { xPercent: -6, yPercent: 6, y: -50 }
    }
  ];

  cloudLayers.forEach((layer) => {
    if (!layer.node) {
      return;
    }

    gsap.set(layer.node, layer.from);
    gsap.to(layer.node, {
      ...layer.to,
      ...cloudMotionConfig
    });
  });
}

function animateScrollSections(businessController) {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  gsap.to('.concept-cloud--1', {
    yPercent: -14,
    ease: 'none',
    scrollTrigger: {
      trigger: '.concept',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true
    }
  });

  gsap.to('.concept-cloud--2', {
    yPercent: 14,
    ease: 'none',
    scrollTrigger: {
      trigger: '.concept',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true
    }
  });

  gsap.to('.company-cloud--1', {
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

  gsap.to('.company-cloud--2', {
    xPercent: -10,
    yPercent: 12,
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

document.addEventListener('DOMContentLoaded', () => {
  const businessController = initBusinessCarousel();
  animateCloudBackground();
  animateScrollSections(businessController);
  addMicroInteractions();
});