// Hero Slider
const heroSlider = {
  slides: null,
  dots: null,
  progressBar: null,
  currentDisplay: null,
  currentSlide: 0,
  slideInterval: null,
  slideDuration: 4000,
  isAnimating: false,
  hoverEnabled: false,

  init() {
    // Query elements fresh
    this.slides = document.querySelectorAll('.hero-slide');
    this.dots = document.querySelectorAll('.slider-dot');
    this.progressBar = document.querySelector('.slider-progress-bar');
    this.currentDisplay = document.querySelector('.slide-counter .current');
    
    if (!this.slides || this.slides.length === 0) {
      console.warn('No slides found');
      return;
    }
    
    // First slide is already visible via CSS, just ensure active class
    this.slides[0].classList.add('active');
    if (this.dots && this.dots.length > 0) this.dots[0].classList.add('active');
    this.updateCounter();
    
    // Start auto slideshow
    this.bindEvents();
    
    // Use setTimeout for first interval to ensure everything is ready
    const self = this;
    setTimeout(function() {
      self.startAutoSlide();
    }, 100);
    
    // Enable hover pause after first slide change
    setTimeout(function() {
      self.hoverEnabled = true;
    }, self.slideDuration + 500);
  },

  updateCounter() {
    if (this.currentDisplay) {
      this.currentDisplay.textContent = String(this.currentSlide + 1).padStart(2, '0');
    }
  },

  goToSlide(index, direction = 'next') {
    if (this.isAnimating || index === this.currentSlide) return;
    this.isAnimating = true;

    const currentEl = this.slides[this.currentSlide];
    const nextEl = this.slides[index];

    currentEl.classList.remove('active');
    currentEl.classList.add('prev');

    nextEl.classList.add('active');

    if (this.dots.length > 0) {
      this.dots[this.currentSlide].classList.remove('active');
      this.dots[index].classList.add('active');
    }

    this.currentSlide = index;
    this.updateCounter();
    this.resetProgressBar();

    setTimeout(() => {
      currentEl.classList.remove('prev');
      this.isAnimating = false;
    }, 1200);
  },

  nextSlide() {
    const next = (this.currentSlide + 1) % this.slides.length;
    this.goToSlide(next, 'next');
  },

  prevSlide() {
    const prev = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    this.goToSlide(prev, 'prev');
  },

  startAutoSlide() {
    this.stopAutoSlide();
    this.resetProgressBar();
    const self = this;
    this.slideInterval = setInterval(function() {
      if (!self.isAnimating) {
        self.nextSlide();
      }
    }, this.slideDuration);
  },

  stopAutoSlide() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
      this.slideInterval = null;
    }
  },

  resetProgressBar() {
    if (!this.progressBar) return;
    this.progressBar.classList.remove('running');
    void this.progressBar.offsetWidth;
    this.progressBar.classList.add('running');
  },

  bindEvents() {
    this.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        this.goToSlide(index);
        this.startAutoSlide();
      });
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this.prevSlide();
        this.startAutoSlide();
      } else if (e.key === 'ArrowRight') {
        this.nextSlide();
        this.startAutoSlide();
      }
    });

    // Pause on hover - only after first slide transition
    const hero = document.querySelector('.hero');
    if (hero) {
      hero.addEventListener('mouseenter', () => {
        if (this.hoverEnabled && this.slideInterval) this.stopAutoSlide();
      });
      hero.addEventListener('mouseleave', () => {
        if (this.hoverEnabled) this.startAutoSlide();
      });
    }

    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    const sliderWrapper = document.querySelector('.hero-slider-wrapper');
    
    if (sliderWrapper) {
      sliderWrapper.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      sliderWrapper.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > 50) {
          if (diff > 0) {
            this.nextSlide();
          } else {
            this.prevSlide();
          }
          this.startAutoSlide();
        }
      }, { passive: true });
    }
  }
};

// Initialize slider as soon as possible
(function initSlider() {
  function doInit() {
    if (!heroSlider.slideInterval) {
      heroSlider.init();
    }
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', doInit);
  } else {
    doInit();
  }
  
  // Backup: also init on window load in case DOMContentLoaded missed
  window.addEventListener('load', doInit);
  
  // Restart slider when tab becomes visible again
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      heroSlider.stopAutoSlide();
    } else if (heroSlider.slides && heroSlider.slides.length > 0) {
      heroSlider.startAutoSlide();
    }
  });
})();

// Nav toggle
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    navLinks.classList.toggle('open');
  });
}

