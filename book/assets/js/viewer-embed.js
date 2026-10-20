/* 책 뷰어(viewer.html) 안에서 열릴 때: 주소의 #v=<data-page> 쪽 하나만 보여 주고 틀에 맞춰 크기를 줄인다.
   혼자 열 때(뷰어 밖)는 아무 일도 하지 않는다.
   page-fill.js(쪽 여백 맞추기)와 answers-paginate.js(해설 쪽 나누기)가 끝난 뒤에 다른 쪽을 숨긴다 —
   먼저 숨기면 두 스크립트의 높이 계산이 틀어진다. */
(function () {
  if (window.self === window.top || !/[#&]v=/.test(location.hash)) return;
  var root = document.documentElement;
  root.classList.add('vw');
  var css = document.createElement('style');
  css.textContent =
    'html.vw:not(.vw-active) body { visibility:hidden; }' +
    'html.vw.vw-active, html.vw.vw-active body { margin:0; padding:0; background:#fff; overflow:hidden; height:100%; }' +
    'html.vw .toolbar { display:none !important; }' +
    'html.vw.vw-active main.book { display:block; padding:0; margin:0; }' +
    'html.vw.vw-active .page { display:none !important; }' +
    'html.vw.vw-active .page.vw-on { display:block !important; position:absolute; left:0; top:0; margin:0; box-shadow:none;' +
    ' transform-origin:0 0; transform:scale(var(--vw-s, 1)); }';
  (document.head || root).appendChild(css);

  function id() {
    var m = location.hash.match(/v=([^&]+)/);
    return m ? decodeURIComponent(m[1]) : null;
  }
  function fit() {
    var p = document.querySelector('.page.vw-on');
    if (!p) return;
    var s = Math.min(window.innerWidth / p.offsetWidth, window.innerHeight / p.offsetHeight);
    root.style.setProperty('--vw-s', s);
  }
  function show() {
    var want = id(), found = false;
    document.querySelectorAll('.page').forEach(function (p) {
      var on = p.dataset.page === want;
      p.classList.toggle('vw-on', on);
      if (on) found = true;
    });
    fit();
    try { window.parent.postMessage({ vw: found ? 'ready' : 'missing', page: want }, '*'); } catch (e) {}
  }
  var started = false;
  function start() {
    if (started) return;
    var isAnswers = !!document.getElementById('ak-source') || document.querySelector('.ans-page');
    if (isAnswers && !root.classList.contains('ak-ready')) { setTimeout(start, 80); return; }
    started = true;
    // requestAnimationFrame은 다른 출처 iframe에서 멈출 수 있어 타이머로 기다린다
    setTimeout(function () { root.classList.add('vw-active'); show(); }, 250);
  }
  var fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  fontsReady.then(function () {
    if (document.readyState === 'complete') start(); else window.addEventListener('load', start);
  });
  // 쪽 안의 링크(예문 듣기 QR 등)는 새 창으로
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (a) { a.target = '_blank'; a.rel = 'noopener'; }
  }, true);
  window.addEventListener('hashchange', function () { if (started) show(); });
  window.addEventListener('resize', fit);
})();
