/* 烈哥客家面 — 三语切换 (中文 / Bahasa Melayu / English)
 * 纯静态实现：data-i18n 键 + localStorage 记忆 + 设置 <html lang>。
 * 设计规则：中文主文案下方的小号拉丁装饰行(.en / mi-en) 仅在中文模式显示，
 * 切到 BM / EN 时以空串隐藏，避免与已是拉丁文的主文案重复。
 */
(function () {
  'use strict';

  var LANG_TAG = { zh: 'zh-Hans', ms: 'ms', en: 'en' };

  // 每个键 = { zh, ms, en }；值为 '' 表示该语言下隐藏该元素。
  var T = {};

  function applyLang(lang) {
    if (!LANG_TAG[lang]) lang = 'zh';
    document.documentElement.lang = LANG_TAG[lang];

    for (var key in T) {
      if (!Object.prototype.hasOwnProperty.call(T, key)) continue;
      var val = T[key][lang];
      if (val == null) continue; // 该语言未定义 -> 保持当前内容
      var els = document.querySelectorAll('[data-i18n="' + key + '"]');
      for (var i = 0; i < els.length; i++) {
        if (val === '') {            // 空串 -> 隐藏（拉丁装饰行规则）
          els[i].style.display = 'none';
        } else {
          els[i].style.display = '';
          els[i].innerHTML = val;
        }
      }
    }

    var btns = document.querySelectorAll('.lang-switch button');
    for (var j = 0; j < btns.length; j++) {
      btns[j].classList.toggle('active', btns[j].getAttribute('data-lang') === lang);
    }

    try { localStorage.setItem('leekko_lang', lang); } catch (e) {}
  }

  // 读取记忆的语言（默认中文）
  var saved = 'zh';
  try { saved = localStorage.getItem('leekko_lang') || 'zh'; } catch (e) {}
  if (!LANG_TAG[saved]) saved = 'zh';

  // 绑定切换按钮（脚本位于 body 末尾，DOM 已就绪）
  var switches = document.querySelectorAll('.lang-switch button');
  for (var k = 0; k < switches.length; k++) {
    switches[k].addEventListener('click', function () {
      applyLang(this.getAttribute('data-lang'));
    });
  }

  fetch('/leekko/i18n-data.json').then(function (r) { return r.json(); }).then(function (d) { for (var k in d) T[k] = d[k]; applyLang(saved); }).catch(function (e) { console.warn('i18n data load fail', e); });

  // 供其他脚本调用
  window.leekkoSetLang = applyLang;
})();
