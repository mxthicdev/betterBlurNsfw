import definePlugin from "@utils/types";

let style: HTMLStyleElement;
let emojiObserver: MutationObserver;

function setCss() {
    style.textContent = `
        .vc-nsfw-img [class^=imageContainer],
        .vc-nsfw-img [class^=wrapperPaused] {
            filter: blur(90071992547409920px);
            transition: filter 0.2s;
        }
    `;
}

function replaceEmojiAndStickers() {
    const observer = new MutationObserver(() => {
        document.querySelectorAll(".vc-nsfw-img").forEach(message => {
            message.querySelectorAll(".markup img.emoji, .messageContent img.emoji, .markup img[class*=emoji], .messageContent img[class*=emoji]").forEach(img => {
                const span = document.createElement("span");
                span.textContent = "[NSFW BLOCKER]";
                img.replaceWith(span);
            });

            message.querySelectorAll(".wrapper-2a6GCs img").forEach(sticker => {
                const span = document.createElement("span");
                span.textContent = "[NSFW BLOCKER]";
                sticker.replaceWith(span);
            });
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return observer;
}

export default definePlugin({
    name: "betterBlurNSFW",
    description: "Blurs all attachments in NSFW channels.",
    authors: ["mxthicdev"],

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
        emojiObserver = replaceEmojiAndStickers();
    },

    stop() {
        style?.remove();
        emojiObserver?.disconnect();
    }
});