// Direction-aware reveal + parallax scroll effects
(function initScrollEffects() {
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const saveDataEnabled = Boolean(connection && connection.saveData);
  const lowPowerDevice =
    (Number.isFinite(navigator.hardwareConcurrency) && navigator.hardwareConcurrency <= 4) ||
    (Number.isFinite(navigator.deviceMemory) && navigator.deviceMemory <= 4);
  const parallaxSelector =
    '[data-scroll-parallax], .hero-slider-wrapper, .founder-hero-overlay, .hero-banner-img, .fr3d-ambient';
  const enableParallax = !reducedMotionQuery.matches && !saveDataEnabled && !lowPowerDevice;
  const observedReveals = new Set();
  const parallaxTargets = new Set();
  const activeParallaxTargets = new Set();
  const parallaxSpeedByTarget = new WeakMap();
  const parallaxOffsetByTarget = new WeakMap();

  let scrollDirection = 'down';
  let lastScrollY = window.scrollY;
  let lastParallaxScrollY = window.scrollY;
  let scrollRaf = 0;
  const pendingRevealFrames = new Map();
  let revealObserver = null;
  let parallaxObserver = null;
  let mutationObserver = null;

  const addParallaxTarget = (el) => {
    if (!el || parallaxTargets.has(el)) return;
    parallaxTargets.add(el);
    const configuredSpeed = Number(el.dataset.scrollParallax);
    parallaxSpeedByTarget.set(el, Number.isFinite(configuredSpeed) ? configuredSpeed : 0.25);
    if (parallaxObserver) {
      parallaxObserver.observe(el);
    } else {
      activeParallaxTargets.add(el);
    }
  };

  const clearPendingFrame = (el) => {
    const rafId = pendingRevealFrames.get(el);
    if (!rafId) return;
    cancelAnimationFrame(rafId);
    pendingRevealFrames.delete(el);
  };

  const scheduleShow = (el) => {
    if (!el || el.classList.contains('show') || el.classList.contains('revealed')) return;
    clearPendingFrame(el);

    const rafId = requestAnimationFrame(() => {
      el.classList.add('show', 'revealed');
      if (revealObserver) {
        revealObserver.unobserve(el);
      }
      pendingRevealFrames.delete(el);
    });
    pendingRevealFrames.set(el, rafId);
  };

  const addRevealTarget = (el) => {
    if (!el || observedReveals.has(el) || !revealObserver) return;
    el.dataset.enterDir = 'down';
    revealObserver.observe(el);
    observedReveals.add(el);
  };

  const collectTargets = (node) => {
    if (!node || node.nodeType !== 1) return;

    if (node.matches('.reveal')) addRevealTarget(node);
    if (enableParallax && node.matches(parallaxSelector)) addParallaxTarget(node);

    node.querySelectorAll('.reveal').forEach((el) => addRevealTarget(el));
    if (enableParallax) {
      node.querySelectorAll(parallaxSelector).forEach((el) => addParallaxTarget(el));
    }
  };

  const resetParallax = (clearTransforms = true) => {
    parallaxTargets.forEach((target) => {
      if (!document.contains(target)) {
        parallaxTargets.delete(target);
        activeParallaxTargets.delete(target);
        parallaxOffsetByTarget.delete(target);
        return;
      }
      if (clearTransforms) {
        target.style.transform = '';
        parallaxOffsetByTarget.delete(target);
      }
    });
  };

  if (reducedMotionQuery.matches) {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('show', 'revealed'));
    document.querySelectorAll(parallaxSelector).forEach((el) => addParallaxTarget(el));
    resetParallax();
    return;
  }

  if ('IntersectionObserver' in window) {
    revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          el.dataset.enterDir = scrollDirection;
          scheduleShow(el);
        });
      },
      {
        threshold: 0.18,
        rootMargin: '0px 0px -6% 0px',
      }
    );

    if (enableParallax) {
      parallaxObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const target = entry.target;
            if (entry.isIntersecting) {
              activeParallaxTargets.add(target);
            } else {
              activeParallaxTargets.delete(target);
              target.style.transform = '';
              parallaxOffsetByTarget.delete(target);
            }
          });
        },
        {
          threshold: 0,
          rootMargin: '40% 0px 40% 0px',
        }
      );
    }
  } else {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('show', 'revealed'));
  }

  collectTargets(document.body || document.documentElement);

  if (document.body && (revealObserver || enableParallax)) {
    mutationObserver = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach((addedNode) => collectTargets(addedNode));
      });
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });
  }

  const applyParallax = (scrollY) => {
    if (!enableParallax || !activeParallaxTargets.size) return;
    if (Math.abs(scrollY - lastParallaxScrollY) < 0.5) return;
    lastParallaxScrollY = scrollY;

    activeParallaxTargets.forEach((target) => {
      if (!document.contains(target)) {
        parallaxTargets.delete(target);
        activeParallaxTargets.delete(target);
        parallaxOffsetByTarget.delete(target);
        return;
      }
      const speed = parallaxSpeedByTarget.get(target) ?? 0.25;
      const offset = Math.round(scrollY * speed * 100) / 100;
      if (parallaxOffsetByTarget.get(target) === offset) return;
      target.style.transform = `translate3d(0, ${offset}px, 0)`;
      parallaxOffsetByTarget.set(target, offset);
    });
  };

  const processScroll = () => {
    scrollRaf = 0;

    const y = window.scrollY;
    const delta = y - lastScrollY;
    if (Math.abs(delta) > 1.5) {
      scrollDirection = delta > 0 ? 'down' : 'up';
      document.documentElement.dataset.scrollDir = scrollDirection;
    }
    lastScrollY = y;

    applyParallax(y);
  };

  const onScroll = () => {
    if (scrollRaf) return;
    scrollRaf = requestAnimationFrame(processScroll);
  };

  if (revealObserver || enableParallax) {
    window.addEventListener('scroll', onScroll, { passive: true });
    processScroll();
  }
})();

