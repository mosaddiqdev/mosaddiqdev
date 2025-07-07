let portfolioContent = null;

// DOM elements
const projectsContainer = document.getElementById("projects-container");
const skillsContainer = document.getElementById("skills-container");

// Load content from JSON file
async function loadContent() {
  try {
    const response = await fetch("./src/data/content.json");
    portfolioContent = await response.json();
    return true;
  } catch (error) {
    console.error("Failed to load content:", error);
    return false;
  }
}

// Preloader handling
function hidePreloader() {
  const preloader = document.getElementById("preloader");
  if (preloader) {
    preloader.style.opacity = "0";
    setTimeout(() => {
      preloader.style.display = "none";
    }, 500);
  }
}

// Ensure page always starts at top - good UX for portfolio sites
if (history.scrollRestoration) {
  history.scrollRestoration = "manual";
}

// Immediate scroll reset - happens before any content is visible
window.scrollTo(0, 0);

// Main initialization
document.addEventListener("DOMContentLoaded", async () => {
  const contentLoaded = await loadContent();

  if (contentLoaded) {
    populateContent();
    loadProjects();
    loadSkills();
  }
  setupScrollAnimations();
  setupSmoothScrolling();

  initDynamicTextSizing();
  initSmartNavigation();
  initButtonInteractions();
  initProfileImageHover();
  initMouseFollower();
  initMobileNavigation();

  setTimeout(hidePreloader, 600);
});
// Mobile navigation setup
function initMobileNavigation() {
  const hamburgerMenu = document.getElementById("hamburger-menu");
  const mobileNavMenu = document.getElementById("mobile-nav-menu");
  const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");

  if (!hamburgerMenu || !mobileNavMenu) return;

  let isMenuOpen = false;

  function toggleMobileMenu() {
    isMenuOpen = !isMenuOpen;

    hamburgerMenu.classList.toggle("active", isMenuOpen);
    mobileNavMenu.classList.toggle("active", isMenuOpen);

    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    hamburgerMenu.setAttribute("aria-expanded", isMenuOpen.toString());
  }

  function closeMobileMenu() {
    if (isMenuOpen) {
      isMenuOpen = false;
      hamburgerMenu.classList.remove("active");
      mobileNavMenu.classList.remove("active");
      document.body.style.overflow = "";
      hamburgerMenu.setAttribute("aria-expanded", "false");
    }
  }

  hamburgerMenu.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleMobileMenu();
  });

  mobileNavLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeMobileMenu();
    });
  });
  document.addEventListener("click", (e) => {
    if (
      isMenuOpen &&
      !mobileNavMenu.contains(e.target) &&
      !hamburgerMenu.contains(e.target)
    ) {
      closeMobileMenu();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isMenuOpen) {
      closeMobileMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 767 && isMenuOpen) {
      closeMobileMenu();
    }
  });
  // Touch handling for mobile swipe to close
  let touchStartY = 0;

  mobileNavMenu.addEventListener(
    "touchstart",
    (e) => {
      touchStartY = e.touches[0].clientY;
    },
    { passive: true }
  );

  mobileNavMenu.addEventListener(
    "touchmove",
    (e) => {
      const touchY = e.touches[0].clientY;
      const deltaY = touchY - touchStartY;

      if (deltaY < -50) {
        closeMobileMenu();
      }
    },
    { passive: true }
  );
}
// Content population from JSON
function populateContent() {
  if (!portfolioContent) return;

  document.title = portfolioContent.meta.title;
  document.querySelector('meta[name="description"]').content =
    portfolioContent.meta.description;
  document.getElementById("nav-brand").textContent =
    portfolioContent.navigation.brand;

  const navLinks = document.getElementById("nav-links");
  const mobileNavLinks = document.getElementById("mobile-nav-links");
  const navIndicator = navLinks.querySelector(".nav-indicator");

  navLinks.innerHTML = "";
  mobileNavLinks.innerHTML = "";

  portfolioContent.navigation.links.forEach((link) => {
    const desktopLink = document.createElement("a");
    desktopLink.href = link.href;
    desktopLink.className = "nav-link nav-transition focus";
    desktopLink.setAttribute("data-section", link.section);
    desktopLink.textContent = link.text;
    navLinks.appendChild(desktopLink);

    const mobileLink = document.createElement("a");
    mobileLink.href = link.href;
    mobileLink.className = "mobile-nav-link nav-transition focus";
    mobileLink.setAttribute("data-section", link.section);
    mobileLink.textContent = link.text;
    mobileNavLinks.appendChild(mobileLink);
  });

  navLinks.appendChild(navIndicator);

  const profileImageMain = document.getElementById("profile-image-main");
  const profileImageHover = document.getElementById("profile-image-hover");

  profileImageMain.src = portfolioContent.hero.profileImage.default;
  profileImageMain.alt = portfolioContent.hero.profileImage.alt;
  profileImageHover.src = portfolioContent.hero.profileImage.hover;
  profileImageHover.alt = portfolioContent.hero.profileImage.alt;

  document.querySelector("h1").innerHTML = `
    ${portfolioContent.hero.title}<br />
    <span class="text-sage-400">${portfolioContent.hero.subtitle}</span>
  `;

  document.querySelector(".text-xl.text-zinc-300.mb-10").textContent =
    portfolioContent.hero.description;

  document.querySelector("#work h2").textContent = portfolioContent.work.title;
  document.querySelector("#about h2").textContent =
    portfolioContent.about.title;
  document.querySelector("#contact h2").textContent =
    portfolioContent.contact.title;

  const aboutContainer = document.querySelector("#about .space-y-8");
  const aboutParagraphs = aboutContainer.querySelectorAll("p.text-lg");

  portfolioContent.about.story.forEach((story, index) => {
    if (aboutParagraphs[index]) {
      aboutParagraphs[index].innerHTML = story.paragraph;
    }
  });

  // Target specific skills title (not the highlighted text in paragraph)
  document.querySelector("#about .pt-8.border-t h3.text-sage-400").textContent =
    portfolioContent.about.skills.title;

  const currentlyTitle = document.querySelector(
    "#about .pt-8:not(.border-t) h3.text-sage-400"
  );
  currentlyTitle.textContent = portfolioContent.about.currentStatus.title;

  const currentStatusList = document.getElementById("current-status-list");
  currentStatusList.innerHTML = "";
  portfolioContent.about.currentStatus.items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = `• ${item}`;
    currentStatusList.appendChild(li);
  });

  document.querySelector("#contact p.text-xl").textContent =
    portfolioContent.contact.description;

  const lookingForTitle = document.querySelector("#contact .space-y-8 h3");
  lookingForTitle.textContent = portfolioContent.contact.lookingFor.title;

  const lookingForList = document.getElementById("looking-for-list");
  lookingForList.innerHTML = "";
  portfolioContent.contact.lookingFor.items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = `• ${item}`;
    lookingForList.appendChild(li);
  });

  const getInTouchTitle = document.querySelector(
    "#contact .space-y-8 div:last-child h3"
  );
  getInTouchTitle.textContent = portfolioContent.contact.getInTouch.title;

  document.querySelector("#primary-btn").textContent =
    portfolioContent.hero.cta.primary;
  document.querySelector(".arrow-animate").innerHTML =
    `${portfolioContent.hero.cta.secondary} <span class="arrow">→</span>`;

  document.querySelector("#contact-btn").textContent =
    portfolioContent.contact.cta.primary;
  document.querySelector('a[href*="github.com"]').textContent =
    portfolioContent.contact.cta.secondary;

  const locationInfo = document.getElementById("location-info");
  locationInfo.innerHTML = `
    <p><strong>Location:</strong> ${portfolioContent.contact.location.location}</p>
    <p><strong>Availability:</strong> ${portfolioContent.contact.location.availability}</p>
    <p><strong>Time Zone:</strong> ${portfolioContent.contact.location.timezone}</p>
  `;

  document.querySelector('a[href^="mailto:"]').href =
    `mailto:${portfolioContent.contact.links.email}`;
  document.querySelector('a[href*="github.com"]').href =
    portfolioContent.contact.links.github;
}

