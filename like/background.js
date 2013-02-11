
window.addEventListener('load', function() {
    var button = opera.contexts.toolbar.createItem({
        disabled: false, // The button is enabled.
        title: 'Facebook',
        icon: 'facebook.png',
        popup: {
            href: 'https://www.facebook.com/plugins/like.php',
            width: 150,
            height: 50
        },
        onclick: function () {
            var tab = opera.extension.tabs.getFocused();
            button.popup.href = 'https://www.facebook.com/plugins/like.php?href=' + encodeURIComponent(tab.url) + '&send=false&layout=button_count&width=150&show_faces=true&font=trebuchet+ms&colorscheme=light&action=like&height=21&appId=114370451982089';
        }
    });
    opera.contexts.toolbar.addItem(button);
});

