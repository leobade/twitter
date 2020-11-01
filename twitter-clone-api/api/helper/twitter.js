const axios = require('axios')

const URL = 'https://api.twitter.com/1.1/search/tweets.json'
const TREND_URL = 'https://api.twitter.com/1.1/trends/place.json'
class Twitter {

    get(query, count, maxId) {
        return axios.get(URL, {
            params: {
                q: query,
                count: count,
                tweet_mode: "extended",
                max_id: maxId
            },
            headers: {
                "Authorization": `Bearer ${process.env.TWITTER_API_TOKEN}`

            }

        })
    }

    getTrend(id) {
        return axios.get(TREND_URL, {
            params: {
                id: id
            },
            headers: {
                "Authorization": `Bearer ${process.env.TWITTER_API_TOKEN}`

            }

        })
    }
}

module.exports = Twitter