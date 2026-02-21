import { test, expect, Page } from '@playwright/test';

// ── Helpers ────────────────────────────────────────────────────────────────
async function goToCreate(page: Page) {
  await page.goto('/create.html');
  await page.waitForLoadState('domcontentloaded');
}

async function selectType(page: Page, type: string) {
  await page.click(`.type-card[data-type="${type}"]`);
  await page.waitForFunction(
    (t: string) => document.querySelector(`.builder-content[data-builder="${t}"]`)?.classList.contains('active'),
    type
  );
}

/**
 * Register a queue of dialog answers before clicking a button that triggers
 * consecutive window.prompt() calls. Each answer is consumed in order.
 */
function queueDialogs(page: Page, answers: (string | null)[]) {
  const queue = [...answers];
  const handler = async (dialog: import('@playwright/test').Dialog) => {
    const answer = queue.shift();
    if (answer === null || answer === undefined) {
      await dialog.dismiss();
    } else {
      await dialog.accept(answer);
    }
    if (queue.length === 0) {
      page.off('dialog', handler);
    }
  };
  page.on('dialog', handler);
}

// ── Type Selector ──────────────────────────────────────────────────────────
test.describe('Type Selector', () => {
  test('loads with Skill active by default', async ({ page }) => {
    await goToCreate(page);
    await expect(page.locator('.type-card[data-type="skill"]')).toHaveClass(/active/);
    await expect(page.locator('.builder-content[data-builder="skill"]')).toHaveClass(/active/);
  });

  const TYPES = ['skill', 'plugin', 'tool', 'model', 'recipe', 'knowledge', 'server'] as const;

  for (const type of TYPES) {
    test(`clicking ${type} activates its card and builder`, async ({ page }) => {
      await goToCreate(page);
      await selectType(page, type);
      await expect(page.locator(`.type-card[data-type="${type}"]`)).toHaveClass(/active/);
      await expect(page.locator(`.builder-content[data-builder="${type}"]`)).toHaveClass(/active/);
      // All other builders must be hidden
      for (const other of TYPES) {
        if (other !== type) {
          await expect(page.locator(`.builder-content[data-builder="${other}"]`)).not.toHaveClass(/active/);
        }
      }
    });
  }

  test('hash updates when type is switched', async ({ page }) => {
    await goToCreate(page);
    await selectType(page, 'model');
    expect(page.url()).toContain('#model');
    await selectType(page, 'tool');
    expect(page.url()).toContain('#tool');
  });

  test('respects hash on load', async ({ page }) => {
    await page.goto('/create.html#recipe');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('.type-card[data-type="recipe"]')).toHaveClass(/active/);
    await expect(page.locator('.builder-content[data-builder="recipe"]')).toHaveClass(/active/);
  });
});

