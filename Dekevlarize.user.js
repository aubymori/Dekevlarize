// ==UserScript==
// @name         Dekevlarize Script
// @version      0.1.0
// @description  Dekevlarize's helper script
// @author       Aubrey P.  <aubyomori@gmail.com>
// @author       Taniko Y.  <kirasicecreamm@gmail.com>
// @icon         https://www.youtube.com/favicon.ico
// @updateURL    https://github.com/aubymori/Dekevlarize/raw/main/Dekevlarize.user.js
// @namespace    aubymori
// @license      Unlicense
// @match        www.youtube.com/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

// Localization
const I18N = {
    en: {
        subCountIsolator: /( subscribers)|( subscriber)/,
        guideMyChannel: "My channel",
        dateTextPublic: "Published on %s",
        dateTextPrivate: "Uploaded on %s",
        dateTextCheck: /(Premier)|(Stream)|(Start)/,
        actionAddTo: "Add to",
        actionMore: "More",
        showMore: "Show more"
    }
};

// Attributes to remove from <html>
const ATTRS = [
    "system-icons",
    "typography",
    "typography-spacing"
];

// Regular config keys.
const CONFIGS = {
    BUTTON_REWORK: false
};

// Experiment flags.
const EXPFLAGS = {
    desktop_add_to_playlist_renderer_dialog_popup: false,
    kevlar_system_icons: false,
    render_unicode_emojis_as_small_images: true,
    kevlar_unavailable_video_error_ui_client: false,
    kevlar_refresh_on_theme_change: false,
    kevlar_watch_metadata_refresh: true,
    kevlar_watch_metadata_refresh_description_inline_expander: false,
    kevlar_watch_metadata_refresh_clickable_description: false,
    kevlar_watch_metadata_refresh_top_aligned_actions: false,
    kevlar_watch_modern_metapanel: false,
    kevlar_watch_snap_sizing: true,
    web_amsterdam_playlists: false,
    web_animated_like: false,
    web_button_rework: false,
    web_button_rework_with_live: false,
    web_darker_dark_theme: false,
    web_guide_ui_refresh: false,
    web_modern_ads: false,
    web_modern_buttons: false,
    web_modern_chips: false,
    web_modern_dialogs: false,
    web_modern_playlists: false,
    web_modern_subscribe: false,
    web_rounded_containers: false,
    web_rounded_thumbnails: false,
    web_searchbar_style: "default",
    web_sheets_ui_refresh: false
};

// Player flags
// !!! USE STRINGS FOR VALUES !!!
// For example: "true" instead of true
const PLYRFLAGS = {
    web_player_move_autonav_toggle: "false",
    web_settings_menu_icons: "false",
    web_rounded_containers: "false",
    web_rounded_thumbnails: "false"
};

class Localization {
    defaultLanguage = "en";
    activeLanguage = this.defaultLanguage;
    static strings = {};

    constructor(strings) {
        this.strings = strings;
    }

    getString(name, ...args) {
        var strings = this.strings;

        var str;
        if (strings[this.activeLanguage]) {
            if (strings[this.activeLanguage][name]) {
                str = strings[this.activeLanguage][name];
            } else if (strings[this.defaultLanguage][name]) {
                str = strings[this.defaultLanguage][name];
            }
        } else {
            if (strings[this.defaultLanguage][name]) {
                str = strings[this.defaultLanguage][name];
            }
        }

        if (str == null) return;

        if (args.length > 0) {
            args.forEach(arg => {
                str = str.replace(/%s/, arg);
            });
        }

        return str;
    }
}

var i18n = new Localization(I18N);

class YTP {
    static observer = new MutationObserver(this.onNewScript);

    static _config = {};

    static isObject(item) {
        return (item && typeof item === "object" && !Array.isArray(item));
    }
    
    static mergeDeep(target, ...sources) {
        if (!sources.length) return target;
        const source = sources.shift();
    
        if (this.isObject(target) && this.isObject(source)) {
            for (const key in source) {
                if (this.isObject(source[key])) {
                    if (!target[key]) Object.assign(target, { [key]: {} });
                    this.mergeDeep(target[key], source[key]);
                } else {
                    Object.assign(target, { [key]: source[key] });
                }
            }
        }
    
        return this.mergeDeep(target, ...sources);
    }
    

    static onNewScript(mutations) {
        for (var mut of mutations) {
            for (var node of mut.addedNodes) {
                YTP.bruteforce();
            }
        }
    }

    static start() {
        this.observer.observe(document, {childList: true, subtree: true});
    }
    
    static stop() {
        this.observer.disconnect();
    }

