# Dekevlarize
A userscript and userstyle to make YouTube look how it did in 2016/2017

## Installation
1. Install Stylus ( [Chromium](https://chrome.google.com/webstore/detail/stylus/clngdbkpkpeebahjckkjfobafhncgmne) / [Firefox](https://addons.mozilla.org/en-US/firefox/addon/styl-us/) )
2. Install Tampermonkey ( [Chromium](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) / [Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/) )
3. Install the script and style with these links;

* Script: [Dekevlarize.user.js](Dekevlarize.user.js)
* Style: [Dekevlarize.user.css](Dekevlarize.user.css)

## For developers

### CSS
Dekevlarize's stylesheet is written in LESS, which is a superset of CSS that makes it easier to manage and generally results in cleaner source code. You can learn more about LESS at [lesscss.org](https://lesscss.org/).

### JavaScript
Dekevlarize takes advantage of the way elements are built in YouTube's version of Polymer to make for easy changing of text, icons, and the such. Basically, the `data` property of most elements with names starting in `ytd-` or `yt-` (i.e. `document.querySelector("ytd-watch-flexy").data`) contain the InnerTube data that was used to build it. We can modify this data, and then re-initialize the element to make it take effect, either by storing the data in a variable, setting the data to `{}` and changing it back, or creating a copy of the element in its place. This can actually reveal unused elements in the templates, such as the date text in `ytd-video-secondary-info-renderer`, and a count in `ytd-guide-entry-renderer`.

TLDR: Do not change `innerText` or otherwise modify HTML directly unless it is **absolutely necessary**. [Return YouTube Dislike's extension](https://returnyoutubedislike.com/) is a great example of this. It broke with YouTube's `segmentedLikeDislikeButtonRenderer` update, and has generally had issues in the past.


### Localization
Most, if not all regexes in the localization of the userscript are extraction tools for text that YouTube has. Do not attempt to translate these by hand, get the text from YouTube and put that there.