/*
 * VIPER PERSONAL SITE
 * Passe Namen und Links in SITE_CONFIG an.
 * Danach index.html, style.css und script.js im selben Ordner lassen.
 */

const SITE_CONFIG = {
  displayName: "Viper",
  discordName: "viper.2.0",
  socials: {
    // Ersetze den Discord-Link mit deinem Einladungslink, z. B. https://discord.gg/abcdef
    discord: "https://discord.com/",
    // Diesen Twitch-Link habe ich aus deinem bisherigen HTML übernommen.
    twitch: "https://www.twitch.tv/viper_man_",
    // Ersetze ihn durch deinen Profil-Link, z. B. https://www.tiktok.com/@deinname
    tiktok: "https://www.tiktok.com/"
  }
};

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
const PLATFORM_URLS = {
  discord: "https://discord.com/",
  twitch: "https://www.twitch.tv/",
  tiktok: "https://www.tiktok.com/"
};

function safeExternalUrl(value, fallback) {
  try {
    const url = new URL(String(value));
    return url.protocol === "https:" ? url.href : fallback;
  } catch {
    return fallback;
  }
}

// Name an einer Stelle ändern und alle sichtbaren Stellen synchron halten.
const displayName = String(SITE_CONFIG.displayName || "Viper").trim() || "Viper";
$$(".brand").forEach((brand) => brand.setAttribute("aria-label", `${displayName} Startseite`));
document.title = `${displayName} — Links & Bio`;
const description = $("meta[name='description']");
if (description) {
  description.content = `Die Links und Social-Media-Profile von ${displayName} an einem Ort.`;
}

const heading = $("h1");
if (heading) {
  heading.replaceChildren(document.createTextNode("Hey, ich bin "));
  const nameSpan = document.createElement("span");
  nameSpan.className = "gradient-text";
  nameSpan.textContent = displayName;
  const wave = document.createElement("span");
  wave.className = "wave";
  wave.setAttribute("aria-hidden", "true");
  wave.textContent = "↗";
  heading.append(nameSpan, wave);
}

$$(".brand > span:last-child").forEach((brandText) => {
  brandText.replaceChildren(document.createTextNode(displayName.toUpperCase()));
  const dot = document.createElement("span");
  dot.className = "brand-dot";
  dot.textContent = ".";
  brandText.append(dot);
});

const avatar = $(".avatar span");
if (avatar) avatar.textContent = [...displayName][0]?.toUpperCase() || "V";
const avatarBox = $(".avatar");
if (avatarBox) avatarBox.setAttribute("aria-label", `${displayName} Profilbild-Platzhalter`);

const discordName = String(SITE_CONFIG.discordName || "dein.discordname").trim() || "dein.discordname";
const discordNameLabel = $("#discordNameLabel");
if (discordNameLabel) discordNameLabel.textContent = discordName;

// Social-Links prüfen, damit fehlerhafte oder versehentlich unsichere URLs nicht verwendet werden.
$$("[data-social]").forEach((link) => {
  const key = link.dataset.social;
  const fallback = PLATFORM_URLS[key] || "https://example.com/";
  link.href = safeExternalUrl(SITE_CONFIG.socials?.[key], fallback);
  link.target = "_blank";
  link.rel = "noopener noreferrer";
});

// Lokale Uhrzeit des Seitenbesuchers. Sie zeigt keinen Discord- oder Online-Status an.
const clock = $("#clock");
function updateClock() {
  if (!clock) return;
  clock.textContent = new Intl.DateTimeFormat("de-AT", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(new Date());
}
updateClock();
window.setInterval(updateClock, 1000);

// Kleine, zugängliche Hinweisbox.
let toastTimer = 0;
function toast(message) {
  const toastElement = $("#toast");
  if (!toastElement) return;
  toastElement.textContent = message;
  toastElement.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toastElement.classList.remove("show"), 2600);
}

