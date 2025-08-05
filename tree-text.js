document.addEventListener("DOMContentLoaded", () => {
  const treeSection = document.querySelector("#tree-section");
  const explanation = document.querySelector(".tree-explanation");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          explanation.classList.add("visible");
        } else {
          explanation.classList.remove("visible");
        }
      });
    },
    { threshold: 0.1 } // triggers when 10% of section is visible
  );

  observer.observe(treeSection);
});