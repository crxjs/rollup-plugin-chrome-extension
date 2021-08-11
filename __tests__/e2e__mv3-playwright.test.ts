// import { remove } from 'fs-extra'
import { chromium, ChromiumBrowserContext, Page } from 'playwright'
import { InputOptions, OutputOptions, rollup } from 'rollup'
import { getExtPath, getTestName, requireExtFile } from '../__fixtures__/utils'

const testName = getTestName(__filename)
const dataDirPath = getExtPath(testName, 'chromium-data-dir')
const distDirPath = getExtPath(testName, 'dist')

let browserContext: ChromiumBrowserContext
let page: Page

beforeAll(async () => {
  const config = requireExtFile(__filename, 'rollup.config.js') as InputOptions & { output: OutputOptions }
  const bundle = await rollup(config)
  await bundle.write(config.output)

  browserContext = (await chromium.launchPersistentContext(dataDirPath, {
    headless: false,
    slowMo: 100,
    args: [`--disable-extensions-except=${distDirPath}`, `--load-extension=${distDirPath}`],
  })) as ChromiumBrowserContext
}, 30000)

// afterAll(() => remove(distDirPath))
// afterAll(async () => {
//   await browserContext.close()
// })

test('CRX loads and runs successfully', async () => {
  page = await browserContext.newPage()
  await page.goto('https://google.com')

  await page.waitForSelector('text="Content script loaded"')
  await page.waitForSelector('text="Background OK"')
  await page.waitForSelector('text="Options page OK"')
})