// Project rendering
function loadProjects() {
  if (!portfolioContent) return;

  portfolioContent.projects.items.forEach((project, index) => {
    const projectElement = createProjectElement(project, index);
    projectsContainer.appendChild(projectElement);
  });
}

function createProjectElement(project, index) {
  const projectDiv = document.createElement("div");
  projectDiv.className = `project-card p-8 rounded-lg fade-in delay-${Math.min(
    index + 2,
    5
  )}`;

  projectDiv.innerHTML = `
        <div class="flex items-start justify-between mb-6">
            <div>
                <h3 class="font-serif text-2xl font-medium text-zinc-100 mb-2">${
                  project.title
                }</h3>
                <p class="text-sage-400 font-medium">${project.subtitle}</p>
            </div>
            <span class="text-sm text-zinc-500 font-mono bg-zinc-900 px-3 py-1 rounded">${
              project.year
            }</span>
        </div>

        <p class="text-zinc-300 mb-8 leading-relaxed">${project.description}</p>

        ${
          project.preview_image
            ? `
        <div class="mb-8">
            <div class="relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/50">
                <img
                    src="${project.preview_image}"
                    alt="${project.title} Preview"
                    class="w-full h-auto object-cover project-preview-image"
                    loading="lazy"
                />
            </div>
        </div>
        `
            : `
        <div class="mb-8">
            <h4 class="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wide">Key Features</h4>
            <ul class="space-y-3">
                ${project.highlights
                  .map(
                    (highlight) => `
                    <li class="text-zinc-400 flex items-start">
                        <span class="w-1.5 h-1.5 bg-sage-400 rounded-full mt-2.5 mr-4 flex-shrink-0"></span>
                        <span class="leading-relaxed">${highlight}</span>
                    </li>
                `
                  )
                  .join("")}
            </ul>
        </div>
        `
        }

        <div class="flex flex-wrap gap-2 mb-8">
            ${project.technologies
              .map(
                (tech) => `
                <span class="text-xs text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-full tech-tag">${tech}</span>
            `
              )
              .join("")}
        </div>

        <div class="flex items-center space-x-6">
            ${
              project.links.live
                ? `
                <a href="${project.links.live}" target="_blank" rel="noopener noreferrer"
                   class="text-sage-400 hover:text-sage-300 font-medium link-underline focus-spacing">
                    Live Demo ↗
                </a>
            `
                : ""
            }
            <a href="${
              project.links.github
            }" target="_blank" rel="noopener noreferrer"
               class="text-zinc-400 hover:text-zinc-300 font-medium link-underline focus-spacing">
                GitHub ↗
            </a>
        </div>
    `;

  return projectDiv;
}

