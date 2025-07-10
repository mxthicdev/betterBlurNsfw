// CREDITS TO ORIGINAL OWNER: https://github.com/Vendicated/Vencord/tree/main/src/plugins/blurNsfw

import { Settings } from "@api/Settings";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";

let style: HTMLStyleElement;

function setCss() {
    style.textContent = `
        .vc-nsfw-img [class^=imageContainer],
        .vc-nsfw-img [class^=wrapperPaused],
        .vc-nsfw-img img.emoji,
        .vc-nsfw-img img[class*=emoji] {
            filter: blur(${Settings.plugins.betterBlurNSFW.blurAmount}px);
            transition: filter 0.2s;
        }
        `;
}

export default definePlugin({
    name: "betterBlurNSFW",
    description: "Blur all attachments in NSFW channels.",
    authors: [Devs.Ven],

    patches: [
        {
            find: "}renderEmbeds(",
            replacement: [{
                match: /\.container/,
                replace: "$&+(this.props.channel.nsfw? ' vc-nsfw-img': '')"
            }]
        }
    ],

    options: {
        blurAmount: {
            type: OptionType.NUMBER,
            description: "Blur Amount",
            default: 90071992547409920,
            onChange: setCss
        }
    },

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
