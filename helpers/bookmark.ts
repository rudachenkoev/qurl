import { Category } from '@prisma/client'
import axios, { AxiosError } from 'axios'
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

export const classifyTitleCategory = async (
  title: string,
  categories: Partial<Category>[]
): Promise<{ labels: string[]; scores: number[] }> => {
  const models = ['facebook/bart-large-mnli', 'joeddav/xlm-roberta-large-xnli', 'valhalla/distilbart-mnli-12-1']

  const labels = categories.map(({ name }) => name)

  // Divide the categories into groups of no more than 10 each
  const labelChunks = Array.from({ length: Math.ceil(labels.length / 10) }, (_, i) => labels.slice(i * 10, i * 10 + 10))

  for (const model of models) {
    try {
      const results: { label: string; score: number }[] = []

      for (const chunk of labelChunks) {
        const { data } = await axios.post(
          `https://api-inference.huggingface.co/models/${model}`,
          {
            inputs: title,
            parameters: { candidate_labels: chunk }
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.HF_TOKEN}`
            }
          }
        )

        // Save the results of the current group
        results.push(
          ...data.labels.map((label: string, idx: number) => ({
            label,
            score: data.scores[idx]
          }))
        )
      }

      // Sorting out the results and bringing back the top 3
      results.sort((a, b) => b.score - a.score)
      return {
        labels: results.slice(0, 3).map(result => result.label),
        scores: results.slice(0, 3).map(result => result.score)
      }
    } catch (error) {
      const status = (error as AxiosError).response?.status
      console.warn(`Model ${model} failed with status ${status}. Trying the next model.`)
    }
  }

  throw new Error('Title classification failed with all models')
}
