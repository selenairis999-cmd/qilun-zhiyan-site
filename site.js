const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

function setupDemo(bench) {
  const tabs = [...bench.querySelectorAll("[data-step]")];
  const panels = [...bench.querySelectorAll(".bench-panel")];
  const tabList = bench.querySelector(".bench-tabs");
  const marker = bench.querySelector(".tab-marker");
  let selected = -1;

  tabList.setAttribute("role", "tablist");
  tabs.forEach((tab, index) => {
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-controls", panels[index].id);
    panels[index].setAttribute("role", "tabpanel");
    panels[index].tabIndex = 0;
  });

  function positionMarker() {
    const tab = tabs[selected];
    if (!tab) return;
    marker.style.setProperty("--tab-left", tab.offsetLeft + "px");
    marker.style.setProperty("--tab-width", tab.offsetWidth + "px");
  }

  function select(index, focus = false) {
    if (index === selected) return;
    const wasReady = selected !== -1;
    selected = index;
    tabs.forEach((tab, i) => {
      const active = index === i;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      panels[i].hidden = !active;
    });
    positionMarker();

    if (wasReady && !motion.matches) {
      panels[index].animate(
        [{ opacity: 0.45, transform: "translateY(7px)" }, { opacity: 1, transform: "translateY(0)" }],
        { duration: 280, easing: "cubic-bezier(.22, 1, .36, 1)" }
      );
    }
    if (focus) tabs[index].focus();
  }

  function fromHash() {
    const index = panels.findIndex(panel => "#" + panel.id === location.hash);
    if (index !== -1) select(index);
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", event => {
      event.preventDefault();
      select(index);
    });
    tab.addEventListener("keydown", event => {
      const next = {
        ArrowRight: (index + 1) % tabs.length,
        ArrowLeft: (index + tabs.length - 1) % tabs.length,
        Home: 0,
        End: tabs.length - 1
      }[event.key];
      if (next === undefined) return;
      event.preventDefault();
      select(next, true);
    });
  });

  bench.classList.add("is-interactive");
  fromHash();
  if (selected === -1) select(0);
  if ("ResizeObserver" in window) new ResizeObserver(positionMarker).observe(tabList);
  window.addEventListener("hashchange", fromHash);
}

const bench = document.querySelector("[data-demo]");
if (bench) setupDemo(bench);

if ("IntersectionObserver" in window && !motion.matches) {
  const reveal = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("is-visible");
      reveal.unobserve(entry.target);
    }
  }, { threshold: 0.10 });

  document.querySelectorAll("[data-reveal]").forEach(element => {
    if (element.getBoundingClientRect().top < window.innerHeight) return;
    element.classList.add("will-reveal");
    reveal.observe(element);
  });
}
