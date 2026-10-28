/* 쪽 여백 맞추기
   쪽마다 본문 끝과 아래 단어 줄(없으면 본문 영역 끝) 사이에 남는 빈 공간을
   문항·블록 사이 간격에 나눠 주어, 모든 쪽의 아래 여백을 같게 만든다.
   - 위 여백은 CSS(--m-top)가 정하고, 이 스크립트는 아래 여백(--fill-gap)만 맞춘다.
   - Chapter Test처럼 2단인 쪽은 단마다 따로 맞춘다.
   - 간격 하나에 더하는 양은 MAX_MM × 가중치를 넘지 않는다(내용이 너무 적은 쪽은 아래가 남는다).
     내용이 아래 끝선을 넘으면 간격을 MIN_MM × 가중치까지 줄인다.
   - 도입(.opener), 정답 및 해설(.ans-page), .no-fill 쪽은 건드리지 않는다.
   - 워크북 쪽(주소에 /workbook/)은 문항 사이를 WB_ITEM_MM, Test 문항 사이를 WB_Q_MM까지만 늘리고
     나머지는 세트(A·B·C) 사이에 준다(WB_SET_MM). 그래도 아래가 WB_LEFT_MM보다 많이 남으면
     그만큼만 남기고 문항 사이에도 고르게 나눈다. 짧은 문항끼리 너무 멀어지지 않게 — 2026-10-27. */