// ── Skill Builder ──────────────────────────────────────────────────────────
test.describe('Skill Builder', () => {
  test.beforeEach(async ({ page }) => {
    await goToCreate(page);
    await selectType(page, 'skill');
  });

  test('renders all required fields', async ({ page }) => {
    await expect(page.locator('#skill-name')).toBeVisible();
    await expect(page.locator('#skill-description')).toBeVisible();
    await expect(page.locator('#skill-content')).toBeVisible();
    await expect(page.locator('#add-skill-script')).toBeVisible();
    await expect(page.locator('#add-skill-reference')).toBeVisible();
    await expect(page.locator('#add-skill-asset')).toBeVisible();
  });

  test('buttons are present', async ({ page }) => {
    await expect(page.locator('#skill-test')).toBeVisible();
    await expect(page.locator('#skill-download')).toBeVisible();
    await expect(page.locator('#skill-publish')).toBeVisible();
  });

  test('fills name and description', async ({ page }) => {
    await page.fill('#skill-name', 'my-test-skill');
    await page.fill('#skill-description', 'A skill that does awesome things');
    await page.fill('#skill-content', '# My Skill\n\nDoes stuff.');
    await expect(page.locator('#skill-name')).toHaveValue('my-test-skill');
    await expect(page.locator('#skill-description')).toHaveValue('A skill that does awesome things');
  });

  test('tags input accepts tags on Enter', async ({ page }) => {
    const tagInput = page.locator('#skill-tags .tag-input');
    await tagInput.fill('automation');
    await tagInput.press('Enter');
    await expect(page.locator('#skill-tags .tag-pill')).toHaveCount(1);
    await expect(page.locator('#skill-tags .tag-pill span')).toHaveText('automation');

    await tagInput.fill('ai');
    await tagInput.press('Enter');
    await expect(page.locator('#skill-tags .tag-pill')).toHaveCount(2);
  });

  test('tags can be removed', async ({ page }) => {
    const tagInput = page.locator('#skill-tags .tag-input');
    await tagInput.fill('removeme');
    await tagInput.press('Enter');
    await expect(page.locator('#skill-tags .tag-pill')).toHaveCount(1);
    await page.locator('#skill-tags .tag-pill button').click();
    await expect(page.locator('#skill-tags .tag-pill')).toHaveCount(0);
  });

  test('Test button switches to Test tab', async ({ page }) => {
    await page.click('#skill-test');
    await expect(page.locator('.preview-tab[data-tab="test"]')).toHaveClass(/active/);
    await expect(page.locator('.preview-section[data-section="test"]')).toHaveClass(/active/);
  });

  test('Download button triggers file download', async ({ page }) => {
    await page.fill('#skill-name', 'download-skill');
    await page.fill('#skill-content', '# Download Test');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('#skill-download'),
    ]);
    expect(download.suggestedFilename()).toContain('download-skill');
    expect(download.suggestedFilename()).toContain('SKILL.md');
  });

  test('Publish button shows coming-soon alert', async ({ page }) => {
    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain('skill');
      await dialog.accept();
    });
    await page.click('#skill-publish');
  });

  test('autosave indicator appears on input', async ({ page }) => {
    await page.fill('#skill-name', 'autosave-test');
    await expect(page.locator('#autosave-indicator')).toHaveClass(/visible/, { timeout: 3000 });
  });

  test('draft persists in localStorage', async ({ page }) => {
    await page.fill('#skill-name', 'persisted-skill');
    // Wait for autosave (500ms debounce)
    await page.waitForTimeout(800);
    const saved = await page.evaluate(() => localStorage.getItem('vibeclaw-skill-draft'));
    expect(JSON.parse(saved!).name).toBe('persisted-skill');
  });
});

// ── Plugin Builder ─────────────────────────────────────────────────────────
test.describe('Plugin Builder', () => {
  test.beforeEach(async ({ page }) => {
    await goToCreate(page);
    await selectType(page, 'plugin');
  });

  test('renders all required fields', async ({ page }) => {
    await expect(page.locator('#plugin-name')).toBeVisible();
    await expect(page.locator('#plugin-description')).toBeVisible();
    await expect(page.locator('#plugin-platform')).toBeVisible();
    await expect(page.locator('#plugin-rules')).toBeVisible();
  });

  test('platform dropdown has expected options', async ({ page }) => {
    const opts = await page.locator('#plugin-platform option').allTextContents();
    expect(opts).toContain('Claude Code');
    expect(opts).toContain('Cursor');
    expect(opts).toContain('Windsurf');
  });

  test('download triggers file with .clinerules filename', async ({ page }) => {
    await page.fill('#plugin-name', 'test-plugin');
    await page.fill('#plugin-rules', '# Rules');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('#plugin-download'),
    ]);
    expect(download.suggestedFilename()).toContain('.clinerules');
  });

  test('Test and Publish buttons exist', async ({ page }) => {
    await expect(page.locator('#plugin-test')).toBeVisible();
    await expect(page.locator('#plugin-publish')).toBeVisible();
  });
});

// ── Tool Builder ───────────────────────────────────────────────────────────
test.describe('Tool Builder', () => {
  test.beforeEach(async ({ page }) => {
    await goToCreate(page);
    await selectType(page, 'tool');
  });

  test('renders all required fields', async ({ page }) => {
    await expect(page.locator('#tool-name')).toBeVisible();
    await expect(page.locator('#tool-description')).toBeVisible();
    await expect(page.locator('#tool-input-schema')).toBeVisible();
    await expect(page.locator('#tool-output-schema')).toBeVisible();
    await expect(page.locator('#tool-language')).toBeVisible();
    await expect(page.locator('#tool-implementation')).toBeVisible();
  });

  test('language dropdown has JS/Python/Bash', async ({ page }) => {
    const opts = await page.locator('#tool-language option').allTextContents();
    expect(opts).toContain('JavaScript');
    expect(opts).toContain('Python');
    expect(opts).toContain('Bash');
  });

  test('package-as checkboxes all present', async ({ page }) => {
    await expect(page.locator('#tool-package-mcp')).toBeVisible();
    await expect(page.locator('#tool-package-rest')).toBeVisible();
    await expect(page.locator('#tool-package-skill')).toBeVisible();
    await expect(page.locator('#tool-package-acp')).toBeVisible();
  });

  test('checkboxes are independently togglable', async ({ page }) => {
    await page.check('#tool-package-mcp');
    await page.check('#tool-package-rest');
    await expect(page.locator('#tool-package-mcp')).toBeChecked();
    await expect(page.locator('#tool-package-rest')).toBeChecked();
    await expect(page.locator('#tool-package-skill')).not.toBeChecked();
    await page.uncheck('#tool-package-mcp');
    await expect(page.locator('#tool-package-mcp')).not.toBeChecked();
  });

  test('download outputs a .js file', async ({ page }) => {
    await page.fill('#tool-name', 'my_tool');
    await page.fill('#tool-implementation', 'function run() {}');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('#tool-download'),
    ]);
    expect(download.suggestedFilename()).toBe('my_tool.js');
  });
});

