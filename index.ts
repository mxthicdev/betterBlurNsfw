// Credits to Vencord and the original plugin developer: https://github.com/Vendicated/Vencord/blob/main/src/plugins/blurNsfw/index.ts
// https://github.com/sadan4

import { Settings } from "@api/Settings";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";

let style: HTMLStyleElement;

function setCss() {
    style.textContent = `
        .vc-nsfw-img [class^=imageContainer],
        .vc-nsfw-img [class^=wrapperPaused],
        .vc-nsfw-img [class^=stickerAsset],
        .vc-nsfw-img [class^=sticker],
        .vc-nsfw-img [class*=sticker],
        .vc-nsfw-img [class^=emoji],
        .vc-nsfw-img [class*=emoji],
        .vc-nsfw-img [class^=jumboEmoji],
        .vc-nsfw-img [class*=emojiContainer],
        .vc-nsfw-img [class*=emojiCustom],
        .vc-nsfw-img img:not([class*="spoiler"]) {
            filter: blur(${9007199254740991}px) !important;
            transition: filter 0.2s;
        }
        `;
}

export default definePlugin({
    name: "betterBlurNSFW",
    description: "Blur attachments, stickers, and emojis in NSFW channels permanently.",
    authors: [{ name: "m.xthic", id: 1294029340543156245 }],

    patches: [
        {
            find: "}renderEmbeds(",
            replacement: [{
                match: /\.container/,
                replace: "$&+(this.props.channel.nsfw? ' vc-nsfw-img': '')"
            }]
        },
        {
            find: "renderMessageContent(",
            replacement: [{
                match: /\.messageContent/,
                replace: "$&+(this.props.channel.nsfw? ' vc-nsfw-img': '')"
            }]
        }
    ],

    start() {
        style = document.createElement("style");
        style.id = "VcBlurNsfw";
        document.head.appendChild(style);

        setCss();
    },

    stop() {
        style?.remove();
    }
});
