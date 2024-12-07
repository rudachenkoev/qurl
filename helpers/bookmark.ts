import { Category } from '@prisma/client'
import axios from 'axios'
import puppeteer from 'puppeteer'

// Fetches the title of a web page from the given URL.
interface PageInfo {
  title: string
  description: string
}
export const fetchPageInfo = async (url: string): Promise<PageInfo> => {
  const browser = await puppeteer.launch()
  try {
    const page = await browser.newPage()

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    )

    await page.goto(url, { waitUntil: 'domcontentloaded' })

    return await page.evaluate(() => {
      const title = document.title
      const descriptionMeta = document.querySelector('meta[name="description"]')
      const description = descriptionMeta?.getAttribute('content') || ''

      return { title, description }
    })
  } catch (error) {
    console.error('Error fetching page info:', error)
    throw new Error('Failed to fetch the page info')
  } finally {
    if (browser) await browser.close()
  }
}

// Extracts the main title from a given input string by splitting it on common delimiters and filtering out URL-like parts.
export const extractTitle = (title: string): string => {
  const parts = title.split(/\s[|•–-]\s| - | \| /).filter(part => part.trim().length > 0)

  const isUrlPart = (part: string): boolean => /^(https?:\/\/)?(www\.)?[a-z0-9-]+\.[a-z]{2,}([\/?#].*)?$/i.test(part)

  return parts.find(part => !isUrlPart(part) && part.length > 3) || parts[0]
}

export const classifyTitleCategory = async (title: string, categories: Partial<Category>[]): Promise<number | null> => {
  try {
    const labels = categories.map(({ name }) => name)

    const { data } = await axios.post(
      'https://api-inference.huggingface.co/models/facebook/bart-large-mnli',
      {
        inputs: title,
        parameters: { candidate_labels: labels }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`
        }
      }
    )

    return categories.find(({ name }) => name === data.labels[0])?.id || null
  } catch (error) {
    console.error('Error during title classification:', error)
    throw new Error('Title classification failed')
  }
}
