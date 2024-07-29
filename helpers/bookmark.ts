import { GoogleGenerativeAI } from '@google/generative-ai'
import { Category } from '@prisma/client'
import puppeteer from 'puppeteer'

// Fetches the title of a web page from the given URL.
export const fetchPageTitle = async (url: string): Promise<string> => {
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

  return title
}

// Extracts the main title from a given input string by splitting it on common delimiters and filtering out URL-like parts.
export const extractTitle = (title: string): string => {
  // Split the string by common delimiters excluding single hyphens within words
  let parts = title.split(/(\s[|•–]\s| - | \| )/).filter(part => part.trim().length > 0)
  // Function to check if a part is a URL or domain
  function isUrlPart(part: string): boolean {
    return /^(https?:\/\/)?(www\.)?[a-z0-9\-]+\.[a-z]{2,}([\/?#].*)?$/i.test(part)
  }
  // Find the first part that is not a URL and is not too short
  return parts.find(part => !isUrlPart(part) && part.length > 3) || parts[0]
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_SECRET as string)
export const classifyTitleCategory = async (title: string, categories: Category[]): Promise<string> => {
  // The Gemini 1.5 models are versatile and work with both text-only and multimodal prompts
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const prompt = `Which category from the list: ${categories.map(cat => JSON.stringify(cat)).join(', ')} does the title: “${title}” belong to? Return only the id of the category.`
  const result = await model.generateContent(prompt)
  const response = result.response
  return response.text()
}