// Discord-Namen kopieren: Clipboard API bevorzugen, ältere Browser mit Fallback unterstützen.
const copyDiscordButton = $("#copyDiscord");
if (copyDiscordButton) {
  copyDiscordButton.addEventListener("click", async () => {
    try {
      if (navigator.clipboard?.writeText && window.isSecureContext) {
        await navigator.clipboard.writeText(discordName);
        toast("Discord-Name kopiert ✓");
        return;
      }

      const temporaryInput = document.createElement("textarea");
      temporaryInput.value = discordName;
      temporaryInput.setAttribute("readonly", "");
      temporaryInput.style.position = "fixed";
      temporaryInput.style.left = "-9999px";
      document.body.appendChild(temporaryInput);
      temporaryInput.select();
      const copied = document.execCommand("copy");
      temporaryInput.remove();
      toast(copied ? "Discord-Name kopiert ✓" : `Discord-Name: ${discordName}`);
    } catch (error) {
      toast(`Discord-Name: ${discordName}`);
    }
  });
}

// Hell-/Dunkelmodus. Die Website funktioniert auch, wenn localStorage gesperrt ist.
const themeToggle = $("#themeToggle");
const themeMeta = $("meta[name='theme-color']");
function applyTheme(theme, showMessage = false) {
  const isLight = theme === "light";
  document.body.classList.toggle("light", isLight);
  if (themeMeta) themeMeta.content = isLight ? "#eaf2eb" : "#080d0b";
  if (themeToggle) {
    themeToggle.setAttribute("aria-label", isLight ? "Dunkelmodus aktivieren" : "Hellmodus aktivieren");
    themeToggle.title = isLight ? "Dunkelmodus aktivieren" : "Hellmodus aktivieren";
  }
  if (showMessage) toast(isLight ? "Hellmodus aktiviert" : "Dark Mode aktiviert");
}

try {
  applyTheme(localStorage.getItem("viper-theme") === "light" ? "light" : "dark");
} catch {
  applyTheme("dark");
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("light") ? "dark" : "light";
    applyTheme(nextTheme, true);
    try {
      localStorage.setItem("viper-theme", nextTheme);
    } catch {
      // Das Umschalten bleibt aktiv; nur das Merken für den nächsten Besuch geht nicht.
    }
  });
}

// Sanfte Einblendungen: Inhalte bleiben auch ohne JavaScript sichtbar.
if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  $$(".reveal").forEach((element) => observer.observe(element));
} else {
  $$(".reveal").forEach((element) => element.classList.add("in-view"));
}

// Dekorative Hintergrundpartikel. Aus bei reduzierter Bewegung, fehlendem Canvas oder Tab im Hintergrund.
const canvas = $("#particles");
const context = canvas?.getContext?.("2d");
const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
let particles = [];
let canvasWidth = 0;
let canvasHeight = 0;
let animationFrame = 0;

function resizeCanvas() {
  if (!canvas || !context) return;
  const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
  canvasWidth = window.innerWidth;
  canvasHeight = window.innerHeight;
  canvas.width = Math.round(canvasWidth * ratio);
  canvas.height = Math.round(canvasHeight * ratio);
  canvas.style.width = `${canvasWidth}px`;
  canvas.style.height = `${canvasHeight}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  const count = Math.min(36, Math.max(12, Math.floor(canvasWidth / 36)));
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    radius: Math.random() * 1.35 + 0.35,
    velocity: Math.random() * 0.22 + 0.04,
    alpha: Math.random() * 0.4 + 0.1
  }));
}

function drawParticles() {
  if (!context || !canvas || document.hidden || reduceMotion) {
    animationFrame = 0;
    return;
  }
  context.clearRect(0, 0, canvasWidth, canvasHeight);
  for (const particle of particles) {
    particle.y -= particle.velocity;
    if (particle.y < -4) {
      particle.y = canvasHeight + 4;
      particle.x = Math.random() * canvasWidth;
    }
    context.beginPath();
    context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    context.fillStyle = `rgba(183, 255, 74, ${particle.alpha})`;
    context.fill();
  }
  animationFrame = window.requestAnimationFrame(drawParticles);
}

function startParticles() {
  if (!reduceMotion && context && !document.hidden && !animationFrame) {
    animationFrame = window.requestAnimationFrame(drawParticles);
  }
}

if (canvas && context && !reduceMotion) {
  resizeCanvas();
  startParticles();
  window.addEventListener("resize", resizeCanvas, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    } else {
      startParticles();
    }
  });
} else if (canvas) {
  canvas.hidden = true;
}
