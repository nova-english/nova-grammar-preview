/* 간단판 해설 표지(?short)와 반 권(1-1·1-2·2-1·2-2) 표지: cover.html?part=1 이나 ?part=2 로 열면 배지·칩·뒤표지 표시를 그 반 권에 맞게 바꾼다.
   주소에 part가 없으면 한 권짜리 표지 그대로 둔다(책 뷰어). tools/make_pdf.py가 반 권 PDF를 만들 때 쓴다. */
(function () {   // 간단판 해설 표지(?short)
  if (!new URLSearchParams(location.search).has('short')) return;
  document.querySelectorAll('.cv-ribbon').forEach(function (r) { r.textContent = r.textContent.trim() + ' · 간단판'; });
  document.querySelectorAll('.cv-sub').forEach(function (r) { r.innerHTML = '정답과 <b>핵심 한 줄</b>로 빠르게 확인하는 간단판'; });
  document.querySelectorAll('.cv-chips').forEach(function (c) {
    c.innerHTML = '<span>정답 한눈에 보기</span><span>문항마다 핵심 한 줄</span><span>서술형 다른 정답</span><span>자세한 풀이는 상세판</span>';
  });
  document.querySelectorAll('.bc-band h2').forEach(function (h) { h.innerHTML = '정답과 핵심만<br><b>빠르게 확인해요</b>'; });
  document.querySelectorAll('.bc-band p').forEach(function (p) { p.innerHTML = '채점은 정답 한눈에 보기로 빠르게,<br>헷갈린 문항은 핵심 한 줄로 확인해요.<br>더 자세한 풀이가 필요하면 상세판을 펴요.'; });
  var F = [['정답 한눈에 보기', '구획마다 정답을 모아 두어 빠르게 채점할 수 있어요.'],
           ['문항마다 핵심 한 줄', '왜 그 답인지를 규칙 한 줄로 짚어 줘요.'],
           ['서술형 다른 정답', '서술형은 인정되는 다른 답까지 함께 실었어요.'],
           ['상세판과 같은 순서', '모든 선택지 풀이·채점 기준은 상세판의 같은 자리에 있어요.']];
  document.querySelectorAll('.bc-feat').forEach(function (f, i) {
    if (F[i]) f.innerHTML = '<h3><span class="n">' + (i + 1) + '</span>' + F[i][0] + '</h3><p>' + F[i][1] + '</p>';
  });
  document.querySelectorAll('.bc-set').forEach(function (set) {
    set.querySelectorAll('span').forEach(function (s) { if (/쪽/.test(s.textContent)) s.remove(); });
    var s = document.createElement('span'); s.textContent = '간단판 — 자세한 풀이는 상세판'; set.querySelector('b').after(s);
  });
})();
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