// Animate stats
const statNumbers = document.querySelectorAll('.stat-number');
const statsSection = document.querySelector('.stats-strip');

if (statsSection) {
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        statNumbers.forEach(stat => {
          const finalText = stat.getAttribute('data-value') || stat.textContent;
          const numericMatch = finalText.match(/[\d,]+/);
          if (numericMatch) {
            const finalNumber = parseInt(numericMatch[0].replace(/,/g, ''));
            const duration = 1500;
            const start = Date.now();
            const prefix = finalText.substring(0, finalText.indexOf(numericMatch[0]));
            const suffix = finalText.substring(finalText.indexOf(numericMatch[0]) + numericMatch[0].length);
            
            const animate = () => {
              const elapsed = Date.now() - start;
              const progress = Math.min(elapsed / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              const current = Math.floor(finalNumber * eased);
              stat.textContent = prefix + current.toLocaleString() + suffix;
              
              if (progress < 1) {
                requestAnimationFrame(animate);
              } else {
                stat.textContent = finalText;
              }
            };
            animate();
          }
        });
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  
  statsObserver.observe(statsSection);
}

// Inquiry forms (home contact + franchise kits) via backend API
const defaultInquiryEndpoint = window.HHF_INQUIRY_API_URL || '/api/inquiry';
const inquiryForms = document.querySelectorAll('form#contactForm, form.kit-form, form[data-api-url]');

inquiryForms.forEach((form) => {
  if (form.dataset.inquiryBound === 'true') return;
  form.dataset.inquiryBound = 'true';

  const endpoint = form.dataset.apiUrl || defaultInquiryEndpoint;
  const submitBtn = form.querySelector('button[type="submit"]');
  const statusEl = form.querySelector('#contactStatus, [data-form-status]');
  const defaultBtnLabel = submitBtn ? submitBtn.textContent : 'Send';
  const defaultBtnHtml = submitBtn ? submitBtn.innerHTML : defaultBtnLabel;

  const setStatus = (message, isError = false) => {
    if (!statusEl) return;
    statusEl.style.display = 'block';
    statusEl.style.color = isError ? '#f97316' : '#22c55e';
    statusEl.textContent = message;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
    }
    if (statusEl) {
      statusEl.style.display = 'none';
      statusEl.textContent = '';
    }

    const payload = Object.fromEntries(new FormData(form).entries());

    if (!payload.comment && payload.message) {
      payload.comment = payload.message;
    }
    if (!payload.source) {
      payload.source = form.dataset.source || 'Website Form';
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || 'Form submission failed.');
      }

      form.reset();
      const leadInfo = data.leadId ? ` Reference: ${data.leadId}.` : '';
      const autoReplyInfo = data.autoReplySent
        ? ' A confirmation email was sent to your email address.'
        : '';
      const successMessage = `Inquiry sent successfully.${leadInfo}${autoReplyInfo}`;

      if (statusEl) {
        setStatus(successMessage, false);
      } else {
        alert(successMessage);
      }
    } catch (error) {
      const message = error.message || 'Something went wrong. Please try again.';
      if (statusEl) {
        setStatus(message, true);
      } else {
        alert(message);
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = defaultBtnHtml;
      }
    }
  });
});

// Awards section certificate modal (home page)
(function initAwardsHomeModal() {
  const modal = document.getElementById('awHomeModal');
  const openButtons = Array.from(document.querySelectorAll('[data-aw-open]'));
  if (!modal || !openButtons.length) return;

  const image = document.getElementById('awHomeModalImage');
  const title = document.getElementById('awHomeModalTitle');
  const indexText = document.getElementById('awHomeModalIndex');
  const closeBtn = document.getElementById('awHomeModalClose');
  const prevBtn = document.getElementById('awHomePrev');
  const nextBtn = document.getElementById('awHomeNext');
  const openOriginal = document.getElementById('awHomeModalOpen');

  const items = openButtons.map((btn, idx) => ({
    src: btn.getAttribute('data-aw-src') || btn.querySelector('img')?.getAttribute('src') || '',
    alt: btn.getAttribute('data-aw-alt') || `Certificate ${idx + 1}`,
    label: btn.getAttribute('data-aw-label') || `Certificate ${idx + 1}`,
    bg: btn.getAttribute('data-aw-bg') || ''
  }));

  let currentIndex = 0;

  const render = () => {
    const item = items[currentIndex];
    if (!item || !image) return;

    image.src = item.src;
    image.alt = item.alt;
    image.classList.toggle('aw-home-modal-image-light', item.bg === 'light');
    if (title) title.textContent = item.label;
    if (indexText) indexText.textContent = `${currentIndex + 1} / ${items.length}`;
    if (openOriginal) openOriginal.href = item.src;
    if (prevBtn) prevBtn.disabled = currentIndex === 0;
    if (nextBtn) nextBtn.disabled = currentIndex === items.length - 1;
  };

  const openAt = (index) => {
    currentIndex = Math.max(0, Math.min(index, items.length - 1));
    render();
    modal.hidden = false;
    document.body.classList.add('modal-open');
    closeBtn?.focus();
  };

  const close = () => {
    modal.hidden = true;
    document.body.classList.remove('modal-open');
  };

  const move = (delta) => {
    const nextIndex = Math.max(0, Math.min(currentIndex + delta, items.length - 1));
    if (nextIndex === currentIndex) return;
    currentIndex = nextIndex;
    render();
  };

  openButtons.forEach((btn, idx) => {
    btn.addEventListener('click', () => openAt(idx));
  });

  closeBtn?.addEventListener('click', close);
  prevBtn?.addEventListener('click', () => move(-1));
  nextBtn?.addEventListener('click', () => move(1));

  modal.addEventListener('click', (event) => {
    if (event.target === modal) close();
  });

  document.addEventListener('keydown', (event) => {
    if (modal.hidden) return;
    if (event.key === 'Escape') close();
    if (event.key === 'ArrowLeft') move(-1);
    if (event.key === 'ArrowRight') move(1);
  });
})();

