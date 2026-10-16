const demo = document.getElementById('app');
const device = document.createElement('div');
device.className = 'device-frame';
demo.before(device);
device.append(demo);
const chrome = document.createElement('div');
chrome.className = 'device-chrome';
chrome.setAttribute('aria-hidden', 'true');
chrome.innerHTML = `<div class="device-status"><span class="device-clock">9:41</span><div class="device-island"><span></span></div><div class="device-status-icons"><span class="device-signal"><i></i><i></i><i></i><i></i></span><svg class="device-wifi" width="17" height="13" viewBox="0 0 20 15" fill="none"><path d="M2 5C6.4 1.2 13.6 1.2 18 5M5 8C7.7 5.7 12.3 5.7 15 8M8 11C9.1 10.1 10.9 10.1 12 11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="10" cy="14" r="1" fill="currentColor"/></svg><span class="device-battery"><i></i></span></div></div><span class="device-volume device-volume-one"></span><span class="device-volume device-volume-two"></span><span class="device-power"></span><span class="device-home"></span>`;
device.append(chrome);
const entry = document.createElement('div');
entry.className = 'demo-entry';
const entryPaper = document.createElement('button');
entryPaper.type = 'button';
entryPaper.className = 'demo-entry-paper';
entryPaper.setAttribute('aria-label', '体验，从点击这里开始');
entryPaper.innerHTML = '<span class="demo-entry-copy"><span class="demo-entry-title">体验</span><span class="demo-entry-subtitle">从点击这里开始</span></span>';
entry.append(entryPaper);
device.append(entry);
demo.inert = true;
entryPaper.addEventListener('click', () => {
  if (entry.classList.contains('is-leaving')) return;
  entry.classList.add('is-leaving');
  entryPaper.disabled = true;
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    entry.remove();
    demo.inert = dialog.open;
    if (!dialog.open) demo.querySelector('button')?.focus({ preventScroll: true });
  };
  entryPaper.addEventListener('transitionend', event => {
    if (event.propertyName === 'transform') finish();
  });
  // Reduced-motion and background tabs may not dispatch transitionend.
  setTimeout(finish, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 760);
});
const rules = [
  ['匿名与私密', '匿名的是提问者身份', '普通用户看不到提问者身份，回答则归属于回答者账号。匿名控制身份展示，私密控制内容可见范围，两者相互独立。'],
  ['邀请与参与', '邀请表达期待，公开允许更多回应', '选择已关注的人发出邀请，受邀者在“收到”中看到问题。其他用户也能在公开浏览路径中回答公开问题，但不会因此收到邀请。'],
  ['卡片归属', '我的回答，只属于当前账号', '问题卡承载提问；卡二始终展示当前账号的回答；卡三组织其他人的回答与回复。尚未回答时，不生成空白的本人回答卡。'],
  ['个人与广场', '三条路径，对应三种任务', '“收到”用于回应邀请，“发出”用于查看自己提出的问题与回应。关注广场聚合关注对象参与的公开已回答问答，列表展示已关注用户。'],
  ['权限与边界', '更换入口，不改变内容权限', '本人回答仅由本人修改。私密问答不进入广场或他人公开主页；对外主页只展示该用户回答过的公开问题，不展示其发出的所有问题。'],
  ['备注与分享', '关系与内容，都有明确去向', '提问对象优先显示备注，没有备注则显示昵称。主页链接定位用户，问题链接只定位对应问答。数据导出生成个人记录文档，不提供重新导入。'],
];
function ruleMarkup() {
  return rules.map(([label, title, body], index) => `<details class="project-rule" ${index === 0 ? 'open' : ''}><summary><span class="project-rule-index">0${index + 1}</span><span>${label}</span><span class="project-rule-plus" aria-hidden="true">+</span></summary><div class="project-rule-body"><h3>${title}</h3><p>${body}</p></div></details>`).join('');
}
const left = document.createElement('aside');
left.className = 'project-rail project-intro';
left.setAttribute('aria-label', '项目介绍');
const barcode = Array.from({ length: 57 }, (_, index) => `<i style="width:${[1, 2, 1, 3, 2, 1, 1][index % 7]}px"></i>`).join('');
left.innerHTML = `<header class="receipt-header"><div><p class="receipt-kicker">一款属于你的<br>匿名提问箱 APP</p><h1><span class="receipt-my">我的</span><span class="receipt-brand">匿名提问箱</span></h1></div><div class="receipt-meta"><p>NO.01 / APP 作品集</p><div class="receipt-barcode" role="img" aria-label="小票风格装饰条码">${barcode}</div><p class="receipt-author">四件 / 产品设计</p></div></header><p class="receipt-lede">一个可以匿名提问并真诚交流的空间。<br>在这里，你可以放心发问，也可以认真回答。<br>每一个问题，都可能是他人想问却不敢问的。</p><ol class="receipt-journey" aria-label="核心体验路径"><li><span>01</span>提问</li><li><span>02</span>收到</li><li><span>03</span>回答</li><li><span>04</span>交流</li></ol><div class="receipt-action-row"><a class="project-store" href="https://apps.apple.com/cn/app/id6797835962" target="_blank" rel="noopener noreferrer"><span class="receipt-arrow" aria-hidden="true">↗</span><span>查看正式 App<small>已上线 App Store</small></span></a><p>匿名提问 · 真诚交流 · 温柔回应</p></div><div class="receipt-tear"><span>QUESTION BOX</span><span>向下阅读 / 产品规则</span></div>`;
const right = document.createElement('aside');
right.className = 'project-rail project-rules';
right.setAttribute('aria-label', '产品规则');
right.innerHTML = `<p class="project-kicker">规则与设计思路 / PRODUCT RULES</p><h2 class="project-rail-title">每一种表达，<br>都有清楚的边界。</h2><div>${ruleMarkup()}</div><section class="project-section receipt-experience"><h2>先体验这几步</h2><ol><li>在“收到 / 发出”间切换，查看两种角色。</li><li>点开问题，浏览并尝试回答。</li><li>到广场查看列表与他人主页。</li><li>点击“提问”，选择发送对象。</li></ol></section><section class="project-section"><h2>从设计到可运行体验</h2><p>围绕匿名表达、邀请回答与公开参与，探索内容层级、账号归属和私密边界。</p><p>通过 Figma 设计与 Codex、Claude 辅助实现，持续校准界面、交互和产品规则。</p></section><section class="project-section project-demo-note"><h2>你正在体验演示版</h2><p>默认账号为 VV，使用本地 Mock 数据。刷新恢复初始内容，不影响正式账号，不同设备的数据不共享。</p><p>正式 App 的功能与限制以商店当前版本为准。</p></section><footer class="receipt-footer"><p>团队项目 · 交互设计与 Vibe Coding 实践</p><p>THANK YOU FOR READING</p><span>让问题自然展开，让不同的回答被看见。</span></footer>`;
const mobileBar = document.createElement('header');
mobileBar.className = 'project-mobile-bar';
mobileBar.innerHTML = '<span>作品演示 / 四件</span><button type="button" class="project-open" aria-haspopup="dialog">产品说明 <span aria-hidden="true">↗</span></button>';
const dialog = document.createElement('dialog');
dialog.className = 'project-dialog';
dialog.setAttribute('aria-labelledby', 'project-dialog-title');
dialog.innerHTML = `<div class="project-dialog-head"><h2 id="project-dialog-title">关于这个作品</h2><button type="button" class="project-close" aria-label="关闭项目说明">×</button></div><div class="project-dialog-content"><p class="project-kicker">我的匿名提问箱</p><p class="project-dialog-intro">邀请想听到的人回答，也允许公开问题获得更多回应。</p><a class="project-store" href="https://apps.apple.com/cn/app/id6797835962" target="_blank" rel="noopener noreferrer">查看已上线的 App ↗</a><h3 class="project-dialog-subtitle">产品规则</h3>${ruleMarkup()}<section class="project-section"><h3>设计与实现</h3><p>本项目结合产品规则、信息架构与交互设计，通过 Figma 与 AI 辅助开发推进为可运行体验，并由团队协作完成正式上线。</p></section><section class="project-section"><h3>关于演示数据</h3><p>默认以 VV 进入。本地 Mock 数据刷新后恢复初始状态，不连接正式后端，也不会影响正式用户。</p></section></div>`;
const notes = document.createElement('div');
notes.className = 'project-notes';
notes.setAttribute('aria-label', '项目介绍与产品规则');
const receipt = document.createElement('div');
receipt.className = 'project-receipt paper-material';
receipt.append(right);
const rulesShadow = document.createElement('div');
rulesShadow.className = 'rules-paper-shadow';
rulesShadow.append(receipt);
notes.append(rulesShadow);
right.querySelector('.project-kicker').textContent = 'NO.02 / 产品规则与设计思路';
const brand = document.createElement('aside');
brand.className = 'brand-ticket';
brand.setAttribute('aria-label', '我的匿名提问箱作品小票');
brand.innerHTML = `<div class="brand-paper paper-material"><div class="brand-art"><img src="./brand-receipt.png" alt="我的匿名提问箱。一个可以匿名提问并真诚交流的空间。在这里，你可以放心发问，也可以认真回答。每一个问题，都可能是他人想问却不敢问的。"><a class="brand-store-link" href="https://apps.apple.com/cn/app/id6797835962" target="_blank" rel="noopener noreferrer" aria-label="查看我的匿名提问箱 App Store 页面" title="查看已上线的 App"></a></div></div>`;
right.querySelectorAll('details').forEach(detail => { detail.open = false; });
document.body.append(brand, notes, mobileBar, dialog);
const serratedEdges = new ResizeObserver(entries => {
  for (const { target, contentRect } of entries) {
    const count = Math.max(12, Math.round(contentRect.width / 12));
    const points = [];
    for (let step = 0; step <= count * 2; step++) {
      points.push(`${step / (count * 2) * 100}% ${step % 2 ? 0 : 6}px`);
    }
    for (let step = count * 2; step >= 0; step--) {
      points.push(`${step / (count * 2) * 100}% calc(100% - ${step % 2 ? 0 : 6}px)`);
    }
    target.style.clipPath = `polygon(${points.join(',')})`;
  }
});
document.querySelectorAll('.paper-material').forEach(paper => serratedEdges.observe(paper));
const open = mobileBar.querySelector('.project-open');
open.addEventListener('click', () => {
  dialog.showModal();
  demo.inert = true;
});
dialog.querySelector('.project-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
dialog.addEventListener('close', () => { demo.inert = entry.isConnected; open.focus(); });
