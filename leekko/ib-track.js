/* ===== Leekko 转化埋点(代码层) =====
   背景:2026-08-21 查出这个站从建站起就没有任何一行"点了联系方式"的埋点 ——
   只有 GA4/GTM/Clarity 三段基础访问统计,WhatsApp/电话链接被点了多少次,
   90 天里在 GA4 一次都查不到。SEO 投入的效果量不出来。

   本脚本只做一件事:把「点了联系方式」这个事实 push 进 dataLayer,
   不依赖任何 GTM 选择器、不依赖 class 名、不依赖链接写法。

   这份代码原样复制自 INFIBOOTH 站的 `ib-track.js`(2026-07-28 建,已验证
   代码→GTM→GA4 三环打通,90 天真实收到 18 次 whatsapp_click)—— 那份文件
   自己写着"无依赖、无框架,可原样复制到其它客户站",这就是第一次复用。

   ⚠️ 要让事件真的进 GA4,还需在 GTM 容器(GTM-W57Z9JVS)里为下面三个事件名
      各建一个 Custom Event 触发器 + 一个 GA4 事件代码:
        whatsapp_click / email_click / phone_click
      只加代码不配 GTM,事件停在 dataLayer 里到不了 GA4。

   无依赖、无框架,可原样复制到其它客户站。 */
(function () {
  window.dataLayer = window.dataLayer || [];

  // 点击发生在页面哪一块 —— 用来区分「导航栏的 WhatsApp」和「文末 CTA 的 WhatsApp」,
  // 哪个位置真正带来咨询,靠这个参数才看得出来。
  function whereIs(el) {
    if (el.closest('header')) return 'header';
    if (el.closest('footer')) return 'footer';
    if (el.closest('[data-float-cta], .ib-float, .float-cta, .fab')) return 'floating';
    var sec = el.closest('section[id]');
    if (sec && sec.id) return sec.id;
    var any = el.closest('section, main');
    if (any && any.className) return String(any.className).split(/\s+/)[0];
    return 'body';
  }

  function eventNameFor(href) {
    if (/wa\.me|api\.whatsapp\.com|web\.whatsapp\.com/i.test(href)) return 'whatsapp_click';
    if (/^mailto:/i.test(href)) return 'email_click';
    if (/^tel:/i.test(href)) return 'phone_click';
    return '';
  }

  // capture 阶段:即使某个处理器 stopPropagation,这里也收得到。
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    var name = eventNameFor(href);
    if (!name) return;

    window.dataLayer.push({
      event: name,
      link_url: href.split('?')[0],                                  // 去掉预填文案的 query,便于聚合
      link_text: (a.innerText || a.textContent || '').trim().slice(0, 60),
      link_location: whereIs(a),
      page_path: location.pathname
    });
  }, true);
})();