// About Section Tabs
const aboutTabBtns = document.querySelectorAll('.about-tab-btn');
const aboutPanels = document.querySelectorAll('.about-panel');

aboutTabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const targetTab = btn.getAttribute('data-about-tab');
    
    // Remove active from all buttons and panels
    aboutTabBtns.forEach(b => b.classList.remove('active'));
    aboutPanels.forEach(p => p.classList.remove('active'));
    
    // Add active to clicked button and corresponding panel
    btn.classList.add('active');
    document.getElementById(targetTab).classList.add('active');
  });
});

// Handle dropdown links to About subsections
const dropdownLinks = document.querySelectorAll('.dropdown-link');

dropdownLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    const targetId = link.getAttribute('href').replace('#', '');
    const targetPanel = document.getElementById(targetId);
    const targetBtn = document.querySelector(`[data-about-tab="${targetId}"]`);
    
    if (targetPanel && targetBtn) {
      // Remove active from all buttons and panels
      aboutTabBtns.forEach(b => b.classList.remove('active'));
      aboutPanels.forEach(p => p.classList.remove('active'));
      
      // Activate the target tab and panel
      targetBtn.classList.add('active');
      targetPanel.classList.add('active');
    }
  });
});

// Franchise Carousel
const franchiseCarousel = {
  currentIndex: 0,
  cardWidth: 340,
  visibleCards: 3,
  
  init() {
    this.tabBtns = document.querySelectorAll('.tab-btn-underline');
    this.tracks = document.querySelectorAll('.franchise-carousel-track');
    this.prevBtn = document.querySelector('.carousel-prev');
    this.nextBtn = document.querySelector('.carousel-next');
    
    if (!this.tabBtns.length || !this.tracks.length) return;
    
    this.bindEvents();
    this.updateVisibleCards();
    window.addEventListener('resize', () => this.updateVisibleCards());
  },
  
  updateVisibleCards() {
    const width = window.innerWidth;
    this.cardWidth = this.measureCardWidth();
    if (width < 640) {
      this.visibleCards = 1;
    } else if (width < 900) {
      this.visibleCards = 2;
    } else {
      this.visibleCards = 3;
    }
  },

  measureCardWidth() {
    const track = this.getActiveTrack();
    if (!track) return this.cardWidth;
    const firstCard = track.querySelector('.franchise-carousel-card');
    if (!firstCard) return this.cardWidth;
    const styles = window.getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
    return firstCard.getBoundingClientRect().width + gap;
  },
  
  bindEvents() {
    // Tab switching
    this.tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetCategory = btn.dataset.tab;
        
        // Update active tab
        this.tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Show corresponding track
        this.tracks.forEach(track => {
          if (track.dataset.category === targetCategory) {
            track.style.display = 'flex';
          } else {
            track.style.display = 'none';
          }
        });
        
        // Reset carousel position
        this.currentIndex = 0;
        this.cardWidth = this.measureCardWidth();
        this.updateCarousel();
      });
    });
    
    // Arrow navigation
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.prev());
    }
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.next());
    }
  },
  
  getActiveTrack() {
    return document.querySelector('.franchise-carousel-track[style*="flex"], .franchise-carousel-track:not([style*="none"])');
  },
  
  getMaxIndex() {
    const track = this.getActiveTrack();
    if (!track) return 0;
    const cards = track.querySelectorAll('.franchise-carousel-card');
    return Math.max(0, cards.length - this.visibleCards);
  },
  
  prev() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updateCarousel();
    }
  },
  
  next() {
    if (this.currentIndex < this.getMaxIndex()) {
      this.currentIndex++;
      this.updateCarousel();
    }
  },
  
  updateCarousel() {
    const track = this.getActiveTrack();
    if (!track) return;
    this.cardWidth = this.measureCardWidth();
    
    const offset = -this.currentIndex * this.cardWidth;
    track.style.transform = `translateX(${offset}px)`;
  }
};

// Initialize franchise carousel when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => franchiseCarousel.init());
} else {
  franchiseCarousel.init();
}

