/**
 * Плавное появление блоков при прокрутке.
 *
 * Одного IntersectionObserver недостаточно: при быстрой прокрутке (колесо
 * до упора, переход по якорю, восстановление позиции при перезагрузке)
 * элемент успевает войти в экран и выйти из него между кадрами, событие
 * теряется — и блок остаётся невидимым навсегда.
 *
 * Поэтому к наблюдателю добавлена страховка: всё, что оказалось выше нижней
 * границы экрана, показывается принудительно. Контент важнее анимации.
 */
export function initReveal(selector = '.reveal'): void {
  const items = Array.from(document.querySelectorAll<HTMLElement>(selector));
  if (!items.length) return;

  const show = (el: HTMLElement) => el.classList.add('is-visible');

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    items.forEach(show);
    return;
  }

  const pending = new Set(items);

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target as HTMLElement;
        show(el);
        pending.delete(el);
        observer.unobserve(el);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
  );

  items.forEach((el) => observer.observe(el));

  /** Показывает всё, что уже проехало мимо экрана. */
  const sweep = () => {
    for (const el of Array.from(pending)) {
      if (el.getBoundingClientRect().top < window.innerHeight) {
        show(el);
        pending.delete(el);
        observer.unobserve(el);
      }
    }
    if (!pending.size) {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    }
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      sweep();
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('load', sweep);
  sweep();
}
