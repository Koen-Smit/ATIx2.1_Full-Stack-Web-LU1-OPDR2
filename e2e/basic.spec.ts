import { test, expect } from '@playwright/test';

test.describe('Basic Connectivity Tests', () => {
  
  test('should load the application homepage', async ({ page }) => {
    await page.goto('/');
    
    // Verify page loads (should redirect to /modules)
    await expect(page).toHaveURL(/\/modules|\/login/);
    
    // Verify page content loaded
    await expect(page.locator('body')).toBeVisible();
  });

  test('should be able to navigate to login page', async ({ page }) => {
    await page.goto('/login');
    
    // Verify login page loads
    await expect(page).toHaveURL(/\/login/);
    
    // Verify login form elements exist
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should be able to navigate to register page', async ({ page }) => {
    await page.goto('/register');
    
    // Verify register page loads
    await expect(page).toHaveURL(/\/register/);
    
    // Verify register form elements exist
    await expect(page.locator('#firstname')).toBeVisible();
    await expect(page.locator('#lastname')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });
});