// Franchise V2 carousel
const franchiseCarouselV2 = {
  root: null,
  tabs: [],
  tracks: [],
  prevBtn: null,
  nextBtn: null,
  desc: null,

  init() {
    this.root = document.querySelector('.franchise-v2-section');
    if (!this.root) return;

    this.tabs = Array.from(this.root.querySelectorAll('.franchise-v2-tab'));
    this.tracks = Array.from(this.root.querySelectorAll('.franchise-v2-track'));
    this.prevBtn = this.root.querySelector('.franchise-v2-arrow.prev');
    this.nextBtn = this.root.querySelector('.franchise-v2-arrow.next');
    this.desc = this.root.querySelector('.franchise-v2-tab-desc');

    if (!this.tabs.length || !this.tracks.length) return;

    this.bindEvents();
    const activeTab = this.tabs.find(tab => tab.classList.contains('active')) || this.tabs[0];
    this.setActiveTab(activeTab.dataset.tab);
    this.updateArrowState();
    window.addEventListener('resize', () => this.updateArrowState());
  },

  bindEvents() {
    this.tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        this.setActiveTab(tab.dataset.tab);
      });
    });

    this.tracks.forEach((track) => {
      track.addEventListener('scroll', () => this.updateArrowState(), { passive: true });
      track.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          this.scrollByPage(-1);
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          this.scrollByPage(1);
        }
      });
    });

    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => this.scrollByPage(-1));
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.scrollByPage(1));
    }
  },

  getActiveTrack() {
    return this.tracks.find(track => track.classList.contains('active')) || null;
  },

  setActiveTab(tabId) {
    this.tabs.forEach((tab) => {
      const selected = tab.dataset.tab === tabId;
      tab.classList.toggle('active', selected);
      tab.setAttribute('aria-selected', selected ? 'true' : 'false');
    });

    this.tracks.forEach((track) => {
      const selected = track.dataset.category === tabId;
      track.classList.toggle('active', selected);
      if (selected) {
        track.scrollTo({ left: 0, behavior: 'auto' });
      }
    });

    const selectedTab = this.tabs.find(tab => tab.dataset.tab === tabId);
    if (selectedTab && this.desc) {
      this.desc.textContent = selectedTab.dataset.desc || '';
    }

    this.updateArrowState();
  },

  scrollByPage(direction) {
    const track = this.getActiveTrack();
    if (!track) return;

    const delta = Math.max(240, track.clientWidth * 0.9) * direction;
    track.scrollBy({ left: delta, behavior: 'smooth' });
  },

  updateArrowState() {
    const track = this.getActiveTrack();
    if (!track || !this.prevBtn || !this.nextBtn) return;

    const maxScroll = Math.max(0, track.scrollWidth - track.clientWidth);
    const scrollLeft = Math.max(0, Math.min(track.scrollLeft, maxScroll));

    this.prevBtn.disabled = scrollLeft <= 2;
    this.nextBtn.disabled = (maxScroll - scrollLeft) <= 2;
  },
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => franchiseCarouselV2.init());
} else {
  franchiseCarouselV2.init();
}