function loadSkills() {
  if (!portfolioContent) return;

  portfolioContent.skills.forEach((skill, index) => {
    const skillElement = createSkillElement(skill, index);
    skillsContainer.appendChild(skillElement);
  });
}

function createSkillElement(skill) {
  const skillDiv = document.createElement("div");
  skillDiv.className = "border-l-2 border-sage-400 pl-4 py-2 skill-tag";

  skillDiv.innerHTML = `
        <h4 class="text-sm font-semibold text-zinc-300 mb-1">${skill.name}</h4>
        <p class="text-xs text-zinc-500 leading-relaxed">${skill.description}</p>
    `;

  return skillDiv;
}

function setupScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -100px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = "running";
      }
    });
  }, observerOptions);

  const fadeElements = document.querySelectorAll(".fade-in");
  fadeElements.forEach((element) => {
    element.style.animationPlayState = "paused";
    observer.observe(element);
  });
}

function setupSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        const offsetTop = target.offsetTop - 120;
        window.scrollTo({
          top: offsetTop,
          behavior: "smooth",
        });
      }
    });
  });
}

// Smart navigation with scroll detection and active section highlighting
function initSmartNavigation() {
  const navbar = document.getElementById("navbar");
  const navLinks = document.querySelectorAll(".nav-link");
  const navIndicator = document.getElementById("nav-indicator");
  const sections = document.querySelectorAll("section[id]");

  let lastScrollY = window.scrollY;
  let isScrollingDown = false;

  setupSmoothScrolling();
  setupLogoClick();
  setupScrollSpy();
  setupScrollDirection();
  setupMouseProximity();
  setInitialActiveSection();

  function setupSmoothScrolling() {
    navLinks.forEach((link) => {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        const targetId = this.getAttribute("data-section");
        const targetSection = document.getElementById(targetId);

        if (targetSection) {
          const offsetTop = targetSection.offsetTop - 100;
          window.scrollTo({
            top: offsetTop,
            behavior: "smooth",
          });
        }
      });
    });
  }

  function setupLogoClick() {
    const navBrand = document.querySelector(".nav-brand");
    navBrand.addEventListener("click", (e) => {
      e.preventDefault();
      const heroSection = document.getElementById("hero");
      if (heroSection) {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
        navLinks.forEach((link) => {
          link.classList.remove("active");
        });
        navIndicator.classList.remove("show");
      }
    });
  }

  function setupScrollSpy() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id;
            setActiveNavLink(sectionId);
          }
        });
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: 0,
      }
    );

    sections.forEach((section) => {
      observer.observe(section);
    });
  }

  function setActiveNavLink(sectionId) {
    navLinks.forEach((link) => {
      link.classList.remove("active");
    });

    if (sectionId === "hero") {
      navIndicator.classList.remove("show");
      return;
    }

    const activeLink = document.querySelector(`[data-section="${sectionId}"]`);
    if (activeLink) {
      activeLink.classList.add("active");
      updateIndicator(activeLink);
    } else {
      navIndicator.classList.remove("show");
    }
  }

  function updateIndicator(activeLink) {
    const navLinksContainer = document.getElementById("nav-links");
    const linkRect = activeLink.getBoundingClientRect();
    const containerRect = navLinksContainer.getBoundingClientRect();

    const left = linkRect.left - containerRect.left;
    const width = linkRect.width;

    navIndicator.style.left = `${left}px`;
    navIndicator.style.width = `${width}px`;
    navIndicator.classList.add("show");
  }

  // Hide/show navbar based on scroll direction
  function setupScrollDirection() {
    let ticking = false;

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            handleScroll();
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  function handleScroll() {
    const currentScrollY = window.scrollY;
    const scrollDifference = currentScrollY - lastScrollY;

    // Only update direction if scroll is significant enough to avoid jitter
    if (Math.abs(scrollDifference) > 5) {
      isScrollingDown = scrollDifference > 0;
    }

    updateNavbarOpacity(currentScrollY);

    if (currentScrollY > 100) {
      if (isScrollingDown) {
        navbar.style.transform = "translateX(-50%) translateY(-100%)";
      } else {
        navbar.style.transform = "translateX(-50%) translateY(0)";
      }
    } else {
      navbar.style.transform = "translateX(-50%) translateY(0)";
    }

    lastScrollY = currentScrollY;
  }

  function updateNavbarOpacity(scrollY) {
    const navContent = navbar.querySelector(".nav-content");
    const scrollDepth = Math.min(scrollY / 300, 1);
    const opacity = 0.75 + scrollDepth * 0.2;
    const blurAmount = 20 + scrollDepth * 5;

    navContent.style.background = `rgba(9, 9, 11, ${opacity})`;
    navContent.style.backdropFilter = `blur(${blurAmount}px) saturate(180%)`;
    navContent.style.webkitBackdropFilter = `blur(${blurAmount}px) saturate(180%)`;
  }

  function setupMouseProximity() {
    document.addEventListener("mousemove", (e) => {
      if (e.clientY < 100 && window.scrollY > 100) {
        navbar.style.transform = "translateX(-50%) translateY(0)";
      }
    });
  }

  function setInitialActiveSection() {
    navLinks.forEach((link) => {
      link.classList.remove("active");
    });
    navIndicator.classList.remove("show");
  }

  window.addEventListener("resize", () => {
    const activeLink = document.querySelector(".nav-link.active");
    if (activeLink) {
      updateIndicator(activeLink);
    }
  });
}

