document.querySelectorAll('.team-portrait').forEach(button => {
  button.addEventListener('click', () => {
    const active = button.getAttribute('aria-pressed') === 'true';
    button.setAttribute('aria-pressed', String(!active));
  });
});