// Branch coverflow carousel (BIGSTOP branches section)
const branchCoverflow = {
  root: null,
  stage: null,
  cards: [],
  dotsWrap: null,
  dots: [],
  prevBtn: null,
  nextBtn: null,
  currentIndex: 0,
  autoInterval: 4200,
  timer: null,
  touchStartX: 0,
  stateClasses: ['is-active', 'is-left-1', 'is-right-1', 'is-left-2', 'is-right-2', 'is-hidden'],

  init() {
    this.root = document.querySelector('.bigstop-branches-coverflow');
    if (!this.root) return;

    this.stage = this.root.querySelector('.bigstop-branches-stage');
    this.cards = Array.from(this.root.querySelectorAll('.bigstop-branch-card'));
    this.dotsWrap = document.getElementById('bigstopBranchesPagination');
    this.prevBtn = this.root.querySelector('.bigstop-branch-nav.prev');
    this.nextBtn = this.root.querySelector('.bigstop-branch-nav.next');

    if (!this.cards.length) return;

    const activeIndex = this.cards.findIndex(card => card.classList.contains('is-active'));
    this.currentIndex = activeIndex >= 0 ? activeIndex : 0;

    this.buildDots();
    this.bindEvents();
    this.update();
    this.startAuto();
  },

  normalizeOffset(rawOffset, total) {
    let offset = rawOffset;
    const half = Math.floor(total / 2);
    if (offset > half) offset -= total;
    if (offset < -half) offset += total;
    return offset;
  },

  update() {
    const total = this.cards.length;

    this.cards.forEach((card, index) => {
      const offset = this.normalizeOffset(index - this.currentIndex, total);
      card.classList.remove(...this.stateClasses);

      if (offset === 0) {
        card.classList.add('is-active');
      } else if (offset === -1) {
        card.classList.add('is-left-1');
      } else if (offset === 1) {
        card.classList.add('is-right-1');
      } else if (offset === -2) {
        card.classList.add('is-left-2');
      } else if (offset === 2) {
        card.classList.add('is-right-2');
      } else {
        card.classList.add('is-hidden');
      }
    });

    this.dots.forEach((dot, index) => {
      dot.classList.toggle('is-active', index === this.currentIndex);
      dot.setAttribute('aria-current', index === this.currentIndex ? 'true' : 'false');
    });
  },

  goTo(index) {
    const total = this.cards.length;
    this.currentIndex = (index + total) % total;
    this.update();
  },

  next() {
    this.goTo(this.currentIndex + 1);
  },

  prev() {
    this.goTo(this.currentIndex - 1);
  },

  buildDots() {
    if (!this.dotsWrap) return;
    this.dotsWrap.innerHTML = '';
    this.dots = this.cards.map((_, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'bigstop-branch-dot';
      dot.textContent = String(index + 1);
      dot.setAttribute('aria-label', `Show branch ${index + 1}`);
      dot.addEventListener('click', () => {
        this.goTo(index);
        this.restartAuto();
      });
      this.dotsWrap.appendChild(dot);
      return dot;
    });
  },

  bindEvents() {
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => {
        this.prev();
        this.restartAuto();
      });
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => {
        this.next();
        this.restartAuto();
      });
    }

    this.cards.forEach((card, index) => {
      card.addEventListener('click', () => {
        if (index === this.currentIndex) return;
        this.goTo(index);
        this.restartAuto();
      });
    });

    this.root.addEventListener('mouseenter', () => this.stopAuto());
    this.root.addEventListener('mouseleave', () => this.startAuto());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stopAuto();
      } else {
        this.startAuto();
      }
    });

    if (this.stage) {
      this.stage.addEventListener('touchstart', (event) => {
        this.touchStartX = event.changedTouches[0].screenX;
      }, { passive: true });

      this.stage.addEventListener('touchend', (event) => {
        const touchEndX = event.changedTouches[0].screenX;
        const deltaX = this.touchStartX - touchEndX;

        if (Math.abs(deltaX) < 40) return;
        if (deltaX > 0) {
          this.next();
        } else {
          this.prev();
        }
        this.restartAuto();
      }, { passive: true });
    }
  },

  startAuto() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    this.stopAuto();
    this.timer = setInterval(() => {
      this.next();
    }, this.autoInterval);
  },

  stopAuto() {
    if (!this.timer) return;
    clearInterval(this.timer);
    this.timer = null;
  },

  restartAuto() {
    this.startAuto();
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => branchCoverflow.init());
} else {
  branchCoverflow.init();
}

// --------------------
// 3D tilt cards + parallax ambience
// --------------------
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let parallaxLayersInitialized = false;

