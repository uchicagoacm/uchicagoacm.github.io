document.addEventListener('DOMContentLoaded', function () {
  // Section navigation
  const sectionLinks = document.querySelectorAll('.nav-link');
  const contentSections = document.querySelectorAll('.content-section');

  sectionLinks.forEach(function (link) {
    link.addEventListener('click', function (event) {
      event.preventDefault();

      // Update active nav link
      sectionLinks.forEach(function (l) {
        l.classList.remove('active');
      });
      link.classList.add('active');

      // Switch content section with fade
      const targetId = link.getAttribute('data-target');

      contentSections.forEach(function (section) {
        if (section.classList.contains('active')) {
          section.style.opacity = '0';
          setTimeout(function () {
            section.classList.remove('active');
            section.style.opacity = '';

            const target = document.getElementById(targetId);
            if (target) {
              target.classList.add('active');
              // Trigger reflow then fade in
              target.offsetHeight;
              target.style.opacity = '1';
            }
          }, 200);
        }
      });

      // Scroll to top on section change
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  // Initialize: ensure the active section is visible
  const activeSection = document.querySelector('.content-section.active');
  if (activeSection) {
    activeSection.style.opacity = '1';
  }
});
