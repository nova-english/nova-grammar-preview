/* 반 권(1-1·1-2·2-1·2-2) 표지: cover.html?part=1 이나 ?part=2 로 열면 배지·칩·뒤표지 표시를 그 반 권에 맞게 바꾼다.
   주소에 part가 없으면 한 권짜리 표지 그대로 둔다(책 뷰어). tools/make_pdf.py가 반 권 PDF를 만들 때 쓴다. */
(function () {
  var p = new URLSearchParams(location.search).get('part');
  if (p !== '1' && p !== '2') return;
  var range = p === '1' ? 'Chapter 01–06' : 'Chapter 07–12';
  var lv = '';
  document.querySelectorAll('.cv-level b').forEach(function (b) {
    lv = b.textContent.trim();
    b.textContent = lv + '-' + p;
    b.classList.add('part');
  });
  document.querySelectorAll('.cv-chips').forEach(function (c) {
    var s = document.createElement('span');
    s.className = 'part';
    s.textContent = range;
    c.insertBefore(s, c.firstChild);
  });
  document.querySelectorAll('.bc-set').forEach(function (set) {
    set.querySelectorAll('span').forEach(function (s) { if (/쪽/.test(s.textContent)) s.remove(); });
    var s = document.createElement('span');
    s.textContent = 'LEVEL ' + lv + '-' + p + ' · ' + range;
    set.querySelector('b').after(s);
  });
  document.querySelectorAll('.bc-foot span:first-child').forEach(function (f) {
    f.innerHTML = '<b>Nova Grammar</b> LEVEL ' + lv + '-' + p;
  });
  document.title = document.title.replace('LEVEL ' + lv, 'LEVEL ' + lv + '-' + p);
})();
