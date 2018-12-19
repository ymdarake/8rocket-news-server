require('dotenv').config()
const express = require('express')
const axios = require('axios')
const puppeteer = require('puppeteer')

const app = express()

app.get('/', (req, res) => {
	fetchNews().then(result => {
		res.send(result)
	})
})
app.get('/push', async (req, res) => {
	await sendPush()
	res.send('sent')
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

/**
 * @link https://firebase.google.com/docs/cloud-messaging/http-server-ref
 * Firebase Cloud Messaging の HTTP プロトコル
 */
const sendPush = async () => {
	const res = await axios.post(
		'https://fcm.googleapis.com/fcm/send',
		{
			"to": "/topics/all",
			"priority": "high",
			"notification": {
				"title": "テスト Title",
				"body": "テスト Body"
			},
			"data": {
				"id": "1002",
				"message": "message 文字列",
				"metadata": "metadata 文字列",
				"click_action": "FLUTTER_NOTIFICATION_CLICK"
			}
		},
		{
			headers: {
				'Authorization': `key=${process.env.FCM_SERVER_KEY}`,
				'Content-Type': "application/json"
			}
		}
	).catch(err => console.log(err))
}