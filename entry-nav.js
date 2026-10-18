if (window.top === window.self) {
  const nav = document.createElement('nav');
  nav.className = 'entry-nav';
  nav.setAttribute('aria-label', '项目入口');
  nav.innerHTML = '<a href="./pdf.html">原版 PDF 作品集</a><a href="./index.html">七页网页展示</a>';
  const current = location.pathname.split('/').pop() || 'index.html';
  if (current === 'demo.html') document.body.classList.add('has-entry-nav');
  for (const a of nav.querySelectorAll('a')) {
    if (a.getAttribute('href') === `./${current}`) a.setAttribute('aria-current', 'page');
  }
  document.body.append(nav);
}
