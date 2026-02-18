export { TinyClawWidget } from './widget';
export type { TinyClawConfig } from './widget';
export { DEFAULT_KB, DEFAULT_SYSTEM } from './kb';

// Default export for convenience + script tag usage
import { TinyClawWidget } from './widget';
import type { TinyClawConfig } from './widget';

export default TinyClawWidget;

// Auto-init from data attributes if used as plain script tag
// <script src="tinyclaw-widget.umd.js" data-api-key="sk-..." data-accent="#ff5c5c"></script>
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const script = document.querySelector('script[data-tc-auto]') as HTMLScriptElement;
    if (!script) return;
    const config: TinyClawConfig = {
      apiKey:   script.dataset.apiKey,
      model:    script.dataset.model,
      accent:   script.dataset.accent,
      avatar:   script.dataset.avatar,
      position: script.dataset.position as TinyClawConfig['position'],
      title:    script.dataset.title,
      greeting: script.dataset.greeting,
    };
    new TinyClawWidget(config).mount();
  });
}
