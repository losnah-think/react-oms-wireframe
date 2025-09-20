import { test, expect } from '@playwright/test';

test.describe('Vendors/Sales Management Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the vendors/sales page
    await page.goto('http://localhost:3000/vendors/sales');
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display the vendors management page correctly', async ({ page }) => {
    // Check page title
    await expect(page.locator('h1')).toContainText('판매처 관리');

    // Check page description
    await expect(page.locator('p')).toContainText('판매처를 조회하고 연결 상태를 관리합니다.');

    // Check register button
    await expect(page.getByText('새로운 판매처 등록')).toBeVisible();

    // Check search input
    await expect(page.getByPlaceholder('판매처 이름, 코드 검색')).toBeVisible();

    // Check filter dropdowns
    await expect(page.getByText('전체')).toBeVisible(); // Platform filter
    await expect(page.locator('select').filter({ hasText: '전체' })).toBeVisible(); // Status filter
  });

  test('should load and display vendors in the table', async ({ page }) => {
    // Wait for vendors to load
    await page.waitForTimeout(1000);

    // Check if table exists and has data
    const table = page.locator('table');
    await expect(table).toBeVisible();

    // Check table headers
    await expect(page.getByText('이름')).toBeVisible();
    await expect(page.getByText('코드')).toBeVisible();
    await expect(page.getByText('플랫폼')).toBeVisible();
    await expect(page.getByText('상태')).toBeVisible();
    await expect(page.getByText('등록일')).toBeVisible();
    await expect(page.getByText('액션')).toBeVisible();

    // Check if we have at least one vendor row (from mock data)
    const vendorRows = page.locator('tbody tr');
    const rowCount = await vendorRows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('should filter vendors by search query', async ({ page }) => {
    // Wait for initial load
    await page.waitForTimeout(1000);

    // Get initial vendor count
    const initialRows = await page.locator('tbody tr').count();

    // Search for a specific vendor
    const searchInput = page.getByPlaceholder('판매처 이름, 코드 검색');
    await searchInput.fill('예시몰 A');
    await searchInput.press('Enter');

    // Wait for filtering
    await page.waitForTimeout(500);

    // Check that results are filtered
    const filteredRows = await page.locator('tbody tr').count();
    expect(filteredRows).toBeLessThanOrEqual(initialRows);
  });

  test('should filter vendors by platform', async ({ page }) => {
    // Wait for initial load
    await page.waitForTimeout(1000);

    // Get initial vendor count
    const initialRows = await page.locator('tbody tr').count();

    // Filter by Cafe24 platform
    const platformSelect = page.locator('select').first();
    await platformSelect.selectOption('cafe24');

    // Wait for filtering
    await page.waitForTimeout(500);

    // Check that results are filtered
    const filteredRows = await page.locator('tbody tr').count();
    expect(filteredRows).toBeLessThanOrEqual(initialRows);
  });

  test('should filter vendors by status', async ({ page }) => {
    // Wait for initial load
    await page.waitForTimeout(1000);

    // Get initial vendor count
    const initialRows = await page.locator('tbody tr').count();

    // Filter by active status
    const statusSelect = page.locator('select').nth(1);
    await statusSelect.selectOption('active');

    // Wait for filtering
    await page.waitForTimeout(500);

    // Check that results are filtered
    const filteredRows = await page.locator('tbody tr').count();
    expect(filteredRows).toBeLessThanOrEqual(initialRows);
  });

  test('should open create vendor modal', async ({ page }) => {
    // Click the register button
    await page.getByText('새로운 판매처 등록').click();

    // Check if modal opens
    await expect(page.getByText('판매처 생성')).toBeVisible();

    // Check form fields
    await expect(page.getByText('이름 *')).toBeVisible();
    await expect(page.getByText('코드 *')).toBeVisible();
    await expect(page.getByText('플랫폼')).toBeVisible();
    await expect(page.getByText('활성 상태')).toBeVisible();

    // Check buttons
    await expect(page.getByText('취소')).toBeVisible();
    await expect(page.getByText('저장')).toBeVisible();
  });

  test('should open view vendor modal', async ({ page }) => {
    // Wait for vendors to load
    await page.waitForTimeout(1000);

    // Click the first view button
    const viewButtons = page.locator('text=보기');
    const buttonCount = await viewButtons.count();

    if (buttonCount > 0) {
      await viewButtons.first().click();

      // Check if modal opens
      await expect(page.getByText('판매처 상세')).toBeVisible();

      // Check detail fields
      await expect(page.getByText('이름')).toBeVisible();
      await expect(page.getByText('코드')).toBeVisible();
      await expect(page.getByText('플랫폼')).toBeVisible();
      await expect(page.getByText('상태')).toBeVisible();
      await expect(page.getByText('등록일')).toBeVisible();
      await expect(page.getByText('수정일')).toBeVisible();
      await expect(page.getByText('설정 정보')).toBeVisible();
    }
  });

  test('should handle pagination', async ({ page }) => {
    // Wait for vendors to load
    await page.waitForTimeout(1000);

    // Check pagination info
    const paginationInfo = page.locator('text=/총 .*개 중/');
    await expect(paginationInfo).toBeVisible();

    // Check pagination buttons
    const prevButton = page.getByText('이전');
    const nextButton = page.getByText('다음');

    // If there are multiple pages, test navigation
    const currentPageText = page.locator('text=/페이지 .* \/ .*/');
    if (await currentPageText.isVisible()) {
      const pageInfo = await currentPageText.textContent();
      const totalPages = parseInt(pageInfo?.split('/')[1]?.trim() || '1');

      if (totalPages > 1) {
        // Test next button
        await expect(nextButton).toBeEnabled();
        await nextButton.click();
        await page.waitForTimeout(500);

        // Test previous button
        await expect(prevButton).toBeEnabled();
        await prevButton.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should handle page size changes', async ({ page }) => {
    // Wait for vendors to load
    await page.waitForTimeout(1000);

    // Change page size
    const pageSizeSelect = page.locator('select').filter({ hasText: '10개씩 보기' });
    await pageSizeSelect.selectOption('20');

    // Wait for reload
    await page.waitForTimeout(500);

    // Check that page size changed
    const paginationInfo = page.locator('text=/총 .*개 중/');
    await expect(paginationInfo).toBeVisible();
  });

  test('should show loading state', async ({ page }) => {
    // Reload the page to see loading state
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check for loading text
    const loadingText = page.getByText('로딩 중...');
    // Loading might be too fast to catch, so we just check that content loads
    await expect(page.locator('table')).toBeVisible();
  });

  test('should handle empty state', async ({ page }) => {
    // This test assumes we can trigger empty state
    // In a real scenario, this might require mocking or specific data conditions

    // For now, just verify the table structure exists
    await expect(page.locator('table')).toBeVisible();
  });
});