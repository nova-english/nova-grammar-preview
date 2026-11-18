/* 워크북 2단 채우기 (2026-10-30 사용자: 빈 공간이 많으면 보기 싫다 — 문항이 많으면 촘촘하게, 남으면 알아서 넓게).
   .wb2 안의 블록(문항 .rq · 본문 완성 머리 · 문장)을 왼쪽·오른쪽 단으로 나누되 두 단 높이가 비슷해지는 곳에서 끊고,
   단마다 남는 높이를 블록 사이에 고르게 나눠 단 끝까지 채운다. .keep-next 블록(소제목)은 다음 블록과 떨어지지 않는다.
   서술형 답 줄(.wline)은 블록 사이가 많이 벌어질 때 조금 높여 쓸 자리를 더 준다. */
(function () {
  var MM = 96 / 25.4;
  function sum(a, i, j) { var s = 0; for (var k = i; k < j; k++) s += a[k]; return s; }
  function heights(items) { return items.map(function (it) { return it.getBoundingClientRect().height; }); }

  function spread(col, H, base) {
    var kids = [].slice.call(col.children), n = kids.length;
    if (!n) return;
    var hs = heights(kids), tight = base * 0.45;
    var gaps = 0, fixed = 0;
    for (var i = 1; i < n; i++) { if (kids[i - 1].classList.contains('keep-next')) fixed += tight; else gaps++; }
    var free = H - sum(hs, 0, n) - fixed;
    var g = gaps ? Math.max(base * 0.5, free / (gaps + 0.35)) : 0;     // 맨 아래에도 조금 남겨 끝선에 딱 붙지 않게
    for (var j = 0; j < n; j++) kids[j].style.marginTop = j === 0 ? '0' : (kids[j - 1].classList.contains('keep-next') ? tight : g) + 'px';
    return g;
  }

  function layout() {
    document.querySelectorAll('.wb2').forEach(function (box) {
      if (box.dataset.done) return;
      var items = [].slice.call(box.children), n = items.length;
      box.classList.add('cols');
      var L = document.createElement('div'), R = document.createElement('div');
      L.className = 'col'; R.className = 'col r';
      box.appendChild(L); box.appendChild(R);
      items.forEach(function (it) { L.appendChild(it); });
      var H = box.clientHeight, base = 3.5 * MM;
      var hs = heights(items), best = n, bestV = 1e9;
      for (var k = 1; k < n; k++) {
        if (items[k - 1].classList.contains('keep-next')) continue;
        var a = sum(hs, 0, k) + base * (k - 1), b = sum(hs, k, n) + base * (n - k - 1);
        if (a > H) break;
        var v = Math.max(a, b);
        if (v < bestV) { bestV = v; best = k; }
      }
      for (var i = best; i < n; i++) R.appendChild(items[i]);
      var gl = spread(L, H, base) || 0, gr = spread(R, H, base) || 0;
      // 블록 사이가 10mm보다 넓게 벌어지면 그 일부를 서술형 답 줄 높이로 돌린다(쓸 자리 넓히기)
      [[L, gl], [R, gr]].forEach(function (p) {
        var col = p[0], g = p[1];
        if (g <= 10 * MM) return;
        var lines = col.querySelectorAll('.wline');
        if (!lines.length) return;
        var add = Math.min(4 * MM, (g - 10 * MM) * (col.children.length - 1) / lines.length / 2);
        lines.forEach(function (w) { w.style.height = (w.getBoundingClientRect().height + add) + 'px'; });
        spread(col, H, base);
      });
      box.dataset.done = 1;
    });
  }
  function run() { (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () { setTimeout(layout, 50); }); }
  if (document.readyState === 'complete') run(); else window.addEventListener('load', run);
})();
