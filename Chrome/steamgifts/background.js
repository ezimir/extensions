
var SITE_URL = 'http://www.steamgifts.com',
    POINTS = 0;

if (typeof localStorage['missing_base_game'] === 'undefined' || !localStorage['missing_base_game']) {
    localStorage['missing_base_game'] = JSON.stringify([]);
}

function getHtml(html_string) {
    return $('<div>', {
        html: html_string.replace(/<img[^>]+>/g, '')
    });
}

function getGift(gift_url, points, page) {
    console.log('getting: ', gift_url);
    $.get(SITE_URL + gift_url, function (data) {
        var $result = getHtml(data);

        if ($result.find('#form_enter_giveaway a').text() === 'Missing Base Game') {
            console.log('missing base game');
            missing_base_game = JSON.parse(localStorage['missing_base_game']);
            missing_base_game.push(gift_url);
            localStorage['missing_base_game'] = JSON.stringify(missing_base_game);
            return getPage(page);
        }

        $.post(SITE_URL + gift_url, {
            form_key: $result.find('#form_enter_giveaway input').val(),
            enter_giveaway: 1
        }, function () {
            POINTS -= points;
            chrome.browserAction.setBadgeText({ text: POINTS.toString() });
            getPage(page);
        });
    });
}

function getPage(page) {
    var page_url = SITE_URL + '/open/page/' + page;
    console.log('getting: ', page_url);
    $.get(page_url, function (data) {
        var $result = getHtml(data),
            missing_base_game = JSON.parse(localStorage['missing_base_game']);

        var $posts = $result.find('.ajax_gifts .post:not(.fade)').filter(function () {
            var $contributor = $(this).find('.contributor_only');
            return $contributor.length === 0 || $contributor.hasClass('green');
        }).filter(function () {
            var gift_url = $(this).find('.title a').attr('href');
            return $.inArray(gift_url, missing_base_game) === -1;
        });

        console.log('posts: ', $posts.length);
        if ($posts.length) {
            for (var i = $posts.length - 1; i >= 0; i--) {
                var $post = $posts.eq(i),
                    points_needed = /\((\d+)P\)/.exec($post.find('.title span').text())[1];

                console.log('post: ', $post.find('.title a').text());
                console.log('points: ', points_needed, ' / ', POINTS);
                if (points_needed > POINTS) {
                    return;
                }

                return getGift($post.find('.title a').attr('href'), points_needed, page);
            };
        }

        page -= 1;
        if (page > 0) {
            getPage(page);
        }
    });
}

function start() {
    $.get(SITE_URL, function (data) {
        var $result = getHtml(data);

        var $count = $result.find('.pagination:first .results strong:last'),
            posts = ~~$count.text();
            pages = ~~(posts / 40) + 1;

        POINTS = ~~(/\d+/.exec($result.find('#navigation a.arrow').text())[0]);
        console.log('Points: ', POINTS);
        chrome.browserAction.setBadgeText({ text: POINTS.toString() });

        getPage(pages);
    });

    window.setTimeout(start, 15 * 60 * 1000); // check every 15 minutes
}


chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.tabs.create({ url: SITE_URL });
});


$(start);

