// ===== Dark Mode: โหลดค่าจากระบบ/ที่บันทึกไว้ + toggle =====
(function initTheme() {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const saved = localStorage.getItem('theme');
  const dark = saved ? saved === 'dark' : prefersDark;

  const apply = (isDark) => {
    document.body.classList.toggle('dark-mode', isDark);
    document.querySelector('header')?.classList.toggle('dark-mode', isDark);
  };

  const run = () => {
    const toggle = document.getElementById('toggle-dark');
    
    apply(dark);
    // accessibility state for the toggle button
    if (toggle) {
      toggle.setAttribute('aria-pressed', dark ? 'true' : 'false');
    }
    if (toggle) {
      toggle.addEventListener('click', function () {
        const newTheme = !document.body.classList.contains('dark-mode');
        apply(newTheme);
        localStorage.setItem('theme', newTheme ? 'dark' : 'light');
        toggle.setAttribute('aria-pressed', newTheme ? 'true' : 'false');
      });
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();

// ===== Active nav on scroll =====
(function initActiveNav() {
  const run = () => {
    // หาลิงก์ในเมนูนำทาง — ถ้าผลลัพธ์ว่าง ให้ลอง fallback selector อื่น
    let navLinks = Array.from(document.querySelectorAll('.navmenu a'))
      .filter(a => a.getAttribute('href')?.startsWith('#'));
    if (!navLinks.length) {
      navLinks = Array.from(document.querySelectorAll('header .navmenu a, .pill-nav .navmenu a, .navmenu li a'))
        .filter(a => a.getAttribute('href')?.startsWith('#'));
    }

    const sections = navLinks
      .map(a => document.querySelector(a.getAttribute('href')))
      .filter(Boolean);

    const setActive = (id) => {
      navLinks.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
      });
    };

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { root: null, rootMargin: '-35% 0px -35% 0px', threshold: 0.01 });

    sections.forEach(sec => io.observe(sec));

    // กดลิงก์แล้วให้ active ทันที และเลื่อนหน้าไปยัง section แบบนุ่ม (มี offset สำหรับ header)
    // Attach click handlers; add debug logs so we can confirm handlers run in browser console
    navLinks.forEach(a => {
      try { a.dataset.navBound = '1'; } catch (err) {}
      a.addEventListener('click', (e) => {
        console.debug('[nav click]', a.getAttribute('href'));
        const href = a.getAttribute('href');
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();

        // คำนวณ offset ของ header เพื่อไม่ให้เนื้อหาไปชนกับ sticky header
        const header = document.querySelector('header');
        const headerHeight = header ? header.offsetHeight : 0;

        // เคารพผู้ใช้ที่ต้องการ reduced motion
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        const top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 12;

        window.scrollTo({ top: Math.max(0, top), behavior: reduce ? 'auto' : 'smooth' });

        // อัปเดตสถานะ active และ focus เพื่อ accessibility
        setActive(target.id);
        // ให้ focus ไปยัง section โดยไม่ให้ browser รีสกอลล์ซ้ำ (preventScroll)
        try {
          target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
          setTimeout(() => target.removeAttribute('tabindex'), 1000);
        } catch (err) {
          // บราวเซอร์บางตัวเก่าอาจไม่รองรับ preventScroll
        }
      });
    });

    // Delegated fallback: ถ้าลิงก์เมนูไม่ได้ถูกผูก handler ด้วยเหตุผลใดๆ,
    // ให้จับที่ document และจัดการเลื่อนแบบเดียวกัน (จะข้ามถ้า dataset.navBound === '1')
    document.addEventListener('click', (e) => {
      const a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      // ตรวจสอบว่าลิงก์เป็นส่วนหนึ่งของเมนูนำทาง (header/pill-nav/navmenu)
      if (!a.closest('.navmenu') && !a.closest('.pill-nav') && !a.closest('header')) return;
      // ถ้าลิงก์มี handler ผูกแล้ว ให้ delegated ข้ามไป
      if (a.dataset && a.dataset.navBound === '1') return;

      console.debug('[nav delegated click]', a.getAttribute('href'));

      const href = a.getAttribute('href');
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();

      const header = document.querySelector('header');
      const headerHeight = header ? header.offsetHeight : 0;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const top = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 12;
      window.scrollTo({ top: Math.max(0, top), behavior: reduce ? 'auto' : 'smooth' });
      try {
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
        setTimeout(() => target.removeAttribute('tabindex'), 1000);
      } catch (err) {}
      // อัปเดต active state
      setActive(target.id);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();

// ===== Scroll Reveal Animation =====
(function initScrollReveal() {
  const run = () => {
    // สร้าง Intersection Observer สำหรับ scroll animation
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          // หยุด observe element นี้หลังจาก reveal แล้ว
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '-10% 0px -10% 0px', // เริ่ม animate ก่อนที่ element จะเข้าสู่ viewport
      threshold: 0.1
    });

    // หา elements ที่ต้องการ animate
    const elementsToReveal = document.querySelectorAll(`
      .home-text,
      .home-img,
      .about h2,
      .about-img,
      .about-content,
      .about-box,
      .info-list,
      .skills h2,
      .skills-subtitle,
      .skill-group,
      .skill-card,
      .projects h2,
      .projects-subtitle,
      .project-card,
      .contact h2,
      .contact-subtitle,
      .contact-info,
      .contact-link,
      .contact-form
    `);

    // เพิ่ม class และ observe elements
    elementsToReveal.forEach((element, index) => {
      // เพิ่ม class ตามประเภทของ element
      if (element.classList.contains('home-text') || 
          element.classList.contains('about-content') ||
          element.classList.contains('contact-info')) {
        element.classList.add('scroll-reveal-left');
      } else if (element.classList.contains('home-img') || 
                 element.classList.contains('about-img')) {
        element.classList.add('scroll-reveal-right');
      } else if (element.classList.contains('skill-card') || 
                 element.classList.contains('project-card')) {
        element.classList.add('scroll-reveal-scale');
        // เพิ่ม delay สำหรับ staggered effect
        const delayIndex = index % 4;
        element.classList.add(`scroll-reveal-delay-${delayIndex + 1}`);
      } else {
        element.classList.add('scroll-reveal');
      }

      // Observe element
      revealObserver.observe(element);
    });

    // สำหรับ elements ที่ต้องการ staggered animation
    const skillCards = document.querySelectorAll('.skill-card');
    skillCards.forEach((card, index) => {
      const delayIndex = index % 4;
      card.classList.add(`scroll-reveal-delay-${delayIndex + 1}`);
    });

    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach((card, index) => {
      const delayIndex = index % 3;
      card.classList.add(`scroll-reveal-delay-${delayIndex + 1}`);
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();

// ===== Scroll to Top Button =====
(function initScrollToTop() {
  const run = () => {
    const scrollTopBtn = document.querySelector('.scroll-top');
    
    if (!scrollTopBtn) return;

    // ฟังก์ชันแสดง/ซ่อนปุ่มตามการเลื่อน
    const toggleScrollButton = () => {
      if (window.pageYOffset > 300) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    };

    // ฟังก์ชันเลื่อนไปบนสุด
    const scrollToTop = (e) => {
      e.preventDefault();
      // respect user's reduced-motion preference
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({
        top: 0,
        behavior: reduce ? 'auto' : 'smooth'
      });
    };

  // เพิ่ม event listeners (use passive scroll listener for performance)
  window.addEventListener('scroll', toggleScrollButton, { passive: true });
  scrollTopBtn.addEventListener('click', scrollToTop);

    // เรียกใช้ครั้งแรกเพื่อตั้งค่าเริ่มต้น
    toggleScrollButton();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();