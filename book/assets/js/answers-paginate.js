/* 정답 및 해설 자동 쪽 나누기
   #ak-source 안의 블록(.ak-*)을 순서대로 2단 쪽에 채운다.
   단이 넘치면 다음 단, 두 단이 다 차면 새 쪽을 만든다.
   .keep-next 블록(소제목 등)은 다음 블록과 떨어지지 않게 함께 넘긴다. */
(function () {
  function build() {
    var src = document.getElementById('ak-source');
    if (!src) return;
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
        function apply(a) { items.forEach(function (el, i) { el.style.marginTop = (base[i] + a) + 'px'; }); }
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