function initTiltCards() {
  if (prefersReducedMotion.matches) return;
  const tiltCards = document.querySelectorAll('[data-tilt]');
  tiltCards.forEach(card => {
    if (card.dataset.tiltBound) return;
    card.dataset.tiltBound = 'true';

    const strength = Number(card.dataset.tilt) || 10;
    const glow = document.createElement('span');
    glow.className = 'tilt-glow';
    card.appendChild(glow);

    const handleMove = (event) => {
      if (event.pointerType === 'touch') return;
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateX = ((y / rect.height) - 0.5) * -strength;
      const rotateY = ((x / rect.width) - 0.5) * strength;

      card.style.transform = `perspective(1100px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`;
      glow.style.opacity = 1;
      glow.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.24), rgba(108,173,255,0.1), transparent 60%)`;
      card.classList.add('tilt-active');
    };

    const reset = () => {
      card.style.transform = '';
      glow.style.opacity = 0;
      card.classList.remove('tilt-active');
    };

    card.addEventListener('pointermove', handleMove);
    card.addEventListener('pointerleave', reset);
  });
}

function initParallaxLayers() {
  if (prefersReducedMotion.matches || parallaxLayersInitialized) return;
  const layers = Array.from(document.querySelectorAll('[data-parallax]'));
  if (!layers.length) return;
  parallaxLayersInitialized = true;

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let rafId = 0;
  const damp = 0.1;
  const settleThreshold = 0.0018;
  const lastLayerOffset = new WeakMap();

  const requestFrame = () => {
    if (rafId || document.hidden) return;
    rafId = requestAnimationFrame(animate);
  };

  const onPointerMove = (event) => {
    targetX = (event.clientX / window.innerWidth) - 0.5;
    targetY = (event.clientY / window.innerHeight) - 0.5;
    requestFrame();
  };

  const onPointerLeave = () => {
    targetX = 0;
    targetY = 0;
    requestFrame();
  };

  const animate = () => {
    rafId = 0;
    currentX += (targetX - currentX) * damp;
    currentY += (targetY - currentY) * damp;

    const deltaX = Math.abs(targetX - currentX);
    const deltaY = Math.abs(targetY - currentY);

    layers.forEach(layer => {
      const depth = Number(layer.dataset.parallax) || 10;
      const translateX = currentX * depth;
      const translateY = currentY * depth;
      const nextTransform = `translate3d(${translateX.toFixed(2)}px, ${translateY.toFixed(2)}px, 0)`;
      if (lastLayerOffset.get(layer) === nextTransform) return;
      layer.style.transform = nextTransform;
      lastLayerOffset.set(layer, nextTransform);
    });

    if (deltaX > settleThreshold || deltaY > settleThreshold) {
      requestFrame();
    }
  };

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerleave', onPointerLeave, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
      return;
    }
    if (!document.hidden) requestFrame();
  });

  requestFrame();
}

const runInteractiveUpgrades = () => {
  initTiltCards();
  initParallaxLayers();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runInteractiveUpgrades);
} else {
  runInteractiveUpgrades();
}

prefersReducedMotion.addEventListener('change', (event) => {
  if (!event.matches) {
    runInteractiveUpgrades();
  }
});

// Why modal (Bigstop page)
(function initWhyModal() {
  const trigger = document.getElementById('whyHeroCard');
  const modal = document.getElementById('whyModal');
  if (!trigger || !modal) return;

  const closeBtn = document.getElementById('whyModalClose');

  const open = () => {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  };

  const close = () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  };

  trigger.addEventListener('click', open);
  if (closeBtn) closeBtn.addEventListener('click', close);
  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.classList.contains('why-modal-backdrop')) {
      close();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      close();
    }
  });
})();

// Ensure hero video autoplays (muted for browser autoplay policies)
(function initHeroVideoAutoplay() {
  const vid = document.querySelector('.hero-video-frame video');
  if (!vid) return;
  vid.muted = true;
  const tryPlay = () => vid.play().catch(() => {});
  vid.addEventListener('canplay', tryPlay, { once: true });
  window.addEventListener('load', tryPlay, { once: true });
  document.addEventListener('click', tryPlay, { once: true });
})();

// Floating hero video drag (Bigstop hero)
(function initFloatingHeroVideo() {
  const thumb = document.querySelector('.hero-video-thumb');
  if (!thumb) return;

  // Disable dragging so the video stays within its section
  return;

  let dragging = false;
  let startX = 0;
  let startY = 0;
  let startLeft = 0;
  let startTop = 0;

  const setPositionFromRect = () => {
    const rect = thumb.getBoundingClientRect();
    thumb.style.left = `${rect.left}px`;
    thumb.style.top = `${rect.top}px`;
    thumb.style.right = 'auto';
    thumb.style.bottom = 'auto';
  };

  // Convert initial bottom/right into explicit left/top so dragging works smoothly
  window.addEventListener('load', setPositionFromRect, { once: true });

  const onPointerMove = (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    thumb.style.left = `${startLeft + dx}px`;
    thumb.style.top = `${startTop + dy}px`;
  };

  const stopDrag = () => {
    if (!dragging) return;
    dragging = false;
    thumb.classList.remove('dragging');
    document.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('pointerup', stopDrag);
  };

  thumb.addEventListener('pointerdown', (e) => {
    dragging = true;
    thumb.classList.add('dragging');
    startX = e.clientX;
    startY = e.clientY;

    const rect = thumb.getBoundingClientRect();
    startLeft = rect.left;
    startTop = rect.top;

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', stopDrag, { once: true });
    e.preventDefault();
  });
})();

// Smooth padding tighten on scroll for Boss Siomai sections
(function initPaddingScrollEffect() {
  const targets = document.querySelectorAll('.siomai-why, .siomai-packages');
  if (!targets.length) return;

  const onScroll = () => {
    if (window.scrollY > 24) {
      document.body.classList.add('scroll-tight');
    } else {
      document.body.classList.remove('scroll-tight');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// Package modal + filters
(function initPackageVisuals() {
  const modal = document.getElementById('packageModal');
  const modalImg = document.getElementById('packageModalImg');
  const closeBtn = modal ? modal.querySelector('.package-modal-close') : null;
  const backdrop = modal ? modal.querySelector('.package-modal-backdrop') : null;
  const previews = document.querySelectorAll('.package-preview');
  const filterButtons = document.querySelectorAll('[data-package-filter]');
  const cards = document.querySelectorAll('.siomai-package-card');
  const claimButtons = document.querySelectorAll('.package-claim');
  const applyModal = document.getElementById('siomaiApplyModal');
  const applyCloseControls = applyModal ? applyModal.querySelectorAll('[data-apply-close]') : [];
  const applyPanel = applyModal ? applyModal.querySelector('.siomai-apply-panel') : null;
  const applyTitle = document.getElementById('siomaiApplyTitle');
  const claimForm = document.getElementById('siomaiClaimForm');
  const claimInterestInput = claimForm ? claimForm.querySelector('input[name="franchise_interest"]') : null;
  const claimMessage = claimForm ? claimForm.querySelector('textarea[name="message"]') : null;
  const investmentFee = document.getElementById('siomaiApplyFee');
  const investmentTotal = document.getElementById('siomaiApplyTotal');
  const investmentTerm = document.getElementById('siomaiApplyTerm');
  const investmentRoyalty = document.getElementById('siomaiApplyRoyalty');
  const serviceList = document.getElementById('siomaiApplyServices');

  const packageDetails = {
    'Food Cart Package': {
      title: 'Boss Siomai',
      fee: 'PHP 39,999',
      total: 'PHP 39,999',
      term: '5 years',
      royalty: '10% net income',
      services: ['Siomai Menu Line', 'Supply Chain Access', 'Store Setup Support', 'Crew Training'],
    },
    'Bike Cart Package': {
      title: 'Boss Siomai',
      fee: 'PHP 65,000',
      total: 'PHP 65,000',
      term: '5 years',
      royalty: '10% net income',
      services: ['Mobile Cart Setup', 'Supply Chain Access', 'Route Launch Guidance', 'Crew Training'],
    },
    'Kiosk Package': {
      title: 'Boss Siomai',
      fee: 'PHP 99,000',
      total: 'PHP 99,000',
      term: '5 years',
      royalty: '10% net income',
      services: ['Full Kiosk Setup', 'Supply Chain Access', 'Store Setup Support', 'Crew Training'],
    },
    'Reseller Package': {
      title: 'Boss Siomai',
      fee: 'PHP 4,999',
      total: 'PHP 4,999',
      term: 'Flexible',
      royalty: 'No royalty fee',
      services: ['Frozen Product Supply', 'Starter Sales Materials', 'Orientation Support', 'Reorder Assistance'],
    },
  };

  const setClaimPackage = (packageName) => {
    const selected = (packageName || '').trim() || 'Food Cart Package';
    const detail = packageDetails[selected] || packageDetails['Food Cart Package'];

    if (claimInterestInput) {
      const interestValue = `Boss Siomai - ${selected}`;
      claimInterestInput.value = interestValue;
      claimInterestInput.defaultValue = interestValue;
    }
    if (applyTitle) {
      applyTitle.textContent = `${detail.title} Franchise Details`;
    }
    if (investmentFee) {
      investmentFee.textContent = detail.fee;
    }
    if (investmentTotal) {
      investmentTotal.textContent = detail.total;
    }
    if (investmentTerm) {
      investmentTerm.textContent = detail.term;
    }
    if (investmentRoyalty) {
      investmentRoyalty.textContent = detail.royalty;
    }
    if (serviceList) {
      serviceList.innerHTML = '';
      detail.services.forEach((service) => {
        const li = document.createElement('li');
        const dot = document.createElement('span');
        dot.setAttribute('aria-hidden', 'true');
        const text = document.createElement('span');
        text.textContent = service;
        li.append(dot, text);
        serviceList.appendChild(li);
      });
    }
    if (claimMessage && !claimMessage.value.trim()) {
      claimMessage.value = `Hi, I want to claim the ${selected}. Please share the requirements and next steps.`;
    }
  };

  const openApplyModal = (packageName) => {
    if (!applyModal) return;
    setClaimPackage(packageName);
    applyModal.classList.add('open');
    applyModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  };

  const closeApplyModal = (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (!applyModal) return;
    applyModal.classList.remove('open');
    applyModal.setAttribute('aria-hidden', 'true');

    const hasOpenModal = document.querySelector('.video-modal.open, .package-modal.open, .why-modal.open, .siomai-apply-modal.open');
    if (!hasOpenModal) {
      document.body.classList.remove('modal-open');
    }
  };

  if (modal && modalImg) {
    const open = (src) => {
      modalImg.src = src;
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
    };
    const close = () => {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      modalImg.removeAttribute('src');
    };

    previews.forEach(btn => {
      btn.addEventListener('click', () => {
        const src = btn.getAttribute('data-poster');
        if (src) open(src);
      });
    });

    [closeBtn, backdrop].forEach(el => {
      if (el) el.addEventListener('click', close);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) close();
    });
  }

  if (filterButtons.length && cards.length) {
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.packageFilter;
        filterButtons.forEach(b => b.classList.toggle('active', b === btn));
        cards.forEach(card => {
          const type = card.dataset.packageType || 'all';
          const show = val === 'all' || type === val;
          card.style.display = show ? '' : 'none';
        });
      });
    });
  }

  if (claimButtons.length) {
    claimButtons.forEach((btn) => {
      btn.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        openApplyModal(btn.dataset.claimPackage);
      });
    });
  }

  if (applyPanel) {
    applyPanel.addEventListener('click', (event) => {
      event.stopPropagation();
    });
  }

  if (applyCloseControls.length) {
    applyCloseControls.forEach((el) => {
      el.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        event.stopPropagation();
      });
      el.addEventListener('click', closeApplyModal);
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && applyModal && applyModal.classList.contains('open')) {
      closeApplyModal();
    }
  });
})();

// Daily countdown timer for urgency bar
(function initCountdown() {
  const el = document.getElementById('countdown');
  if (!el) return;
  const tick = () => {
    const now = new Date();
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    let diff = Math.max(0, end - now);
    const hrs = String(Math.floor(diff / 3_600_000)).padStart(2, '0');
    diff %= 3_600_000;
    const mins = String(Math.floor(diff / 60_000)).padStart(2, '0');
    diff %= 60_000;
    const secs = String(Math.floor(diff / 1000)).padStart(2, '0');
    el.textContent = `${hrs}:${mins}:${secs}`;
  };
  tick();
  setInterval(tick, 1000);
})();

// Floating CTA click scroll to contact form
(function initFloatingCta() {
  // CTA removed per latest request
})();
