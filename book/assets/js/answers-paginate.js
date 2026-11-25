/* 정답 및 해설 자동 쪽 나누기
   #ak-source 안의 블록(.ak-*)을 순서대로 2단 쪽에 채운다.
   단이 넘치면 다음 단, 두 단이 다 차면 새 쪽을 만든다.
   .keep-next 블록(소제목 등)은 다음 블록과 떨어지지 않게 함께 넘긴다. */
(function () {
  // 줄인 판(2026-11-22): 원고는 그대로 두고 그릴 때만 줄인다.
  //  ① check up 문항별 풀이 → 위 ‘check up 정답’ 표 + 판단법만  ② 짧은 해석은 정답 줄에 이어서
  //  ③ 단서 · 규칙 · 그래서 꼬리표를 떼고 한 문단으로, 정답을 되풀이하는 ‘그래서’는 뺌
  //  ④ 이유 없이 틀린 꼴만 적힌 오답 풀이, 앞 문항과 같은 이유 · 이름표와 같은 ☞ POINT는 뺌  ⑤ 앞 문항과 같은 이름표(POINT · 쪽)는 한 번만  ⑥ ‘어휘’ 줄
  //  ⑦ 정답이 영어 문장인 문항의 해석(영작 · 배열) · 서술형 채점 기준 상자  ⑧ 동그라미 숫자는 조금 크게
  function norm(t) { return (t || '').replace(/[\s`'’".,·→()~\[\]—\-+:;!?]/g, '').toLowerCase(); }
  function slim(src) {
    document.documentElement.classList.add('ak-slim');
    var inCu = false, qp = {}, lastTag = '', lastWr = '';
    Array.prototype.slice.call(src.children).forEach(function (it) {
      if (it.classList.contains('ak-sec')) { inCu = false; qp = {}; lastTag = ''; lastWr = ''; return; }
      if (it.classList.contains('ak-quick')) {            // ‘check up 정답’ 표에 실린 본책 쪽(row 이름의 p.N)
        if (/check up/i.test((it.querySelector('.hd') || it).textContent))
          it.querySelectorAll('.row-lbl').forEach(function (l) { var m = l.textContent.match(/p\.\s*(\d+)/); if (m) qp[m[1]] = 1; });
        return;
      }
      if (it.classList.contains('ak-sub')) {               // POINT check up이고 그 쪽 정답이 표에 있을 때만 문항 풀이를 뺌(Key는 둠)
        var pg = (it.textContent.match(/본책 p\.\s*(\d+)/) || [])[1];
        inCu = /POINT[^]*check up/i.test(it.textContent) && !!qp[pg]; lastTag = ''; lastWr = ''; return;
      }
      if (!it.classList.contains('ak-item')) return;
      var head = it.querySelector(':scope > .ak-head');
      if (!head) return;
      if (inCu) { it.remove(); return; }
      var ansEl = head.querySelector('.ak-ans'), ans = norm(ansEl ? ansEl.textContent : '');
      var tagEl = head.querySelector('.ak-tag'), tag = tagEl ? tagEl.textContent : '';
      if (tagEl && tag === lastTag) { tagEl.remove(); tagEl = null; } else if (tag) lastTag = tag;   // ⑤ 앞 문항과 같은 이름표는 한 번만
      // ② 해석 → 정답 줄 (정답이 영어 문장이면 — 영작 · 배열 · 문장 쓰기 — 문제에 있는 우리말이라 뺌)
      var trk = it.querySelector(':scope > p > .k.tr');
      var ansT = ansEl ? ansEl.textContent.trim() : '';
      if (trk && trk.textContent.trim() === '해석' && /^[A-Z][^가-힣]*[.?!]$/.test(ansT) && ansT.split(/\s+/).length >= 4) { trk.parentNode.remove(); trk = null; }
      // ⑦ 서술형 채점 기준 · 채점 예시 상자는 뺌
      it.querySelectorAll('.ak-box.score').forEach(function (x) { x.remove(); });
      if (trk && trk.textContent.trim() === '해석' && !trk.parentNode.querySelector('br, .o')
          && trk.parentNode.textContent.length <= 70) {              // 선택지 해석처럼 긴 것은 제 줄에 둠
        var trp = trk.parentNode; trk.remove();
        var sp = document.createElement('span'); sp.className = 'ak-trh';
        while (trp.firstChild) sp.appendChild(trp.firstChild);
        head.insertBefore(sp, tagEl || null); trp.remove();
      }
      // ③ 해설 한 문단
      it.querySelectorAll(':scope > p > .k.ex').forEach(function (k) {
        if (k.textContent.trim() !== '해설') return;
        var p = k.parentNode; k.remove();
        var segs = [[]];
        Array.prototype.slice.call(p.childNodes).forEach(function (n) {
          if (n.nodeName === 'BR') segs.push([]); else segs[segs.length - 1].push(n);
        });
        p.innerHTML = '';
        var kept = 0;
        segs.forEach(function (ns) {
          var lab = ns[0] && ns[0].nodeName === 'B' && ns[0].classList.contains('why') ? ns[0].textContent.trim() : '';
          if (lab) ns = ns.slice(1);
          var box = document.createElement('span'); ns.forEach(function (n) { box.appendChild(n); });
          var t = norm(box.textContent);
          if (lab === '그래서' && kept && ans && t.indexOf(ans) >= 0 && t.replace(ans, '').length <= 15) return;
          if (lab === '그래서' && kept && t.length <= 6) return;
          if (!t) return;
          if (kept) p.appendChild(document.createTextNode(' '));
          while (box.firstChild) p.appendChild(box.firstChild);
          kept++;
        });
        if (!kept) p.remove();
      });
      // ⑥ ‘어휘’ 줄은 뺌(2026-11-22 사용자: 어휘 파트는 없어도 됨)
      it.querySelectorAll(':scope > p > .k.vc').forEach(function (k) { k.parentNode.remove(); });
      // ④ 오답 풀이
      it.querySelectorAll(':scope > p > .k.wr').forEach(function (k) {
        if (k.textContent.trim() !== '오답 풀이') return;
        var p = k.parentNode;
        var m = tag.match(/POINT\s*\d+/);
        if (m) p.innerHTML = p.innerHTML.replace(new RegExp('\\s*☞\\s*' + m[0].replace(/\s+/, '\\s*') + '\\s*(\\((본책|워크북)?\\s*p\\.\\s*\\d+(~\\d+)?\\))?', 'g'), '');
        var c = p.cloneNode(true); c.querySelectorAll('.k, .ak-x, .en').forEach(function (e) { e.remove(); });
        if (!/[가-힣]/.test(c.textContent)) { p.remove(); return; }
        var why = norm(c.textContent);
        if (why === lastWr) { p.remove(); return; }                // 앞 문항과 같은 이유면 한 번만
        lastWr = why;
        p.querySelector('.k.wr').textContent = '오답';
      });
    });
    // 채점 상자만 있던 블록은 지운다
    src.querySelectorAll(':scope > .ak-item').forEach(function (it) {
      var sc = it.querySelectorAll('.ak-box.score'); if (!sc.length) return;
      sc.forEach(function (x) { x.remove(); });
      if (!it.textContent.trim()) it.remove();
    });
    wrapCnum(src);
    // 문항이 다 빠져 비어 버린 check up 소제목은 지운다(정답은 위 ‘check up 정답’ 표에)
    Array.prototype.slice.call(src.children).forEach(function (el) {
      if (!el.classList.contains('ak-sub') || !/POINT[^]*check up/i.test(el.textContent)) return;
      var nx = el.nextElementSibling;
      if (!nx || nx.classList.contains('ak-sub') || nx.classList.contains('ak-sec')) el.remove();
    });
  }
  function wrapCnum(src) {
    // 동그라미 숫자(정답 ①~⑳)를 조금 크게 — 글꼴 안의 원문자가 작아서
    var tw = document.createTreeWalker(src, NodeFilter.SHOW_TEXT), tn = [], nd;
    while ((nd = tw.nextNode())) if (/[①-⑳]/.test(nd.nodeValue) && !nd.parentNode.closest('.ak-sec, .ak-sub, .pill')) tn.push(nd);   // 소제목(‘Reading ①’)은 그대로
    tn.forEach(function (t) {
      var f = document.createDocumentFragment();
      t.nodeValue.split(/([①-⑳]+)/).forEach(function (part, i) {
        if (!part) return;
        if (i % 2) { var c = document.createElement('span'); c.className = 'cnum'; c.textContent = part; f.appendChild(c); }
        else f.appendChild(document.createTextNode(part));
      });
      t.parentNode.replaceChild(f, t);
    });
  }
  // 리딩 해설 줄인 판(2026-11-22 사용자): ① 흐름 지도의 영어 첫머리 · 기호 풀이 줄은 뺌, 뒤에 흐름 지도 빈칸 정답이 있는 지문은 흐름 줄도 뺌(가리키는 말은 둠)
  //  ② 전체 해석(끊어 읽기 해석과 겹침) ③ 문항의 [제시문](본책 지문을 다시 옮긴 것) ④ 서술형 채점 기준 상자 ⑤ 지문마다 되풀이되는 안내(채점 · Focus Reading 첫머리)는 처음 한 번만
  function slimReading(src) {
    document.documentElement.classList.add('ak-slim');
    var kids = Array.prototype.slice.call(src.children), secHasFm = [], si = -1;
    kids.forEach(function (el) { if (el.classList.contains('ak-sec')) si++; if (si >= 0 && el.querySelector('.fm-a')) secHasFm[si] = true; });
    si = -1; var seen = {};
    kids.forEach(function (el) {
      if (el.classList.contains('ak-sec')) { si++; return; }
      if (el.classList.contains('ak-flow')) {
        el.querySelectorAll('li > .en, .lgd').forEach(function (x) { x.remove(); });
        if (secHasFm[si]) { var ul = el.querySelector('ul'); if (ul) ul.remove(); }
        if (!el.textContent.trim()) { var prev = el.previousElementSibling; if (prev && prev.classList.contains('ak-sub')) prev.remove(); el.remove(); }
        else { var hd = el.previousElementSibling; if (secHasFm[si] && hd && hd.classList.contains('ak-sub')) hd.firstChild.textContent = '가리키는 말'; }
        return;
      }
      el.querySelectorAll('p').forEach(function (pp) {
        var k = pp.querySelector(':scope > .k'); var t = k ? k.textContent.trim() : '';
        if (t === '전체 해석' || t === '제시문') pp.remove();
      });
      el.querySelectorAll('.ak-box.score').forEach(function (x) { x.remove(); });
      el.querySelectorAll('.ak-box.caution, .ak-leg > .nt').forEach(function (x) {
        var key = x.textContent.replace(/\s+/g, '').slice(0, 40);
        if (seen[key]) x.remove(); else seen[key] = 1;
      });
      if (el.classList.contains('ak-item') && !el.textContent.trim()) el.remove();
    });
    wrapCnum(src);
  }
  function build() {
    var src = document.getElementById('ak-source');
    if (!src) return;
    // 간단판(?short): 정답·핵심 한 줄(‘그래서’)·다른 정답만 남긴다. 상세판과 원고는 같다.
    if (/[?&]short\b/.test(location.search) || document.documentElement.classList.contains('ak-short')) {
      document.documentElement.classList.add('ak-short');
      src.querySelectorAll('.k.tr, .k.wr, .k.step, .k.vc').forEach(function (k) { var p = k.closest('p'); if (p) p.remove(); });
      src.querySelectorAll('.ak-box.caution, .ak-box.score').forEach(function (b) { b.remove(); });
      src.querySelectorAll('.k.ex').forEach(function (k) {
        var p = k.closest('p'); if (!p) return;
        var whys = Array.prototype.slice.call(p.querySelectorAll('b.why'));
        var pick = function (t) { return whys.filter(function (b) { return b.textContent.trim() === t; })[0]; };
        var why = pick('그래서') || pick('규칙');      // ‘그래서’가 없으면 ‘규칙’ 한 줄
        if (why) {                                   // 고른 꼬리표 뒤 한 줄만 남긴다
          var keep = document.createElement('span'); var n = why.nextSibling;
          while (n && !(n.nodeName === 'BR')) { var nx = n.nextSibling; keep.appendChild(n); n = nx; }
          p.innerHTML = ''; p.appendChild(k); p.appendChild(keep);
        }
      });
    }
    // 2026-11-22 사용자: ‘해설지가 너무 두껍다’ → 문법 교재 해설은 기본으로 줄인 판(?full이면 예전 판).
    if (!document.documentElement.classList.contains('ak-short') && !/[?&]full\b/.test(location.search)
        && /\/(book|book2|book3|book-noun|book-prep)\/answers\//.test(location.pathname)) slim(src);
    if (!document.documentElement.classList.contains('ak-short') && !/[?&]full/.test(location.search)
        && /\/reading[123]\/answers\//.test(location.pathname)) slimReading(src);
    // Reading Junior(2026-11-24 사용자): 처음부터 줄인 판이라 내용은 그대로 두고, 문항 번호 옆 ‘정답’ 상자를 빼고(CSS) 동그라미 정답 숫자만 크게
    if (/\/reading-junior\/answers\//.test(location.pathname)) { document.documentElement.classList.add('ak-jr'); wrapCnum(src); }
    var book = document.querySelector('main.book');
    var pageNo = parseInt(src.dataset.startPage || '2', 10);
    var chapterHtml = src.dataset.chapter || '';
    var blocks = Array.prototype.slice.call(src.children);
    var cols = null, colIdx = 0, first = true;

    function newPage() {
      var even = pageNo % 2 === 0;
      var sec = document.createElement('section');
      sec.className = 'page ans-page ' + (even ? 'even' : 'odd');
      sec.dataset.page = 'ans-' + pageNo;
      var body = document.createElement('div');
      body.className = 'page-body';
      if (first && chapterHtml) {
        var band = document.createElement('div');
        band.className = 'ans-chapter';
        band.innerHTML = chapterHtml;
        body.appendChild(band);
      }
      var wrap = document.createElement('div');
      wrap.className = 'ak-cols';
      wrap.innerHTML = '<div class="ak-col"></div><div class="ak-col"></div>';
      body.appendChild(wrap);
      sec.appendChild(body);
      var folio = document.createElement('div');
      folio.className = 'folio';
      folio.innerHTML = even
        ? '<span>' + pageNo + '</span><span class="t"></span><span class="lv"></span><span class="ak-folio-k">정답 및 해설</span>'
        : '<span class="ak-folio-k">정답 및 해설</span><span>' + pageNo + '</span>';
      sec.appendChild(folio);
      book.appendChild(sec);
      cols = wrap.children;
      colIdx = 0;
      first = false;
      pageNo++;
    }
    function overflows(col) { return col.scrollHeight > col.clientHeight + 1; }
    function advance() {
      colIdx++;
      if (colIdx > 1) newPage();
    }

    // 긴 블록 나누기: 단에 다 안 들어가는 블록을 줄 경계에서 잘라 앞부분은 이 단에, 뒷부분은 다음 단으로.
    //  - .ak-item(문항·노트): <p>/상자 단위, 그래도 크면 <br> 줄 단위. 문항 머리와 첫 줄은 떼지 않는다.
    //  - .ak-quick(빠른 정답): 행 묶음(A, B, POINT n …) 단위. 뒷부분에는 제목 + (계속).
    function brSplit(b, c, col) {   // c(<p>)의 앞쪽 <br> 줄들을 들어가는 만큼 b 끝으로 옮긴다
      if (!c || c.tagName !== 'P' || !c.querySelector('br')) return false;
      var cut = [], seg = [];
      Array.prototype.slice.call(c.childNodes).forEach(function (n) { seg.push(n); if (n.nodeName === 'BR') { cut.push(seg); seg = []; } });
      if (seg.length) cut.push(seg);
      var front = c.cloneNode(false); b.appendChild(front);
      var used = 0;
      for (var i = 0; i < cut.length - 1; i++) {
        cut[i].forEach(function (n) { front.appendChild(n); });
        if (overflows(col)) break;
        used = i + 1;
      }
      while (c.firstChild) c.removeChild(c.firstChild);
      for (var k = used; k < cut.length; k++) cut[k].forEach(function (n) { c.appendChild(n); });
      if (used === 0) { b.removeChild(front); return false; }
      if (front.lastChild && front.lastChild.nodeName === 'BR') front.removeChild(front.lastChild);
      return true;
    }
    function splitItem(b, col) {
      var hasHead = b.firstElementChild && b.firstElementChild.classList.contains('ak-head');
      var minKeep = hasHead ? 2 : 1;
      var cont = document.createElement('div');
      cont.className = 'ak-item ak-cont';
      while (overflows(col) && b.children.length > minKeep) cont.insertBefore(b.lastElementChild, cont.firstChild);
      if (overflows(col)) {   // 남은 마지막 줄을 <br> 단위로 나눠 본다
        var last = b.lastElementChild;
        if (last && last.tagName === 'P' && last.querySelector('br') && b.children.length > (hasHead ? 1 : 0)) {
          cont.insertBefore(last, cont.firstChild);
          if (b.children.length === 0 || !brSplit(b, cont.firstElementChild, col)) {
            while (cont.firstChild) b.appendChild(cont.firstChild);
            return null;
          }
        } else {
          while (cont.firstChild) b.appendChild(cont.firstChild);
          return null;
        }
      } else {
        brSplit(b, cont.firstElementChild, col);
      }
      return cont.children.length ? cont : null;
    }
    function splitQuick(b, col) {
      var groups = [];
      Array.prototype.forEach.call(b.querySelectorAll(':scope > .grid'), function (g) {
        var cur = null;
        Array.prototype.slice.call(g.children).forEach(function (n) {
          if (n.classList.contains('row-lbl') || !cur) { cur = { grid: g, nodes: [] }; groups.push(cur); }
          cur.nodes.push(n);
        });
      });
      if (groups.length < 2) return null;
      var cont = document.createElement('div');
      cont.className = 'ak-quick ak-cont';
      var hd = b.querySelector(':scope > .hd').cloneNode(true);
      var go = hd.querySelector('.go'); if (go) go.remove();
      Array.prototype.slice.call(hd.querySelectorAll('small')).forEach(function (x) { x.remove(); });
      hd.appendChild(document.createTextNode(' (계속)'));
      cont.appendChild(hd);
      var map = [];   // 원래 grid → cont 안의 grid
      function gridFor(g) {
        for (var i = 0; i < map.length; i++) if (map[i][0] === g) return map[i][1];
        var ng = g.cloneNode(false); cont.insertBefore(ng, cont.children[1] || null); map.push([g, ng]); return ng;
      }
      var moved = 0;
      while (overflows(col) && groups.length - moved > 1) {
        var gr = groups[groups.length - 1 - moved], ng = gridFor(gr.grid);
        for (var j = gr.nodes.length - 1; j >= 0; j--) ng.insertBefore(gr.nodes[j], ng.firstChild);
        if (!gr.grid.children.length) gr.grid.remove();
        moved++;
      }
      if (overflows(col) || !moved) {   // 되돌리기
        groups.forEach(function (gr) { gr.nodes.forEach(function (n) { if (!gr.grid.parentNode) b.appendChild(gr.grid); gr.grid.appendChild(n); }); });
        return null;
      }
      return cont;
    }
    function place(b) {
      var col = cols[colIdx];
      col.appendChild(b);
      if (!overflows(col) || col.children.length === 1 && !b.classList.contains('ak-item') && !b.classList.contains('ak-quick')) return;
      var rest = b.classList.contains('ak-item') ? splitItem(b, col) : b.classList.contains('ak-quick') ? splitQuick(b, col) : null;
      if (rest) { advance(); place(rest); return; }
      if (col.children.length === 1) return;
      // 넘침: 이 블록과 바로 앞의 keep-next 블록들을 다음 단으로
      var carry = [b];
      var prev = b.previousElementSibling;
      while (prev && prev.classList.contains('keep-next') && col.children.length > carry.length) {
        carry.unshift(prev);
        prev = prev.previousElementSibling;
      }
      carry.forEach(function (x) { col.removeChild(x); });
      advance();
      var last = carry.pop();
      carry.forEach(function (x) { cols[colIdx].appendChild(x); });
      place(last);
    }
    newPage();
    blocks.forEach(place);
    src.remove();
    balance();
    document.documentElement.classList.add('ak-ready');
  }

  // 단 끝 맞추기: 다음 블록이 커서 단 아래가 비면, 남은 높이를 블록 사이에 나눠 단마다 아래 여백을 같게 한다.
  // 마지막 쪽은 내용이 끝나는 곳이라 그대로 둔다. 간격 하나에 6mm까지만 더한다.
  function balance() {
    var MM = 96 / 25.4, MAX = 6 * MM;
    var pages = document.querySelectorAll('.ans-page');
    Array.prototype.forEach.call(pages, function (pg, pi) {
      if (pi === pages.length - 1) return;
      Array.prototype.forEach.call(pg.querySelectorAll('.ak-col'), function (col) {
        var items = Array.prototype.slice.call(col.children, 1);
        if (!items.length || !col.lastElementChild) return;
        var free = col.getBoundingClientRect().bottom - col.lastElementChild.getBoundingClientRect().bottom - 4 * MM;
        if (free < 2 * MM) return;
        var base = items.map(function (el) { return parseFloat(getComputedStyle(el).marginTop) || 0; });
        var add = Math.min(MAX, free / items.length);
        // 끊어 읽기 문장끼리(.ak-chk 다음 .ak-chk)는 1mm까지만 벌린다 — Nova Reading 해설 지문 해석이 듬성해 보이지 않게(2026-10-31)
        var cap = items.map(function (el) { var pv = el.previousElementSibling; return el.classList.contains('ak-chk') && pv && pv.classList.contains('ak-chk') ? 1 * MM : Infinity; });
        function apply(a) { items.forEach(function (el, i) { el.style.marginTop = (base[i] + Math.min(a, cap[i])) + 'px'; }); }
        apply(add);
        while (col.scrollHeight > col.clientHeight + 1 && add > 0) {   // 넘치면 조금씩 되돌린다
          add = Math.max(0, add - .2 * MM);
          apply(add);
        }
      });
    });
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(build);
  } else {
    window.addEventListener('load', build);
  }
})();
