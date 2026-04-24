// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('math-quest smoke', () => {
  test('hub loads with both game cards', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('MATH QUEST', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /Jeopardy/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Gem Quest/i })).toBeVisible();
  });

  test('Jeopardy opens to team setup', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Jeopardy/i }).click();
    await expect(page.getByText('Ready to play?')).toBeVisible();
    await expect(page.getByRole('button', { name: /LET'S PLAY/i })).toBeVisible();
  });

  test('Jeopardy board shows 5 categories with LaTeX fraction in a clue', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Jeopardy/i }).click();
    await page.getByRole('button', { name: /LET'S PLAY/i }).click();
    // Category strip
    await expect(page.getByText('ADD & SUBTRACT')).toBeVisible();
    await expect(page.getByText('SIMPLEST FORM')).toBeVisible();
    // Open a $100 clue from the Simplest Form column and confirm KaTeX rendered
    const tile = page.getByRole('button', { name: '$100' }).nth(2);
    await tile.click();
    // KaTeX injects .katex elements for math segments
    await expect(page.locator('.katex').first()).toBeVisible();
  });

  test('Gem Quest shows HUD with ⚡, 💎, 🍌 stats', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Gem Quest/i }).click();
    await expect(page.getByText('⚡')).toBeVisible();
    await expect(page.getByText('💎')).toBeVisible();
    await expect(page.getByText('0/10')).toBeVisible();
    await expect(page.getByRole('button', { name: /JEOPARDY/i })).toBeVisible();
  });

  test('back-to-menu returns from Gem Quest to hub', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /Gem Quest/i }).click();
    await page.getByRole('button', { name: /◀ Menu/ }).click();
    await expect(page.getByText('MATH QUEST', { exact: true })).toBeVisible();
  });
});
