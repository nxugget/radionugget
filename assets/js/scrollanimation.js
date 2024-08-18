document.addEventListener("DOMContentLoaded", function() {
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate');
        observer.unobserve(entry.target); 
      }
    });
  }, { threshold: 0.5 });

  const images = document.querySelectorAll('.inner-content img');
  images.forEach(image => {
    observer.observe(image);
  });
});
