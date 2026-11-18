/* 후치 수식 화살표: ( 형용사구·절 의 여는 괄호에서 문장 위로 곡선을 그려 꾸밈 받는 명사(.hn)를 가리킨다.
   화살표는 '무엇이 무엇을 꾸미나'(관계)만 보여 주고, 읽는 순서는 왼쪽 → 오른쪽으로 따로 가르친다
   (2026-10-30 사용자: 학생들이 후치수식 화살표를 이 방향으로 배워 왔으니 뒤집으면 헷갈림).
   rlib.mark()가 명사에 data-hn, 괄호에 data-to를 붙인다. 같은 줄에 있을 때만 그린다(줄이 바뀌면 그리지 않음). */
(function () {
  function draw() {
    document.querySelectorAll('.pm-arrows').forEach(function (s) { s.remove(); });
    var groups = new Map();
    document.querySelectorAll('[data-to]').forEach(function (b) {
      var page = b.closest('.page, .ak-page, section') || document.body;
      var hn = page.querySelector('[data-hn="' + b.dataset.to + '"]') || document.querySelector('[data-hn="' + b.dataset.to + '"]');
      if (!hn) return;
      var host = b.closest('.page') || b.closest('.ak-col') || b.offsetParent || document.body;
      if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
      var hr = host.getBoundingClientRect(), br = b.getBoundingClientRect(), nr = hn.getBoundingClientRect();
      if (Math.abs(br.top - nr.top) > br.height * 0.6) return;            // 다른 줄
      var x1 = br.left - hr.left + br.width * 0.55, x2 = nr.left - hr.left + nr.width / 2;
      var y0 = Math.min(br.top, nr.top) - hr.top + br.height * 0.18;          // 글자 윗선 바로 위
      var d = Math.abs(x1 - x2), h = Math.max(5, Math.min(9, d * 0.22));       // 거리에 따라 2~3mm 높이의 부드러운 아치
      var col = getComputedStyle(b).color;
      var svg = groups.get(host);
      if (!svg) {
        svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'pm-arrows'); svg.setAttribute('width', hr.width); svg.setAttribute('height', hr.height);
        host.appendChild(svg); groups.set(host, svg);
      }
      var tip = y0 - 0.6;
      var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', 'M' + x1 + ',' + (y0 - 0.5) + ' C' + (x1 - d * 0.12) + ',' + (y0 - h * 1.25) + ' ' + (x2 + d * 0.18) + ',' + (y0 - h * 1.25) + ' ' + x2 + ',' + (tip - 2.4));
      p.setAttribute('fill', 'none'); p.setAttribute('stroke', col); p.setAttribute('stroke-width', '0.9'); p.setAttribute('stroke-linecap', 'round');
      svg.appendChild(p);
      var a = document.createElementNS('http://www.w3.org/2000/svg', 'path');    // 채운 작은 화살촉(명사 위, 아래를 향함)
      a.setAttribute('d', 'M' + (x2 - 2.1) + ',' + (tip - 3.2) + ' L' + x2 + ',' + tip + ' L' + (x2 + 2.1) + ',' + (tip - 3.2) + ' Z');
      a.setAttribute('fill', col); a.setAttribute('stroke', col); a.setAttribute('stroke-width', '0.5'); a.setAttribute('stroke-linejoin', 'round');
      svg.appendChild(a);
    });
  }
  function run() { (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () { setTimeout(draw, 300); }); }
  if (document.readyState === 'complete') run(); else window.addEventListener('load', run);
  window.addEventListener('ak-paginated', run);
  window.addEventListener('resize', function () { clearTimeout(window.__arw); window.__arw = setTimeout(draw, 200); });
})();
