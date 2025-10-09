import { test, expect } from '@playwright/test';

test.describe('Profile Tests', () => {
  
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

  test('should access profile page', async ({ page }) => {
    await page.goto('/profile');
    
    // Verify profile page loads or redirects properly
    const currentUrl = page.url();
    
    // Should be on profile page or protected area
    expect(currentUrl).toMatch(/\/profile|\/favorites|\/modules/);
  });

  test('should remain authenticated on profile pages', async ({ page }) => {
    // Test multiple profile-related pages
    const pages = ['/profile', '/favorites'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      
      // Should not redirect to login (would indicate auth failure)
      const currentUrl = page.url();
      expect(currentUrl).not.toContain('/login');
      
      // Page should load
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('should handle navigation between authenticated pages', async ({ page }) => {
    await page.goto('/modules');
    await expect(page).toHaveURL(/\/modules/);
    
    await page.goto('/profile');
    // Should stay in authenticated area
    expect(page.url()).toMatch(/\/profile|\/favorites|\/modules/);
    
    await page.goto('/favorites');
    await expect(page).toHaveURL(/\/favorites/);
  });
});