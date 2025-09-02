import puppeteer from "puppeteer";


export async function postToLinkedIn(content) {
  const browser = await puppeteer.launch({ headless: false }); // set to true for background
  const page = await browser.newPage();

  // Go to LinkedIn
  await page.goto("https://www.linkedin.com/login");

  // Login
  await page.type("#username", process.env.LINKEDIN_EMAIL, { delay: 50 });
  await page.type("#password", process.env.LINKEDIN_PASSWORD, { delay: 50 });
  await page.click('[type="submit"]');
  await page.waitForNavigation();

  // Go to home (feed)
  await page.goto("https://www.linkedin.com/feed/");

  // Click "Start a post"
  await page.waitForSelector(".share-box-feed-entry__trigger");
  await page.click(".share-box-feed-entry__trigger");

  // Type content into editor
  await page.waitForSelector(".ql-editor[role='textbox']", { visible: true });
  await page.type(".ql-editor[role='textbox']", content, { delay: 20 });

  // Click Post button
  await page.waitForSelector("button.share-actions__primary-action");
  await page.click("button.share-actions__primary-action");

  console.log("✅ Post submitted to LinkedIn!");

  await browser.close();
}






