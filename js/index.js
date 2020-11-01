const URL = "http://localhost:3000/tweets";
const URL_TREND = "http://localhost:3000/tweets-trend";
const trend_id_los_angeles = 2442047;
const API_LIMIT = 10;
let next_page_url = null;

const onEnter = (e) => {
    if (e.key == 'Enter') {
        getTwitterData();
    }
}
const onNextPage = () => {

    if (next_page_url) {
        getTwitterData(true);
    }
}

window.onload = function () {
    reset();
    getTrends();
}

const reset = () => {
    document.getElementById('user-search-input').value = '';
    document.getElementById('next-page-container').style.display = 'none';
}

/**
 * Retrive Twitter Data from API
 */
const getTwitterData = (nextPage = false) => {
    //I need to encode the query params, to ensure that the url work fine
    const userSearchInput = encodeURIComponent(document.getElementById('user-search-input').value);
    if (userSearchInput) {
        let fullUrl = `${URL}?q=${userSearchInput}&count=${API_LIMIT}&tweet_mode=extended&result_type=popular`
        if (next_page_url && nextPage) {
            fullUrl = next_page_url;
        }
        fetch(fullUrl)
            .then((response) => {
                return response.json()
            }).then((data) => {
                buildTweets(data.statuses, nextPage);
                saveNextPage(data.search_metadata)
                nextPageButtonVisibility(data.search_metadata)
            })
    }
}

const getTrends = () => {
    console.log('GET TRENDS');
    let trendsUrl = `${URL_TREND}?id=${trend_id_los_angeles}`
    fetch(trendsUrl)
        .then((response) => {
            return response.json()
        }).then((data) => {
            console.log(data[0].trends);
            buildTrends(data[0].trends);
        })

}


const buildTrends = (trends) => {
    let trendsHtml = '';
    trends.map((trend) => {
        trendsHtml += `
        <div class="trends">
            <div class="header-trends gray small ">
                <span id="trend-info">Worldwide Trends</span>
            </div>
            <div class="hastag bold white mt5">
                <span id="trend-tag" onclick="selectTrend(this)">${trend.name}</span>
            </div>
            <div class="tweets-number small mt5 gray">
                <span id="number-tweets-trend">${trend.tweet_volume} Tweets</span>
            </div>
        </div>
        `
    })

    document.querySelector('.trends-location').innerHTML = trendsHtml;
}

/**
 * Save the next page data
 */
const saveNextPage = (metadata) => {
    if (metadata.next_results) {
        next_page_url = `${URL}${metadata.next_results}`;
    }
}

/**
 * Handle when a user clicks on a trend
 */
const selectTrend = (e) => {

    const text = e.innerText
    document.getElementById('user-search-input').value = text;
    getTwitterData();

}

/**
 * Set the visibility of next page based on if there is data on next page
 */
const nextPageButtonVisibility = (metadata) => {
    if (metadata.next_results) {
        document.getElementById('next-page-container').style.display = '';
    } else {
        document.getElementById('next-page-container').style.display = 'none';

    }
}

/**
 * Build Tweets HTML based on Data from API
 */
const buildTweets = (tweets, nextPage) => {
    let twitterContent = "";
    tweets.map((tweet) => {
        const createdDate = moment(tweet.created_at).fromNow();
        twitterContent += `
        <div class="tweet-container">
            <div class="tweet-profile-picture">
                <a style="background-image:url('${tweet.user.profile_image_url_https}')"></a>
            </div>

            <div class="tweet-data">
                <div class="tweet-user-info">
                    <div class="profile-name">${tweet.user.name}</div>
                    <div class="profile-tag">${tweet.user.screen_name}</div>
                    <div class="tweet-date-container">. ${createdDate}</div>
                </div>
                <div class="tweet-text-container">
                    ${tweet.full_text}
                </div> `

        if (tweet.extended_entities && tweet.extended_entities.media && tweet.extended_entities.media.length > 0) {
            twitterContent += buildImages(tweet.extended_entities.media);
            twitterContent += buildVideo(tweet.extended_entities.media);
        }


        twitterContent += `
                <div class="tweet-action">
                    <div class="hover comment">
                        <i class="far fa-comment"></i>
                    </div>
                    <div class="hover retweet">
                        <i class="fas fa-retweet"> ${tweet.retweet_count}</i>
                    </div>
                    <div class="hover like">
                        <i class="far fa-heart"> ${tweet.favorite_count}</i>
                    </div>
                    <div class="hover other-action">
                        <i class="fas fa-upload"></i>
                    </div>
                </div>
            </div>
        </div>
        `
    })
    if (nextPage) {
        document.getElementById('tweets-list').insertAdjacentHTML('beforeend', twitterContent);
    } else {
        document.getElementById('tweets-list').innerHTML = twitterContent;

    }
}

/**
 * Build HTML for Tweets Images
 */
const buildImages = (mediaList) => {
    let imageContent = `<div class="tweet-images-container">`;
    let imageExist = false
    mediaList.map((media) => {
        if (media.type == 'photo') {
            console.log('URL IMAGE: ', media.media_url_https)
            imageExist = true
            imageContent += `<div class="tweet-image" style="background-image: url('${media.media_url_https}')"></div>`
        }
        imageContent += '</div>'
    })
    return imageExist ? imageContent : '';
}

/**
 * Build HTML for Tweets Video
 */
const buildVideo = (mediaList) => {
    let videoContent = `<div class="tweet-video-container">`;
    let videoExist = false
    mediaList.map((media) => {
        if (media.type == 'video') {

            videoExist = true
            const videoVariant = media.video_info.variants.find((variant) => variant.content_type == 'video/mp4')
            videoContent += `
            <video controls>
            <source src="${videoVariant.url}" type="video/mp4">
            </video>
            `
        } else if (media.type == 'animated_gif') {
            videoExist = true
            const videoVariant = media.video_info.variants.find((variant) => variant.content_type == 'video/mp4')
            videoContent += `
                <video loop autoplay>
                    <source src="${videoVariant.url}" type="video/mp4">
                </video>
            `
        }
        videoContent += '</div>'
    })
    return videoExist ? videoContent : '';
}