// Dynamic text sizing based on scroll position
function initDynamicTextSizing() {
  const heroHeading = document.querySelector("h1");
  const sectionHeadings = document.querySelectorAll("h2");

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  function updateTextSizing() {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;

    const heroProgress = Math.min(scrollY / (windowHeight * 0.5), 1);
    const heroScale = 1 - heroProgress * 0.08;

    heroHeading.style.transform = `scale(${heroScale})`;
    heroHeading.style.transformOrigin = "left top";
    heroHeading.style.willChange = "transform";

    sectionHeadings.forEach((heading) => {
      const rect = heading.getBoundingClientRect();
      const isInView =
        rect.top < windowHeight * 0.8 && rect.bottom > windowHeight * 0.2;

      if (isInView) {
        const viewProgress = Math.max(
          0,
          Math.min(1, (windowHeight * 0.8 - rect.top) / (windowHeight * 0.6))
        );
        const scale = 1 + viewProgress * 0.03;

        heading.style.transform = `scale(${scale})`;
        heading.style.transformOrigin = "left center";
        heading.style.transition =
          "transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
        heading.style.willChange = "transform";
      } else {
        heading.style.transform = "scale(1)";
      }
    });
  }

  let ticking = false;
  let lastScrollY = 0;

  function handleScroll() {
    const currentScrollY = window.scrollY;

    if (Math.abs(currentScrollY - lastScrollY) < 2) return;

    if (!ticking) {
      requestAnimationFrame(() => {
        updateTextSizing();
        lastScrollY = currentScrollY;
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener("scroll", handleScroll, { passive: true });

  updateTextSizing();
}

// Button hover and interaction effects
function initButtonInteractions() {
  const supportsHover = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  ).matches;

  const hoverButtons = document.querySelectorAll(".btn-hover");

  hoverButtons.forEach((button) => {
    if (!supportsHover) {
      button.addEventListener("touchstart", () => {
        button.style.opacity = "0.8";
      });

      button.addEventListener("touchend", () => {
        button.style.opacity = "1";
      });

      return;
    }

    let isHovering = false;

    let animationId = null;
    let targetX = 0;
    let targetY = 0;
    let targetRotation = 0;
    let currentX = 0;
    let currentY = 0;
    let currentRotation = 0;

    function smoothUpdate() {
      const ease = 0.12;

      currentX += (targetX - currentX) * ease;
      currentY += (targetY - currentY) * ease;
      currentRotation += (targetRotation - currentRotation) * ease;

      button.style.transform = `translate(${currentX}px, ${currentY}px) rotate(${currentRotation}deg)`;

      if (
        Math.abs(targetX - currentX) > 0.1 ||
        Math.abs(targetY - currentY) > 0.1 ||
        Math.abs(targetRotation - currentRotation) > 0.1
      ) {
        animationId = requestAnimationFrame(smoothUpdate);
      } else {
        animationId = null;
      }
    }

    button.addEventListener("mouseenter", () => {
      isHovering = true;
      button.style.transition = "none";
    });

    button.addEventListener("mousemove", (e) => {
      if (!isHovering) return;

      const rect = button.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const x = e.clientX - centerX;
      const y = e.clientY - centerY;

      const distance = Math.sqrt(x * x + y * y);
      const maxDistance = 80;

      if (distance < maxDistance) {
        const strength = Math.pow((maxDistance - distance) / maxDistance, 1.2);

        targetX = x * strength * 0.3;
        targetY = y * strength * 0.3;
        targetRotation = Math.atan2(y, x) * (180 / Math.PI) * 0.02;
      } else {
        targetX = 0;
        targetY = 0;
        targetRotation = 0;
      }

      if (!animationId) {
        animationId = requestAnimationFrame(smoothUpdate);
      }
    });

    button.addEventListener("mouseleave", () => {
      isHovering = false;
      targetX = 0;
      targetY = 0;
      targetRotation = 0;

      if (!animationId) {
        animationId = requestAnimationFrame(smoothUpdate);
      }
    });
  });

  const arrowLinks = document.querySelectorAll(".arrow-animate");

  arrowLinks.forEach((link) => {
    link.addEventListener("mouseenter", () => {
      link.style.transform = "translateY(-1px)";
    });

    link.addEventListener("mouseleave", () => {
      link.style.transform = "translateY(0)";
    });
  });

  const interactiveButtons = document.querySelectorAll(".btn-lift, .btn-hover");

  interactiveButtons.forEach((button) => {
    button.addEventListener("focus", () => {
      button.style.transform = "translateY(-1px)";
    });

    button.addEventListener("blur", () => {
      button.style.transform = "translateY(0)";
    });
  });
}

// Profile image crossfade hover effect
function initProfileImageHover() {
  const profileContainer = document.getElementById("profile-container");

  if (!profileContainer) return;

  const supportsHover = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  ).matches;
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (!supportsHover || prefersReducedMotion) {
    profileContainer.addEventListener("touchstart", () => {
      profileContainer.classList.add("hover-active");
    });

    profileContainer.addEventListener("touchend", () => {
      setTimeout(() => {
        profileContainer.classList.remove("hover-active");
      }, 2000);
    });

    return;
  }

  let animationFrame;
  let isInHoverField = false;
  let isAttracting = false;

  const HOVER_RADIUS = 120;
  const ATTRACTION_RADIUS = 60;
  const ATTRACTION_STRENGTH = 0.15;

  function getProfileCenter() {
    const rect = profileContainer.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  }

  function getDistance(mouseX, mouseY, centerX, centerY) {
    return Math.sqrt(
      Math.pow(mouseX - centerX, 2) + Math.pow(mouseY - centerY, 2)
    );
  }

  function attractCursor(mouseX, mouseY, centerX, centerY, distance) {
    const normalizedDistance = Math.max(
      0,
      (distance - ATTRACTION_RADIUS) / (HOVER_RADIUS - ATTRACTION_RADIUS)
    );
    const force = 1 - Math.pow(normalizedDistance, 2);

    const targetX =
      centerX + (mouseX - centerX) * (1 - force * ATTRACTION_STRENGTH);
    const targetY =
      centerY + (mouseY - centerY) * (1 - force * ATTRACTION_STRENGTH);

    const currentX = mouseX;
    const currentY = mouseY;

    const newX = currentX + (targetX - currentX) * 0.3;
    const newY = currentY + (targetY - currentY) * 0.3;

    const fakeEvent = new MouseEvent("mousemove", {
      clientX: newX,
      clientY: newY,
      bubbles: true,
    });

    document.dispatchEvent(fakeEvent);

    return { x: newX, y: newY };
  }

  function handleMouseMove(e) {
    const center = getProfileCenter();
    const distance = getDistance(e.clientX, e.clientY, center.x, center.y);

    if (distance <= HOVER_RADIUS) {
      if (!isInHoverField) {
        isInHoverField = true;
        profileContainer.classList.add("hover-field");
      }

      if (distance <= ATTRACTION_RADIUS) {
        if (!isAttracting) {
          isAttracting = true;
          profileContainer.classList.add("hover-active");
          document.body.classList.add("cursor-hidden");
        }

        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }

        animationFrame = requestAnimationFrame(() => {
          attractCursor(e.clientX, e.clientY, center.x, center.y, distance);
        });
      } else {
        isAttracting = false;
        profileContainer.classList.remove("hover-active");
        document.body.classList.remove("cursor-hidden");
      }
    } else {
      if (isInHoverField) {
        isInHoverField = false;
        isAttracting = false;
        profileContainer.classList.remove("hover-field", "hover-active");
        document.body.classList.remove("cursor-hidden");

        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
      }
    }
  }

  document.addEventListener("mousemove", handleMouseMove, { passive: true });

  window.addEventListener("beforeunload", () => {
    document.removeEventListener("mousemove", handleMouseMove);
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  });
}

// Mouse follower effect
function initMouseFollower() {
  const supportsHover = window.matchMedia(
    "(hover: hover) and (pointer: fine)"
  ).matches;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (!supportsHover || prefersReducedMotion) {
    return;
  }

  let isVisible = false;

  function updateMousePosition(e) {
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    document.documentElement.style.setProperty("--mouse-x", `${mouseX}px`);
    document.documentElement.style.setProperty("--mouse-y", `${mouseY}px`);

    if (!isVisible) {
      isVisible = true;
      document.body.classList.add("mouse-active");
    }
  }

  function initializePosition() {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    document.documentElement.style.setProperty("--mouse-x", `${centerX}px`);
    document.documentElement.style.setProperty("--mouse-y", `${centerY}px`);
  }

  initializePosition();

  document.addEventListener("mousemove", updateMousePosition);

  document.addEventListener("mouseleave", () => {
    isVisible = false;
    document.body.classList.remove("mouse-active");
  });

  document.addEventListener("mouseenter", () => {
    if (!isVisible) {
      isVisible = true;
      document.body.classList.add("mouse-active");
    }
  });

  setTimeout(() => {
    document.body.classList.add("mouse-active");
  }, 1000);
  window.addEventListener("beforeunload", () => {
    document.removeEventListener("mousemove", updateMousePosition);
  });
}
