import { expect, test } from "@playwright/test";
import { startApp } from "../application/app.js";
import { bumpVersion } from "../application/modules/version.js";

let app;

/** @type {import('playwright').Page} */
let page;

test.beforeAll(async ({ browser }) => {
  app = await startApp();
  page = await browser.newPage();
  await page.goto(app.url);
});

test("shows warning on new version", async () => {
  bumpVersion();
  await page.getByTestId("todo-input").press("Enter");
  await expect(page.getByRole("alert")).toHaveText(
    "🎉 New Release | Please refresh the page to use the latest version",
  );
  await page.getByTestId("close").click();
  await expect(page.getByRole("alert")).toBeHidden();
});
