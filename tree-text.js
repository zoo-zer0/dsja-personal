document.addEventListener("DOMContentLoaded", () => {
  // Fade for .explanation (already in your code)
  const treeSection = document.querySelector("#tree-section");
  const explanation = document.querySelector(".explanation");

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          explanation.classList.add("visible");
        } else {
          explanation.classList.remove("visible");
        }
      });
    },
    { threshold: 0.1 }
  );

  sectionObserver.observe(treeSection);

  const steps = document.querySelectorAll(".step");

  const stepObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        } 
      });
    },
    { 
        root: null,
        rootMargin: "-60% 0px -50% 0px",
        threshold: 0 
    } // Show step when 50% in view
  );

  steps.forEach(step => stepObserver.observe(step));
});
