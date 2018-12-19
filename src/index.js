const express = require('express')
const puppeteer = require('puppeteer')

const app = express()

app.get('/', (req, res) => {
	fetchNews().then(result => {
		res.send(result)
	})
})

app.listen(5000, () => {
	console.log('start to listen on 5000...')
})

const fetchNews = async () => {
	const browser = await puppeteer.launch()
	const page = await browser.newPage()
	await page.goto('http://www.hachimitsu-rocket.com/news/')
	const results = await page.evaluate(() => {
		let results = [];
		Array.prototype.forEach.call(document.querySelectorAll('.article'), el => {
			results.push({
				date: el.querySelector('.date').textContent.trim(),
				title: el.querySelector('.title > a').textContent.trim(),
				link: el.querySelector('.title > a').href.trim()
			})
		})
		return results
	})
	await browser.close()
	return results
}
