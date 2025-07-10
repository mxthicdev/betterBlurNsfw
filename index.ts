import definePlugin from "@utils/types";

let style: HTMLStyleElement;
let contentObserver: MutationObserver;

const blockedImage = "https://i.ibb.co/1NK0C3L/blocked.png";

function replaceMediaContent() {
    const observer = new MutationObserver(() => {
        document.querySelectorAll(".vc-nsfw-img").forEach(message => {
            message.querySelectorAll("img").forEach(img => {
                if (
                    img.closest(".embedImage-2Ynqkh") ||
                    img.closest("[class*=imageContainer]") ||
                    img.className.includes("image-") ||
                    img.className.includes("gif")
                ) {
                    img.src = blockedImage;
                    img.srcset = "";
                    img.removeAttribute("srcset");
                    img.style.objectFit = "contain";
                    img.style.maxHeight = "200px";
                    img.style.maxWidth = "300px";
                }
            });

            message.querySelectorAll("video").forEach(video => {
                const replacement = document.createElement("img");
                replacement.src = blockedImage;
                replacement.style.maxHeight = "200px";
                replacement.style.maxWidth = "300px";
                video.replaceWith(replacement);
            });

            message.querySelectorAll("img.emoji").forEach(img => {
                const src = img.src;
                if (!src.includes("twemoji")) {
                    const span = document.createElement("span");
                    span.textContent = " `[NSFW BLOCKED]` ";
                    img.replaceWith(span);
                }
            });

            message.querySelectorAll(".wrapper-2a6GCs img").forEach(sticker => {
                const replacement = document.createElement("img");
                replacement.src = blockedImage;
                replacement.style.maxHeight = "200px";
                replacement.style.maxWidth = "300px";
                sticker.replaceWith(replacement);
            });
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return observer;
}

export default definePlugin({
    name: "betterBlockNSFW",
    description: "Replaces media in NSFW channels with a blocked image or message.",
    authors: ["mxthicdev"],

    patches: [
        {
            find: "}renderEmbeds(",
            replacement: [{
                match: /\.container/,
                replace: "$&+(this.props.channel.nsfw ? ' vc-nsfw-img' : '')"
            }]
        }
    ],

    start() {
        style = document.createElement("style");
        style.id = "VcBlurNsfw";
        document.head.appendChild(style);

        contentObserver = replaceMediaContent();
    },

    stop() {
        style?.remove();
        contentObserver?.disconnect();
    }
});
