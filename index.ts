// CREDITS TO ORIGINAL OWNER: https://github.com/Vendicated/Vencord/tree/main/src/plugins/blurNsfw

import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";

let style: HTMLStyleElement;

function setCss() {
    style.textContent = `
        .vc-nsfw-img [class^=imageContainer],
        .vc-nsfw-img [class^=wrapperPaused] {
            filter: blur(90071992547409920px);
            transition: filter 0.2s;
        }
    `;
}

function replaceEmojis() {
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (!(mutation.target instanceof HTMLElement)) continue;
            if (!mutation.target.closest(".vc-nsfw-img")) continue;

            const emojis = mutation.target.querySelectorAll("img.emoji, img[class*=emoji]");
            emojis.forEach(img => {
                const span = document.createElement("span");
                span.textContent = "[NSFW BLOCKER]";
                img.replaceWith(span);
            });
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return observer;
}

let emojiObserver: MutationObserver;

export default definePlugin({
    name: "betterBlurNSFW",
    description: "Blur all attachments in NSFW channels and block NSFW emojis.",
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

    start() {
        style = document.createElement("style");
        style.id = "VcBlurNsfw";
        document.head.appendChild(style);

        setCss();
        emojiObserver = replaceEmojis();
    },

    stop() {
        style?.remove();
        emojiObserver?.disconnect();
    }
});
