import puppeteer from 'puppeteer'

// Fetches the title of a web page from the given URL.
export const fetchPageTitle = async (url: string, useExtractTitle = true): Promise<string> => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  // Set a user agent to mimic a real browser
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  )
  // Navigate to the page and wait for the necessary network activity
  await page.goto(url)
  // Wait for the title to be visible
  await page.waitForSelector('title')
  // Extract the title
  const title = await page.title()
  await browser.close()

  return useExtractTitle ? extractTitle(title) : title
}

// Extracts the main title from a given input string by splitting it on common delimiters and filtering out URL-like parts.
const extractTitle = (title: string): string => {
  // Split the string by common delimiters
  let parts = title.split(/[|•–-]/)
  // Trim each part and filter out empty strings
  parts = parts.map(part => part.trim()).filter(part => part.length > 0)
  // Function to check if a part is a URL or domain
  function isUrlPart(part: string): boolean {
    return /^(https?:\/\/)?(www\.)?[a-z0-9\-]+\.[a-z]{2,}([\/?#].*)?$/i.test(part)
  }
  // Find the first part that is not a URL and is not too short
  return parts.find(part => !isUrlPart(part) && part.length > 3) || title
}