(function () {
  var MM = 96 / 25.4;
  var MAX_MM = 14;
  var MIN_MM = 2;   // 내용이 단어 줄에 너무 붙은 쪽은 간격 하나를 최대 2mm까지 줄인다
  var IS_WB = /\/workbook\//.test(location.pathname);
  var WB_ITEM_MM = 2.5, WB_Q_MM = 8, WB_SET_MM = 14, WB_LEFT_MM = 15, WB_TOP_MM = 7;
  function capOf(g) {                                         // 간격 하나에 더할 수 있는 최대(px)
    if (!IS_WB) return MAX_MM * MM;
    if (g.top) return WB_TOP_MM * MM;
    if (g.el.matches('.set, .pass, .box-title, h3, h4')) return WB_SET_MM * MM;
    if (g.el.matches('.q')) return WB_Q_MM * MM;
    if (g.el.closest('.set')) return WB_ITEM_MM * MM;
    return MAX_MM * MM;
  }

  function cssMm(name) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return parseFloat(v) || 4;
  }
  function isFlowChild(el) {
    if (el.classList.contains('vocab')) return false;
    var pos = getComputedStyle(el).position;
    return pos !== 'absolute' && pos !== 'fixed';
  }
  function kids(el) {
    return Array.prototype.filter.call(el.children, isFlowChild);
  }

  // 간격을 늘릴 요소와 가중치를 모은다
  function weight(el, prev) {
    if (prev && prev.matches('.ue-head, .wb-head, .test-head, .wb-test-head, .sum-head, .front-head, .unit-head, .front-lead')) return 0.5; // 제목 바로 아래는 거의 그대로
    if (el.matches('.got')) return 0;                       // ‘다 이해했어요’는 check up에 붙여 둔다
    if (prev && prev.matches('.box-title, h3, h4')) return 0;   // 소제목은 내용에 붙여 둔다
    if (el.matches('.box-title')) return 1.5;               // 대신 소제목 위를 넓힌다
    if (el.matches('.term') && !el.nextElementSibling) return 10; // 단 끝의 단어 상자는 단 아래로 내린다
    if (el.matches('.exr') && prev && prev.matches('.exr')) return 0.3; // 예문끼리는 조금만
    if (el.matches('.qrow')) {                               // 문항 첫 줄만 띄우고 답 줄은 붙인다
      var n = el.querySelector('.n');
      return n && n.textContent.trim() ? 1 : 0;
    }
    if (el.matches('.checkup, .set, .pass, .point-row')) return 1.5;
    return 1;
  }
  function collect(container, out) {
    var list = kids(container);
    list.forEach(function (el, i) {
      if (i > 0) {
        var w = weight(el, list[i - 1]);
        if (w > 0) out.push({ el: el, w: w, prev: list[i - 1] });
      }
      if (el.matches('.set')) {                              // 세트 안의 문항 줄
        kids(el).forEach(function (c) { if (!c.matches('.set-letter')) collect(c, out); });
      } else if (el.matches('.point-row')) {                 // POINT 오른쪽 본문 블록
        var main = kids(el).filter(function (c) { return !c.matches('.point-box'); });
        main.forEach(function (c) { collect(c, out); });
      }
    });
    return out;
  }

  function bottomOf(container) {
    var b = 0;
    kids(container).forEach(function (el) { b = Math.max(b, el.getBoundingClientRect().bottom); });
    return b;
  }

  function fill(container, limit, capped) {
    if (capped === undefined) capped = IS_WB;
    var gaps = collect(container, []);
    if (!gaps.length) return;
    gaps.forEach(function (g) { g.el.style.marginTop = ''; g.prev.style.marginBottom = ''; }); // 두 번째로 맞출 때를 위해 원래 간격으로
    var first = kids(container)[0];
    if (IS_WB && container.matches('.page-body') && first && first.matches('.set')) {   // 머리 없이 세트로 시작하는 워크북 쪽: 위에도 조금
      container.style.paddingTop = '';
      gaps.unshift({ el: container, w: 1.5, top: true, base: parseFloat(getComputedStyle(container).paddingTop) || 0 });
    }
    gaps.forEach(function (g) {
      if (g.top) { g.cap = capped ? capOf(g) : WB_TOP_MM * MM; return; }
      var cs = getComputedStyle(g.el);
      var own = parseFloat(cs.marginTop) || 0;
      // 부모가 일반 블록이면 앞 블록의 아래 여백과 겹치므로(margin collapse) 큰 쪽을 기준으로 한다
      var pd = getComputedStyle(g.el.parentElement).display;
      var prevMb = parseFloat(getComputedStyle(g.prev).marginBottom) || 0;
      g.collapse = pd === 'block' || pd === 'flow-root';
      g.base = g.collapse ? Math.max(own, prevMb) : own;
      g.cap = capped ? capOf(g) : MAX_MM * MM;
    });
    function apply(k) {
      gaps.forEach(function (g) {
        if (g.top) { g.el.style.paddingTop = (g.base + Math.max(0, Math.min(k * g.w, g.cap))) + 'px'; return; }
        if (g.collapse) g.prev.style.marginBottom = '0px';   // 겹침을 없애고 간격을 margin-top 하나로 정한다
        var add = k * g.w;
        if (add > 0) add = Math.min(add, g.cap);
        g.el.style.marginTop = Math.max(0, g.base + add) + 'px';
      });
    }
    function fits(k) { apply(k); return bottomOf(container) <= limit; }
    var lo, hi;
    if (fits(0)) {
      lo = 0; hi = (capped ? WB_SET_MM : MAX_MM) * MM;
      if (fits(hi)) {                                        // 최대로 늘려도 남으면
        if (capped && limit - bottomOf(container) > WB_LEFT_MM * MM) fill(container, limit - WB_LEFT_MM * MM, false);
        return;
      }
    } else {
      lo = -MIN_MM * MM; hi = 0;                             // 넘치면 간격을 조금 줄인다
      if (!fits(lo)) return;
    }
    for (var i = 0; i < 18; i++) {
      var mid = (lo + hi) / 2;
      if (fits(mid)) lo = mid; else hi = mid;
    }
    apply(lo);
  }

  function run() {
    var gap = cssMm('--fill-gap') * MM;
    document.querySelectorAll('.page').forEach(function (pg) {
      if (pg.matches('.opener, .ans-page, .no-fill')) return;
      var body = pg.querySelector('.page-body');
      if (!body) return;
      var vocab = body.querySelector(':scope > .vocab');
      var br = body.getBoundingClientRect();
      var limit = (vocab ? vocab.getBoundingClientRect().top : br.bottom) - gap;
      var cols = body.querySelectorAll('.test-cols > div');
      if (cols.length) {
        cols.forEach(function (c) { fill(c, limit); });
      } else {
        fill(body, limit);
      }
    });
    document.documentElement.classList.add('fill-ready');
  }

  var fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  var loaded = new Promise(function (r) {
    if (document.readyState === 'complete') r(); else window.addEventListener('load', r);
  });
  Promise.all([fontsReady, loaded]).then(run);
})();
