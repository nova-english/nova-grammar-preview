/* 리딩 본책 쪽 맞춤 (2026-10-30 사용자 지시)
   ① 지문 쪽 그림: 그림 칸이 28mm보다 작아지면(28~45mm는 그 자리에 작게, 2026-10-31) — 왼쪽 사이드 칸 아래에 38mm 이상 비어 있으면 그리로 옮기고,
      아니면 지문 뒤 배경에 연하게(투명도 .13) 깐다. 그림 칸이 넉넉하면 그대로(남는 높이를 채움).
   ② 내용 확인 쪽: 문항 사이가 6mm보다 좁으면(지문 속 문법은 2026-10-31부터 Writing Training 쪽) 선택지 간격, 그다음 보기 상자·선택지 글자 줄 간격을 차례로 줄인다(목표 6mm). */
(function () {
  var MM = 96 / 25.4;
  function h(el) { var r = el.getBoundingClientRect(), cs = getComputedStyle(el); return r.height + parseFloat(cs.marginTop) + parseFloat(cs.marginBottom); }

  function fitFigure(page) {
    var fig = page.querySelector('.rd-main > .rd-fig');
    if (!fig || fig.dataset.done) return;
    fig.dataset.done = 1;
    // 2026-10-31 사용자: 연하게 배경으로 까는 것보다 작게라도 아래 여백에 두는 편이 낫다 → 28mm 이상이면 그 자리에 작게 둔다
    if (fig.getBoundingClientRect().height >= 28 * MM) { if (fig.getBoundingClientRect().height < 45 * MM) fig.classList.add('small'); return; }
    var img = fig.querySelector('img');
    if (!img) return;
    var side = page.querySelector('.rd-side');
    var used = 0, kids = side ? [].slice.call(side.children) : [];
    kids.forEach(function (k) { used += h(k); });
    var gap = side ? parseFloat(getComputedStyle(side).rowGap || getComputedStyle(side).gap) || 0 : 0;
    var free = side ? side.clientHeight - used - gap * Math.max(0, kids.length - 1) : 0;
    if (free >= 38 * MM) {                                   // 사이드 칸 아래로
      var box = document.createElement('div');
      box.className = 'rd-fig side';
      box.style.height = Math.min(free - gap, 62 * MM) + 'px';
      box.appendChild(img);
      side.appendChild(box);
      fig.remove();
    } else {                                                 // 지문 뒤 배경에 연하게
      var main = page.querySelector('.rd-main');
      fig.classList.add('bg');
      main.classList.add('has-bg');
    }
  }

  function gapOf(qs) {
    var kids = [].slice.call(qs.children), sum = 0;
    kids.forEach(function (k) { sum += k.getBoundingClientRect().height; });
    return (qs.clientHeight - sum) / (kids.length + 1);
  }
  function fitQuestions(page) {
    var qs = page.querySelector('.rd-main > .qs'), gb = page.querySelector('.rd-main > .gram-box');   // 지문 속 문법은 2026-10-31부터 Writing Training 쪽(없으면 건너뜀)
    if (!qs || qs.dataset.done) return;
    qs.dataset.done = 1;
    if (gb && gapOf(qs) < 6 * MM) gb.classList.add('tight');
    if (gapOf(qs) < 6 * MM) qs.classList.add('tight');
    if (gapOf(qs) < 6 * MM) qs.classList.add('tight2');                // 그래도 좁으면 지문·보기 상자도 촘촘하게
  }

  /* ③ Syntax Training 문장: 덩어리가 두 줄로 갈라지면 낱말 간격(.3em)을 조금씩 줄여 한 줄에 맞춘다(2026-10-31 사용자, Unit 1 p.18 2번).
     .12em까지 줄여도 안 되면 오른쪽 Hint를 문장 아래로 내려(.hint-low) 폭을 넓히고 다시 해 본다. 그래도 안 들어가는 긴 문장은 원래대로 두 줄. */
  function oneLine(row) {
    var chs = row.querySelectorAll(':scope > .ch');
    return !chs.length || chs[chs.length - 1].offsetTop === chs[0].offsetTop;
  }
  function squeeze(row, es) {
    if (oneLine(row)) return true;
    for (var ws = .26; ws >= .12 - 1e-9; ws -= .02) {
      es.forEach(function (e) { e.style.wordSpacing = ws.toFixed(2) + 'em'; });
      if (oneLine(row)) return true;
    }
    es.forEach(function (e) { e.style.wordSpacing = ''; });
    return false;
  }
  function fitSentences(page) {
    page.querySelectorAll('.st .row').forEach(function (row) {
      if (row.dataset.done) return;
      row.dataset.done = 1;
      var es = [].slice.call(row.querySelectorAll(':scope > .ch > .e')), st = row.parentNode;
      if (squeeze(row, es) || !st.querySelector(':scope > .hint')) return;
      st.classList.add('hint-low');
      if (!squeeze(row, es)) st.classList.remove('hint-low');
    });
  }

  /* ④ 지문 쪽 제목: 오른쪽 READ ×3 카드 때문에 칸이 모자라면 글자를 조금씩 줄여 한 줄에(2026-10-31) */
  function fitTitle(page) {
    var hl = page.querySelector('.rd-hl');
    if (!hl || hl.dataset.done) return;
    hl.dataset.done = 1;
    [['h1', 23, 16], ['h2', 13.5, 9.5]].forEach(function (a) {
      var el = hl.querySelector('.rd-title ' + a[0]);
      if (!el) return;
      for (var pt = a[1]; el.scrollWidth > hl.clientWidth + 1 && pt > a[2]; pt -= .5) el.style.fontSize = (pt - .5) + 'pt';
    });
  }

  function run() {
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () {
      setTimeout(function () {
        document.querySelectorAll('section.page').forEach(function (pg) { fitTitle(pg); fitQuestions(pg); fitFigure(pg); fitSentences(pg); });
        window.dispatchEvent(new Event('rd-fitted'));
      }, 80);
    });
  }
  if (document.readyState === 'complete') run(); else window.addEventListener('load', run);
})();