// ── Model Builder ──────────────────────────────────────────────────────────
test.describe('Model Builder', () => {
  test.beforeEach(async ({ page }) => {
    await goToCreate(page);
    await selectType(page, 'model');
  });

  test('renders all required fields', async ({ page }) => {
    await expect(page.locator('#model-name')).toBeVisible();
    await expect(page.locator('#model-description')).toBeVisible();
    await expect(page.locator('#model-base')).toBeVisible();
    await expect(page.locator('#model-system-prompt')).toBeVisible();
    await expect(page.locator('#model-temperature')).toBeVisible();
    await expect(page.locator('#model-topp')).toBeVisible();
    await expect(page.locator('#model-max-tokens')).toBeVisible();
  });

  test('base model dropdown has expected models', async ({ page }) => {
    const opts = await page.locator('#model-base option').allTextContents();
    expect(opts.some(o => o.includes('Solar'))).toBe(true);
    expect(opts.some(o => o.includes('Llama'))).toBe(true);
    expect(opts.some(o => o.includes('DeepSeek'))).toBe(true);
  });

  test('temperature slider updates display value', async ({ page }) => {
    const slider = page.locator('#model-temperature');
    await slider.fill('1.4');
    await slider.dispatchEvent('input');
    await expect(page.locator('#model-temp-value')).toHaveText('1.4');
  });

  test('top-p slider updates display value', async ({ page }) => {
    const slider = page.locator('#model-topp');
    await slider.fill('0.75');
    await slider.dispatchEvent('input');
    await expect(page.locator('#model-topp-value')).toHaveText('0.75');
  });

  test('temperature defaults to 0.7 and top-p to 0.9', async ({ page }) => {
    await expect(page.locator('#model-temp-value')).toHaveText('0.7');
    await expect(page.locator('#model-topp-value')).toHaveText('0.9');
    await expect(page.locator('#model-max-tokens')).toHaveValue('4096');
  });

  test('download outputs a -config.json file', async ({ page }) => {
    await page.fill('#model-name', 'my-model');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('#model-download'),
    ]);
    expect(download.suggestedFilename()).toBe('my-model-config.json');
  });

  test('downloaded config JSON is valid and contains model fields', async ({ page }) => {
    await page.fill('#model-name', 'test-model');
    await page.fill('#model-system-prompt', 'You are helpful.');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('#model-download'),
    ]);
    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) chunks.push(Buffer.from(chunk));
    const json = JSON.parse(Buffer.concat(chunks).toString());
    expect(json.name).toBe('test-model');
    expect(json.systemPrompt).toBe('You are helpful.');
    expect(typeof json.temperature).toBe('number');
  });

  test('Test button switches to Test tab', async ({ page }) => {
    await page.click('#model-test');
    await expect(page.locator('.preview-section[data-section="test"]')).toHaveClass(/active/);
  });
});

// ── Recipe Builder ─────────────────────────────────────────────────────────
test.describe('Recipe Builder', () => {
  test.beforeEach(async ({ page }) => {
    await goToCreate(page);
    await selectType(page, 'recipe');
  });

  test('renders all required fields', async ({ page }) => {
    await expect(page.locator('#recipe-name')).toBeVisible();
    await expect(page.locator('#recipe-description')).toBeVisible();
    await expect(page.locator('#recipe-server-type')).toBeVisible();
    await expect(page.locator('#recipe-notes')).toBeVisible();
    await expect(page.locator('#recipe-config')).toBeVisible();
  });

  test('server type dropdown has expected options', async ({ page }) => {
    const opts = await page.locator('#recipe-server-type option').allTextContents();
    expect(opts).toContain('Node.js');
    expect(opts).toContain('Python');
    expect(opts).toContain('Go');
    expect(opts).toContain('Docker');
  });

  test('can add and remove env vars', async ({ page }) => {
    await page.click('#add-recipe-env');
    const rows = page.locator('#recipe-env-vars .kv-row');
    await expect(rows).toHaveCount(2); // 1 default + 1 new
    await rows.nth(1).locator('input.env-key').fill('MY_KEY');
    await rows.nth(1).locator('input.env-value').fill('my_value');
    await rows.nth(1).locator('button').click();
    await expect(rows).toHaveCount(1);
  });

  test('can add prerequisites', async ({ page }) => {
    queueDialogs(page, ['Node.js >= 18', 'node install']);
    await page.click('#add-recipe-prerequisite');
    await expect(page.locator('#recipe-prerequisites .list-item')).toHaveCount(1);
  });

  test('download and publish buttons present', async ({ page }) => {
    await expect(page.locator('#recipe-download')).toBeVisible();
    await expect(page.locator('#recipe-publish')).toBeVisible();
  });
});

