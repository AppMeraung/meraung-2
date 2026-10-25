document.getElementById("y").textContent = new Date().getFullYear();

// Close the mobile menu after picking a link.
document.querySelectorAll(".menu a").forEach((a) => a.addEventListener("click", () => a.closest("details").removeAttribute("open")));

// Fade sections in once; content stays visible if the observer is unavailable.
if ("IntersectionObserver" in window) {
  document.documentElement.classList.add("js");
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { threshold: 0.05 });
  document.querySelectorAll(".fx").forEach((el) => io.observe(el));

  // Sidebar: highlight the section currently on screen and keep it visible in the mobile strip.
  const side = document.querySelector(".side");
  if (side) {
    const items = [...side.querySelectorAll("a[href^='#']")];
    const spy = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      items.forEach((a) => a.classList.toggle("on", a.hash === "#" + e.target.id));
      const on = side.querySelector("a.on");
      if (on && side.scrollWidth > side.clientWidth) side.scrollTo({ left: on.offsetLeft - 16, behavior: "smooth" });
    }), { rootMargin: "-30% 0px -60% 0px" });
    items.forEach((a) => { const t = document.querySelector(a.hash); if (t) spy.observe(t); });
  }
}
