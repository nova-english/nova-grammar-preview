/* Nova Words 쪽 맞춤: 본문란(.vw-main)이 넘치면 .tight → .tight2로 줄이고,
   남으면 ① 쓰는 줄(.wl.line)을 13mm까지 넓히고 ② 지문 줄 간격을 2.1까지 ③ READING 할 일 문항 사이 ④ 나머지를 블록 사이에 고르게 나눈다. */
(function () {
  const MM = 96 / 25.4;
  function used(main) {
    const top = main.getBoundingClientRect().top;
    let b = 0;
    for (const k of main.children) b = Math.max(b, k.getBoundingClientRect().bottom + parseFloat(getComputedStyle(k).marginBottom));
    return b - top;
  }
  function fit(pg) {
    const main = pg.querySelector('.vw-main'); if (!main) return;
    const rc = main.querySelector('ul.recall');
    if (rc) {  // 영영 뜻 답 칸 폭을 가장 긴 칸에 맞춰 통일(두 단의 뜻풀이 폭 · 밑줄 자리가 같아지게)
      const fls = [...rc.querySelectorAll('.fl')];
      fls.forEach(f => { if (!f.dataset.w) { f.dataset.w = 1; f.innerHTML = f.textContent.trim().split(/\s{2,}/).map(t => `<span style="white-space:nowrap">${t}</span>`).join(' &nbsp;'); } });  // 두 낱말 답은 낱말 사이에서만 줄바꿈
      fls.forEach(f => f.style.width = 'max-content');
      const w = Math.max(...fls.map(f => f.getBoundingClientRect().width));
      fls.forEach(f => f.style.width = '');
      rc.style.setProperty('--aw', Math.min(Math.max(w + 3 * MM, 16 * MM), 44 * MM) + 'px');
    }
    const H = main.clientHeight;
    pg.dataset.free0 = ((H - used(main)) / MM).toFixed(1);  // 점검용: 늘리기 전 남는 높이(mm, 음수면 넘침)
    for (const c of ['tight', 'tight2']) { if (used(main) <= H) break; pg.classList.add(c); }
    pg.dataset.fit = pg.className;
    let free = H - used(main);
    if (free <= 2) return;
    const lines = [...main.querySelectorAll('.wl.line')].filter(l => !l.closest('ol.first'));  // FIRST TRY 영어로 써 보기는 넓히지 않음(2026-11-23 사용자: 간격이 넓다)
    if (lines.length) {
      const cur = lines[0].getBoundingClientRect().height;
      const add = Math.min(13 * MM - cur, free * 0.5 / lines.length);
      if (add > 0) { lines.forEach(l => l.style.height = (cur + add) + 'px'); free = H - used(main); }
    }
    const psg = main.querySelector('.psg');
    if (psg && free > 4) {
      let lh = parseFloat(getComputedStyle(psg).lineHeight) / parseFloat(getComputedStyle(psg).fontSize);
      const isRv = pg.classList.contains('rv');  // REVIEW 글(D)은 남는 높이를 더 써서 줄 간격을 넓힘(2026-11-23 사용자)
      while (lh < (isRv ? 2.0 : 2.1)) { lh += 0.05; psg.style.lineHeight = lh; if (H - used(main) < free * (isRv ? 0.15 : 0.4)) break; }
      if (used(main) > H) psg.style.lineHeight = (lh - 0.05);
      free = H - used(main);
    }
    // READING 할 일(2026-11-20 사용자): 본문 줄 간격 다음으로 문항 사이에(문항마다 위아래 2mm까지)
    const tks = [...main.querySelectorAll('.tasks > p:not(.nw-q)')];
    if (tks.length && free > 4) {
      const pad = Math.min(2 * MM, free * 0.5 / tks.length / 2);
      tks.forEach(r => { const cs = getComputedStyle(r); r.style.marginTop = (parseFloat(cs.marginTop) + pad) + 'px'; r.style.marginBottom = (parseFloat(cs.marginBottom) + pad) + 'px'; });
      free = H - used(main);
    }
    // REVIEW 쪽(2026-11-20 사용자: 아래 여백 밸런스): 남는 높이를 먼저 B · C 문항 줄 사이에(줄마다 위아래 2.6mm까지)
    const rows = pg.classList.contains('rv') ? [...main.querySelectorAll('ol.rv-b > li, ol.rv-c > li')] : [];
    if (rows.length && free > 4) {
      const pad = Math.min(2.6 * MM, free * 0.55 / rows.length / 2);
      rows.forEach(r => { const cs = getComputedStyle(r); r.style.paddingTop = (parseFloat(cs.paddingTop) + pad) + 'px'; r.style.paddingBottom = (parseFloat(cs.paddingBottom) + pad) + 'px'; });
      free = H - used(main);
    }
    const gaps = [...main.children].slice(1);
    if (gaps.length && free > 0) {
      const g = Math.min(free / gaps.length, 12 * MM);
      gaps.forEach(k => k.style.marginTop = (parseFloat(getComputedStyle(k).marginTop) + g) + 'px');
    }
  }
  function run() { document.querySelectorAll('.page').forEach(fit); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => setTimeout(run, 50)); else window.addEventListener('load', run);
})();
