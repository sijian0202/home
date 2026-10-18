if (window.top === window.self) {
  const nav = document.createElement('nav');
  nav.className = 'entry-nav';
  nav.setAttribute('aria-label', '项目入口');
  nav.innerHTML = '<a href="./demo.html">直接体验 Demo</a><a href="./design.html">查看设计过程</a>';
  const current = location.pathname.split('/').pop();
  if (current === 'demo.html') document.body.classList.add('has-entry-nav');
  for (const a of nav.querySelectorAll('a')) {
    if (a.getAttribute('href') === `./${current}`) a.setAttribute('aria-current', 'page');
  }
  document.body.append(nav);
}