// ── Knowledge Base Builder ─────────────────────────────────────────────────
test.describe('Knowledge Base Builder', () => {
  test.beforeEach(async ({ page }) => {
    await goToCreate(page);
    await selectType(page, 'knowledge');
  });

  test('renders all required fields', async ({ page }) => {
    await expect(page.locator('#kb-name')).toBeVisible();
    await expect(page.locator('#kb-description')).toBeVisible();
    await expect(page.locator('#kb-upload')).toBeVisible();
    await expect(page.locator('#add-kb-document')).toBeVisible();
  });

  test('can add document via prompt', async ({ page }) => {
    queueDialogs(page, ['test-doc', 'https://example.com/doc']);
    await page.click('#add-kb-document');
    await expect(page.locator('#kb-documents .list-item')).toHaveCount(1);
    await expect(page.locator('#kb-documents .list-item-title')).toHaveText('test-doc');
    await expect(page.locator('#kb-documents .list-item-meta')).toHaveText('URL');
  });

  test('URL detection shows "URL" meta, pasted text shows "Text"', async ({ page }) => {
    queueDialogs(page, ['plain-doc', 'some plain text content here']);
    await page.click('#add-kb-document');
    await expect(page.locator('#kb-documents .list-item-meta')).toHaveText('Text');
  });

  test('document can be removed', async ({ page }) => {
    queueDialogs(page, ['removeable-doc', 'http://remove.me']);
    await page.click('#add-kb-document');
    await expect(page.locator('#kb-documents .list-item')).toHaveCount(1);
    await page.click('#kb-documents .list-item button');
    await expect(page.locator('#kb-documents .list-item')).toHaveCount(0);
  });

  test('download outputs a -kb.json file', async ({ page }) => {
    await page.fill('#kb-name', 'my-knowledge');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('#kb-download'),
    ]);
    expect(download.suggestedFilename()).toBe('my-knowledge-kb.json');
  });

  test('file upload zone is visible and accepts click', async ({ page }) => {
    await expect(page.locator('#kb-upload')).toBeVisible();
    // Check file input is wired (exists, hidden)
    await expect(page.locator('#kb-file-input')).toBeAttached();
  });
});

// ── Server Builder ─────────────────────────────────────────────────────────
test.describe('Server Builder', () => {
  test.beforeEach(async ({ page }) => {
    await goToCreate(page);
    await selectType(page, 'server');
  });

  test('renders all required fields', async ({ page }) => {
    await expect(page.locator('#server-name')).toBeVisible();
    await expect(page.locator('#server-description')).toBeVisible();
    await expect(page.locator('#server-framework')).toBeVisible();
    await expect(page.locator('#server-config')).toBeVisible();
  });

  test('framework dropdown has expected options', async ({ page }) => {
    const opts = await page.locator('#server-framework option').allTextContents();
    expect(opts).toContain('Express');
    expect(opts).toContain('Fastify');
    expect(opts).toContain('Next.js');
    expect(opts).toContain('FastAPI');
  });

  test('download outputs a -config.json file', async ({ page }) => {
    await page.fill('#server-name', 'my-server');
    await page.fill('#server-config', '{"port": 3000}');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('#server-download'),
    ]);
    expect(download.suggestedFilename()).toBe('my-server-config.json');
  });

  test('publish button present', async ({ page }) => {
    await expect(page.locator('#server-publish')).toBeVisible();
  });
});

