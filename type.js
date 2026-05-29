/*
  โครงสร้าง JS: แยก feature ด้วย IIFE เพื่อกันตัวแปรรั่วไป global scope
  เหมาะกับ static site ที่ยังไม่ใช้ bundler; ถ้าโปรเจกต์ใหญ่ขึ้นค่อยแยกเป็น ES modules ได้
*/

/*
  Theme: อ่าน/บันทึก dark mode ด้วย localStorage และ toggle class บน body
  ข้อดีคือ CSS variables จัดการสีทั้งหมดได้จาก class เดียว และ aria-label/aria-pressed ช่วย accessibility
*/
(function initTheme() {
  const storageKey = "theme";
  const savedTheme = localStorage.getItem(storageKey);
  const initialDark = savedTheme ? savedTheme === "dark" : false;

  const applyTheme = (isDark) => {
    document.body.classList.toggle("dark-mode", isDark);
    document.querySelector(".site-header")?.classList.toggle("dark-mode", isDark);

    const toggle = document.getElementById("toggle-dark");
    if (toggle) {
      toggle.setAttribute("aria-pressed", String(isDark));
      toggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    }
  };

  const run = () => {
    const toggle = document.getElementById("toggle-dark");
    applyTheme(initialDark);

    toggle?.addEventListener("click", () => {
      const nextDark = !document.body.classList.contains("dark-mode");
      applyTheme(nextDark);
      localStorage.setItem(storageKey, nextDark ? "dark" : "light");
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();

/*
  Navigation: smooth scroll พร้อมชดเชย sticky header และตั้ง active nav ด้วย IntersectionObserver
  ระวังอย่าใช้ offset คงที่ เพราะ header สูงไม่เท่ากันบน desktop/mobile
*/
(function initNavigation() {
  const run = () => {
    const navLinks = Array.from(document.querySelectorAll(".navmenu a, .brand, .hero-actions a, .scroll-top"))
      .filter((link) => link.getAttribute("href")?.startsWith("#"));
    const primaryNavLinks = Array.from(document.querySelectorAll(".navmenu a"));
    const sections = primaryNavLinks
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);

    const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const setActive = (id) => {
      primaryNavLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
      });
    };

    navLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        const href = link.getAttribute("href");
        const target = document.querySelector(href);
        if (!target) return;

        event.preventDefault();
        const header = document.querySelector(".site-header");
        const headerHeight = header ? header.offsetHeight : 0;
        const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 12;

        window.scrollTo({
          top: Math.max(0, top),
          behavior: reduceMotion() ? "auto" : "smooth",
        });

        if (target.id) setActive(target.id);
      });
    });

    if ("IntersectionObserver" in window && sections.length) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) setActive(entry.target.id);
          });
        },
        {
          root: null,
          rootMargin: "-38% 0px -52% 0px",
          threshold: 0.01,
        }
      );

      sections.forEach((section) => observer.observe(section));
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();

/*
  Scroll reveal: ใช้ IntersectionObserver แทน scroll event เพื่อลดงานระหว่างเลื่อนหน้า
  ถ้า browser ไม่รองรับ observer จะ reveal ทั้งหมดทันที เพื่อไม่ให้ content หาย
*/
(function initScrollReveal() {
  const run = () => {
    const revealTargets = document.querySelectorAll(`
      .hero-copy,
      .hero-visual,
      .section-heading,
      .project-card,
      .skill-category,
      .timeline li,
      .about-copy,
      .about-photo,
      .contact-panel
    `);

    if (!("IntersectionObserver" in window)) {
      revealTargets.forEach((target) => target.classList.add("revealed"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.12,
      }
    );

    revealTargets.forEach((target, index) => {
      const isCard = target.classList.contains("project-card") || target.classList.contains("skill-category");
      const isPhoto = target.classList.contains("hero-visual") || target.classList.contains("about-photo");

      target.classList.add(isCard ? "scroll-reveal-scale" : isPhoto ? "scroll-reveal-right" : "scroll-reveal");
      target.classList.add(`scroll-reveal-delay-${(index % 4) + 1}`);
      observer.observe(target);
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();

/*
  Scroll to top: แสดงปุ่มเมื่อ scroll ลงมาลึกพอ
  ใช้ passive scroll listener และ query ปุ่มครั้งเดียวเพื่อลดงานซ้ำระหว่าง scroll
*/
(function initScrollToTop() {
  const run = () => {
    const button = document.querySelector(".scroll-top");
    if (!button) return;

    const toggleButton = () => {
      button.classList.toggle("visible", window.scrollY > 520);
    };

    toggleButton();
    window.addEventListener("scroll", toggleButton, { passive: true });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
