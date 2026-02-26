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
    if (!document.hidden && heroSlider.slides && heroSlider.slides.length > 0) {
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

// Reveal on scroll
const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
    }
  });
}, { threshold: 0.15 });

reveals.forEach(el => revealObserver.observe(el));

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

// Contact form with AJAX submission
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const formSuccess = document.getElementById('formSuccess');
    const formNote = document.getElementById('formNote');
    
    // Disable button and show loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Sending... <span>⏳</span>';
    
    try {
      const response = await fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        // Success
        contactForm.reset();
        formNote.style.display = 'none';
        formSuccess.style.display = 'block';
        submitBtn.innerHTML = 'Sent! <span>✓</span>';
        submitBtn.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      // Error
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Submit inquiry <span>📨</span>';
      alert('Oops! Something went wrong. Please try again.');
    }
  });
}

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
  if (prefersReducedMotion.matches) return;
  const layers = Array.from(document.querySelectorAll('[data-parallax]'));
  if (!layers.length) return;

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  const damp = 0.08;

  window.addEventListener('pointermove', (event) => {
    targetX = (event.clientX / window.innerWidth) - 0.5;
    targetY = (event.clientY / window.innerHeight) - 0.5;
  });

  const animate = () => {
    currentX += (targetX - currentX) * damp;
    currentY += (targetY - currentY) * damp;

    layers.forEach(layer => {
      const depth = Number(layer.dataset.parallax) || 10;
      const translateX = currentX * depth;
      const translateY = currentY * depth;
      layer.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;
    });

    requestAnimationFrame(animate);
  };

  animate();
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

// Live chat via Crisp (embed)
(function initCrispLiveChat() {
  if (window.$crisp) return; // already loaded
  window.$crisp = window.$crisp || [];
  window.CRISP_WEBSITE_ID = window.CRISP_WEBSITE_ID || 'a6242ab8-c301-4e65-8c0d-c0bd666fd6a2';
  // Set launcher/theme color before Crisp loads
  window.CRISP_RUNTIME_CONFIG = Object.assign(window.CRISP_RUNTIME_CONFIG || {}, {
    color: { theme: '#f0a72d', background: '#0c1324' }
  });
  const existing = document.querySelector('script[src*="client.crisp.chat/l.js"]');
  if (!existing) {
    const s = document.createElement('script');
    s.src = 'https://client.crisp.chat/l.js';
    s.async = 1;
    document.head.appendChild(s);
  }

  const applyBranding = () => {
    window.$crisp.push(['config', 'color:theme', '#f0a72d']);
    window.$crisp.push(['config', 'color:background', '#0c1324']);
    window.$crisp.push(['config', 'text:headline', 'Talk to a real person']);
    window.$crisp.push(['config', 'text:body', 'Ask about packages, timelines, or support. A live agent will reply.']);
  };

  window.$crisp.push(['on', 'session:loaded', applyBranding]);
  // Re-apply a few times to override cached theme
  let attempts = 0;
  const repaint = () => {
    applyBranding();
    if (++attempts < 5) setTimeout(repaint, 800);
  };
  setTimeout(repaint, 600);
})();

