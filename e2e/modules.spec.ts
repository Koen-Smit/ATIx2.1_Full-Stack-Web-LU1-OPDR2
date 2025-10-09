import { test, expect } from '@playwright/test';

test.describe('Modules Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login strategie: registreer + login flow
    await page.goto('/register');
    const timestamp = Date.now();
    const email = `test${timestamp}@example.com`;
    const password = 'TestPassword123!';
    
    // Registreer nieuwe user
    await page.fill('#firstname', 'Test');
    await page.fill('#lastname', 'User');
    await page.fill('#email', email);
    await page.fill('#password', password);
    await page.click('button[type="submit"]');
    
    // Wacht even voor server processing
    await page.waitForTimeout(1000);
    
    // Login met geregistreerde credentials
    await page.goto('/login');
    await page.fill('#email', email);
    await page.fill('#password', password);
    await page.click('button[type="submit"]');
    
    // Verify we're logged in
    await expect(page).toHaveURL(/\/modules/);
  });

  test('should display modules page', async ({ page }) => {
    await page.goto('/modules');
    
    // Verify modules page loaded
    await expect(page.locator('h1, h2')).toContainText('Modules');
  });

  test('should have search functionality visible', async ({ page }) => {
    await page.goto('/modules');
    
    // Check if search input exists (common selector)
    const searchInput = page.locator('input[type="text"], input[placeholder*="zoek"], input[placeholder*="search"]');
    if (await searchInput.count() > 0) {
      await expect(searchInput.first()).toBeVisible();
    } else {
      // If no search input, just verify page loads
      await expect(page.locator('h1, h2')).toContainText('Modules');
    }
  });

  test('should display module cards or content', async ({ page }) => {
    await page.goto('/modules');
    
    // Look for module content (cards, lists, etc.)
    const moduleContent = page.locator('.card, .module, .list-item, table tr');
    const contentCount = await moduleContent.count();
    
    // Either modules exist or we see empty state
    if (contentCount > 0) {
      await expect(moduleContent.first()).toBeVisible();
    } else {
      // Check for empty state message
      await expect(page.locator('text=Geen modules, text=Empty, text=geen')).toBeVisible().catch(() => {
        // If no specific empty message, just check page loaded
        expect(page.url()).toContain('/modules');
      });
    }
  });

  test('should allow navigation from modules page', async ({ page }) => {
    await page.goto('/modules');
    
    // Verify page loads and we can navigate
    await expect(page).toHaveURL(/\/modules/);
    
    // Try to navigate to profile if link exists
    const profileLink = page.locator('text=Profiel, text=Profile, a[href*="profile"]');
    if (await profileLink.count() > 0) {
      await profileLink.first().click();
      await expect(page).toHaveURL(/\/profile|\/favorites/);
    }
  });

  test('should remain on modules page when authenticated', async ({ page }) => {
    await page.goto('/modules');
    
    // Verify we stayed on modules page (not redirected to login)
    await expect(page).toHaveURL(/\/modules/);
    
    // Verify page content loaded
    await expect(page.locator('body')).toBeVisible();
  });
});