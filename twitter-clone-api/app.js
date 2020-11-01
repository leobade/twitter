
const express = require('express')
const app = express()
const port = 3000
require('dotenv').config()
const Twitter = require('./api/helper/twitter')
const twitter = new Twitter
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    next();
})
app.get('/tweets', (req, res) => {
    const query = req.query.q
    const count = req.query.count
    const maxId = req.query.max_id

    twitter.get(query, count, maxId).then((response) => {
        res.status(200).send(response.data)
    }).catch((err) => {
        res.status(400).send(err)
    })
})

app.get('/tweets-trend', (req, res) => {
    const id = req.query.id

    twitter.getTrend(id).then((response) => {
        res.status(200).send(response.data)
    }).catch((err) => {
        res.status(400).send(err)
    })
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})