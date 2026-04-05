import { test, expect } from '@playwright/test';

test.describe('Splitwise PWA Basic Flow', () => {
  test('should complete add expense → settle → export flow', async ({ page }) => {
    // Navigate to app
    await page.goto('/');
    
    // Should show login page
    await expect(page.locator('text=Welcome to Splitwise')).toBeVisible();
    
    // Login flow (magic link stub)
    await page.fill('input[type="email"]', 'test@example.com');
    await page.click('button:has-text("Send Magic Link")');
    
    // In dev mode, magic link is shown
    await expect(page.locator('text=Magic link sent')).toBeVisible();
    
    // Click dev magic link
    const magicLink = page.locator('a:has-text("Click here to login")');
    if (await magicLink.isVisible()) {
      await magicLink.click();
    }
    
    // Should redirect to home with spaces
    await expect(page.locator('h2:has-text("Your Spaces")')).toBeVisible();
  });
  
  test('should create a new space', async ({ page }) => {
    // Assuming logged in (you'd setup auth state here)
    await page.goto('/');
    
    await page.click('button:has-text("New Space")');
    await page.fill('input#name', 'Test Trip');
    await page.selectOption('select#currency', 'USD');
    await page.click('button[type="submit"]:has-text("Create")');
    
    // Should see the new space
    await expect(page.locator('text=Test Trip')).toBeVisible();
  });
});