    static bruteforce() {
        if (!window.yt) return;
        if (!window.yt.config_) return;

        this.mergeDeep(window.yt.config_, this._config);
    }

    static setCfg(name, value) {
        this._config[name] = value;
    }

    static setCfgMulti(configs) {
        this.mergeDeep(this._config, configs);
    }

    static setExp(name, value) {
        if (!("EXPERIMENT_FLAGS" in this._config)) this._config.EXPERIMENT_FLAGS = {};

        this._config.EXPERIMENT_FLAGS[name] = value;
    }

    static setExpMulti(exps) {
        if (!("EXPERIMENT_FLAGS" in this._config)) this._config.EXPERIMENT_FLAGS = {};

        this.mergeDeep(this._config.EXPERIMENT_FLAGS, exps);
    }

    static decodePlyrFlags(flags) {
        var obj = {},
            dflags = flags.split("&");

        for (var i = 0; i < dflags.length; i++) {
            var dflag = dflags[i].split("=");
            obj[dflag[0]] = dflag[1];
        }
        
        return obj;
    }

    static encodePlyrFlags(flags) {
        var keys = Object.keys(flags),
            response = "";

        for (var i = 0; i < keys.length; i++) {
            if (i > 0) {
                response += "&";
            }
            response += keys[i] + "=" + flags[keys[i]];
        }

        return response;
    }

    static setPlyrFlags(flags) {
        if (!window.yt) return;
        if (!window.yt.config_) return;
        if (!window.yt.config_.WEB_PLAYER_CONTEXT_CONFIGS) return;
        var conCfgs = window.yt.config_.WEB_PLAYER_CONTEXT_CONFIGS;
        if (!("WEB_PLAYER_CONTEXT_CONFIGS" in this._config)) this._config.WEB_PLAYER_CONTEXT_CONFIGS = {};

        for (var cfg in conCfgs) {
            var dflags = this.decodePlyrFlags(conCfgs[cfg].serializedExperimentFlags);
            this.mergeDeep(dflags, flags);
            this._config.WEB_PLAYER_CONTEXT_CONFIGS[cfg] = {
                serializedExperimentFlags: this.encodePlyrFlags(dflags)
            }
        }
    }
}

window.addEventListener("yt-page-data-updated", function tmp() {
    YTP.stop();
    for (i = 0; i < ATTRS.length; i++) {
        document.getElementsByTagName("html")[0].removeAttribute(ATTRS[i]);
    }
    window.removeEventListener("yt-page-date-updated", tmp);  
});

YTP.start();

YTP.setCfgMulti(CONFIGS);
YTP.setExpMulti(EXPFLAGS);
YTP.setPlyrFlags(PLYRFLAGS);

/**
 * @param {*}     needle    What to search for in array
 * @param {array} haystack  Array to search
 */
 function inArray(needle, haystack) {
    haystack.forEach((item) => {
        if (needle === item) {
            return true;
        }
    });
    return false;
}

async function rydCounts(id) {
    var rydData = fetch(`https://returnyoutubedislikeapi.com/votes?videoId=${id}`);
    var data = await (await rydData).json();

    return {
        likes: data.likes,
        dislikes: data.dislikes
    };
}

function calculateSentiment(likes, dislikes) {
    if (likes == 0 && dislikes == 0) {
        return "50";
    } else if (dislikes == 0) {
        return "100";
    } else {
        return ""+(likes / (likes + dislikes)) * 100;
    }
}

