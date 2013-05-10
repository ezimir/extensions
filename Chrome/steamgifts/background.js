
var SITE_URL = 'http://www.steamgifts.com',
    POINTS = 0;

function getHtml(html_string) {
    return $('<div>', {
        html: html_string.replace(/<img[^>]+>/g, '')
    });
}

function getGift(gift_url) {
    $.get(SITE_URL + gift_url, function (data) {
        var $result = getHtml(data);

        $.post(SITE_URL + gift_url, {
            form_key: $result.find('#form_enter_giveaway input').val(),
            enter_giveaway: 1
        });
    });
}

function getPage(page) {
    var page_url = SITE_URL + '/open/page/' + page;
    $.get(page_url, function (data) {
        var $result = getHtml(data);

        var $posts = $result.find('.ajax_gifts .post:not(.fade)').filter(function () {
            var $contributor = $(this).find('.contributor_only');
            return $contributor.length === 0 || $contributor.hasClass('green');
        });

        if ($posts.length) {
            for (var i = $posts.length - 1; i >= 0; i--) {
                var $post = $posts.eq(i),
                    points_needed = /\((\d+)P\)/.exec($post.find('.title span').text())[1];

                if (points_needed > POINTS) {
                    return;
                }

                return getGift($post.find('.title a').attr('href'));
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
        chrome.browserAction.setBadgeText({ text: POINTS.toString() });

        getPage(pages);
    });

    window.setTimeout(start, 10 * 60 * 1000); // check every 10 minutes
}


chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.tabs.create({ url: SITE_URL });
});


$(start);