// ── Preview Panel ──────────────────────────────────────────────────────────
test.describe('Preview Panel', () => {
  test.beforeEach(async ({ page }) => {
    await goToCreate(page);
  });

  test('Preview tab is active by default', async ({ page }) => {
    await expect(page.locator('.preview-tab[data-tab="preview"]')).toHaveClass(/active/);
    await expect(page.locator('.preview-section[data-section="preview"]')).toHaveClass(/active/);
  });

  test('can switch to Test tab', async ({ page }) => {
    await page.click('.preview-tab[data-tab="test"]');
    await expect(page.locator('.preview-tab[data-tab="test"]')).toHaveClass(/active/);
    await expect(page.locator('.preview-section[data-section="test"]')).toHaveClass(/active/);
    await expect(page.locator('.preview-section[data-section="preview"]')).not.toHaveClass(/active/);
  });

  test('can switch to Code tab', async ({ page }) => {
    await page.click('.preview-tab[data-tab="code"]');
    await expect(page.locator('.preview-tab[data-tab="code"]')).toHaveClass(/active/);
    await expect(page.locator('.preview-section[data-section="code"]')).toHaveClass(/active/);
  });

  test('chat input and send button exist in Test tab', async ({ page }) => {
    await page.click('.preview-tab[data-tab="test"]');
    await expect(page.locator('#chat-input')).toBeVisible();
    await expect(page.locator('#chat-send')).toBeVisible();
  });

  test('chat send with Enter key fires same handler', async ({ page }) => {
    await page.click('.preview-tab[data-tab="test"]');
    // Fill chat input; mock the fetch so it doesn't hit network
    await page.route('/api/chat', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ choices: [{ message: { content: 'hello from mock' } }] }),
      });
    });
    await page.fill('#chat-input', 'test message');
    await page.locator('#chat-input').press('Enter');
    // User message should appear
    await expect(page.locator('.chat-message.user')).toHaveCount(1);
    await expect(page.locator('.chat-message.user')).toHaveText('test message');
    // Assistant reply
    await expect(page.locator('.chat-message.assistant')).toHaveCount(1, { timeout: 5000 });
    await expect(page.locator('.chat-message.assistant')).toHaveText('hello from mock');
  });
});

// ── AI Assist Bar ──────────────────────────────────────────────────────────
test.describe('AI Assist Bar', () => {
  test.beforeEach(async ({ page }) => {
    await goToCreate(page);
  });

  test('AI Assist bar is visible', async ({ page }) => {
    await expect(page.locator('#ai-assist-bar')).toBeVisible();
    await expect(page.locator('#ai-assist-input')).toBeVisible();
    await expect(page.locator('#ai-assist-go')).toBeVisible();
  });

  test('Build it button calls API and fills form', async ({ page }) => {
    await page.route('/api/chat', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          choices: [{
            message: {
              content: JSON.stringify({
                name: 'ai-generated-skill',
                description: 'Does AI things',
                content: '# AI Skill\n\nInstructions here.',
              }),
            },
          }],
        }),
      });
    });
    await page.fill('#ai-assist-input', 'A skill that monitors GitHub and pings Slack');
    await page.click('#ai-assist-go');
    await expect(page.locator('#ai-assist-status')).toContainText('filled', { timeout: 5000 });
    await expect(page.locator('#skill-name')).toHaveValue('ai-generated-skill');
    // textarea value — use toHaveValue, not toContainText
    await expect(page.locator('#skill-content')).toHaveValue(/AI Skill/);
  });

  test('shows error status on API failure', async ({ page }) => {
    await page.route('/api/chat', async route => {
      await route.fulfill({ status: 500, body: 'Server Error' });
    });
    await page.fill('#ai-assist-input', 'something');
    await page.click('#ai-assist-go');
    await expect(page.locator('#ai-assist-status')).toContainText('Error', { timeout: 5000 });
  });

  test('button is disabled while loading', async ({ page }) => {
    let resolve!: () => void;
    const block = new Promise<void>(r => { resolve = r; });
    await page.route('/api/chat', async route => {
      await block;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ choices: [{ message: { content: '{}' } }] }),
      });
    });
    await page.fill('#ai-assist-input', 'build me something');
    await page.click('#ai-assist-go');
    await expect(page.locator('#ai-assist-go')).toBeDisabled();
    resolve();
    await expect(page.locator('#ai-assist-go')).toBeEnabled({ timeout: 3000 });
  });
});

// ── Navigation ─────────────────────────────────────────────────────────────
test.describe('Navigation', () => {
  test('all nav links render on create page', async ({ page }) => {
    await goToCreate(page);
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('nav a[href="/explore.html"]')).toBeVisible();
    await expect(page.locator('nav a[href="/create.html"]')).toBeVisible();
  });

  test('Create nav link is marked active', async ({ page }) => {
    await goToCreate(page);
    await expect(page.locator('nav a[href="/create.html"]')).toHaveClass(/nav-active/);
  });
});