async function updateWatch() {
    var watchFlexy = document.querySelector("ytd-watch-flexy");

    for (const result of watchFlexy.data.contents.twoColumnWatchNextResults.results.results.contents) {
        if (result.videoPrimaryInfoRenderer) {
            var primaryInfo = result.videoPrimaryInfoRenderer;
            var menu = primaryInfo.videoActions.menuRenderer;
        
            for (const item of menu.flexibleItems) {
                var tlb = item.menuFlexibleItemRenderer.topLevelButton;
                if (tlb.buttonRenderer) {
                    if (tlb.buttonRenderer.icon.iconType == "PLAYLIST_ADD") {
                        tlb.buttonRenderer.text = {
                            simpleText: i18n.getString("actionAddTo")
                        };
                        tlb.buttonRenderer.tooltip = i18n.getString("actionAddTo");
                        menu.topLevelButtons.splice(1, 0, tlb);
                    }
                }
            }

            delete menu.flexibleItems;

            var tooltip = menu.accessibility.accessibilityData.label;

            if (menu.topLevelButtons[0].segmentedLikeDislikeButtonRenderer) {
                var likeButton = menu.topLevelButtons[0].segmentedLikeDislikeButtonRenderer;
                menu.topLevelButtons.splice(0, 1);

                menu.topLevelButtons.unshift(likeButton.dislikeButton);
                menu.topLevelButtons.unshift(likeButton.likeButton);
            }

            var likeButton = menu.topLevelButtons[0].toggleButtonRenderer;
            var dislikeButton = menu.topLevelButtons[1].toggleButtonRenderer;
            var videoId = watchFlexy.data.currentVideoEndpoint.watchEndpoint.videoId;
            var status = (() => {
                if (likeButton.isToggled) {
                    return "LIKE";
                } else if (dislikeButton.isToggled) {
                    return "DISLIKE";
                } else {
                    return "INDIFFERENT";
                }
            })(); 

            var counts = await rydCounts(videoId);

            var likeCount;
            var likeCountToggled;
            var dislikeCount;
            var dislikeCountToggled;

            if (likeButton.isToggled) {
                likeCount = counts.likes - 1;
                likeCountToggled = counts.likes;
            } else {
                likeCount = counts.likes;
                likeCountToggled = counts.likes + 1;
            }

            if (dislikeButton.isToggled) {
                dislikeCount = counts.dislikes - 1;
                dislikeCountToggled = counts.dislikes;
            } else {
                dislikeCount = counts.dislikes;
                dislikeCountToggled = counts.dislikes + 1;
            }

            likeButton.defaultText = {
                simpleText: likeCount.toLocaleString()
            };

            likeButton.toggledText = {
                simpleText: likeCountToggled.toLocaleString()
            };

            dislikeButton.defaultText = {
                simpleText: dislikeCount.toLocaleString()
            };

            dislikeButton.toggledText = {
                simpleText: dislikeCountToggled.toLocaleString()
            };

            primaryInfo.sentimentBar = {
                sentimentBarRenderer: {
                    percentIfIndifferent: calculateSentiment(likeCount, dislikeCount),
                    percentIfLiked: calculateSentiment(likeCountToggled, dislikeCount),
                    percentIfDisliked: calculateSentiment(likeCount, dislikeCountToggled),
                    likeStatus: status
                }
            };

            menu.topLevelButtons.push({
                buttonRenderer: {
                    accessibility: {
                        label: tooltip
                    },
                    accessibilityData: {
                        accessibilityData: {
                            label: tooltip
                        }
                    },
                    tooltip: tooltip,
                    command: {
                        commandExecutorCommand: {
                            commands: [
                                {
                                    openPopupAction: {
                                        popup: {
                                            menuPopupRenderer: {
                                                items: menu.items
                                            }
                                        },
                                        popupType: "DROPDOWN"
                                    }
                                }
                            ]
                        }
                    },
                    icon: {
                        iconType: "MORE"
                    },
                    isDisabled: false,
                    size: "SIZE_DEFAULT",
                    style: "STYLE_DEFAULT",
                    text: {
                        simpleText: i18n.getString("actionMore")
                    }
                }
            });

            delete menu.items;

            var viewCount = primaryInfo.viewCount.videoViewCountRenderer;
            viewCount.shortViewCount = viewCount.viewCount;

            if (!(i18n.getString("dateTextCheck").test(primaryInfo.dateText.simpleText))) {
                var isPublic = true;
                if (primaryInfo.badges) {
                    for (const badge of primaryInfo.badges) {
                        var icon = badge.metadataBadgeRenderer.icon.iconType ?? null;
                        if (inArray(icon, ["PRIVACY_UNLISTED", "PRIVACY_PRIVATE"])) {
                            isPublic = false;
                        }
                    }
                }

                var str = isPublic ? "dateTextPublic" : "dateTextPrivate";

                primaryInfo.dateText = {
                    simpleText: i18n.getString(str, primaryInfo.dateText.simpleText)
                };
            }

            primaryInfo.relativeDateText = primaryInfo.dateText;

            
        } else if (result.videoSecondaryInfoRenderer) {
            var secondaryInfo = result.videoSecondaryInfoRenderer;

            secondaryInfo.showMoreText = {
                simpleText: i18n.getString("showMore")
            };

            var owner = secondaryInfo.owner.videoOwnerRenderer;
            owner.subscriberCountText.simpleText = owner.subscriberCountText.simpleText.replace(i18n.getString("subCountIsolator"), "");
        }
    }

    var tmp = watchFlexy.data;
    watchFlexy.data = {};
    watchFlexy.data = tmp;


}

document.addEventListener("yt-page-data-updated", (e) => {
    i18n.activeLanguage = yt.config_.HL.split("-")[0];

    switch (e.detail.pageType) {
        case "watch":
            updateWatch();
            break;
    }
});