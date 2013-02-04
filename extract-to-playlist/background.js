
window.addEventListener('load', function() {
    var button = opera.contexts.toolbar.createItem({
        disabled: false, // The button is enabled.
        title: 'Extract to Playlist',
        icon: 'yt.png',
        onclick: function () {
            var tab = opera.extension.tabs.getFocused();
            if (tab) {
                tab.postMessage('enable');
            }
        }
    });
    opera.contexts.toolbar.addItem(button);
}, false);

