# tinyclaw-widget

> Drop-in AI chat widget powered by TinyClaw — runs entirely in the browser, no server required.

Built on [VibeClaw](https://vibeclaw.dev) + [almostnode](https://github.com/macaly/almostnode). The widget itself is proof-of-concept: it IS TinyClaw, running live in the browser.

## Install

```bash
npm install tinyclaw-widget
```

## Usage

### npm / bundler
```js
import TinyClaw from 'tinyclaw-widget';

new TinyClaw({
  apiKey: 'sk-or-...', // OpenRouter key (free tier available)
}).mount();
```

### Script tag
```html
<script src="tinyclaw-widget.umd.js" data-tc-auto data-accent="#ff5c5c"></script>
```

### Chrome Extension (content script)
```js
import TinyClaw from 'tinyclaw-widget';

new TinyClaw({
  avatar: chrome.runtime.getURL('crab.png'),
  openRouterReferer: 'chrome-extension://your-extension-id',
}).mount();
```

## Config

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `apiKey` | `string` | `''` | OpenRouter API key (or set at runtime) |
| `model` | `string` | `'upstage/solar-pro-3:free'` | Model to use |
| `kb` | `string` | VibeClaw KB | Custom knowledge base markdown |
| `avatar` | `string` | VibeClaw crab | Avatar image URL |
| `accent` | `string` | `'#ff5c5c'` | Accent colour |
| `position` | `'bottom-right' \| 'bottom-left'` | `'bottom-right'` | Widget position |
| `title` | `string` | `'TinyClaw'` | Widget header title |
| `greeting` | `string` | Default greeting | First message shown |
| `openRouterReferer` | `string` | Current origin | HTTP-Referer header |

## API

```js
const chat = new TinyClaw({ ... }).mount();

chat.open();           // Open the chat window
chat.close();          // Close it
chat.setApiKey(key);   // Set API key programmatically
chat.unmount();        // Remove from DOM
```

## License

MIT — [VibeClaw](https://vibeclaw.dev)
