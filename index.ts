import definePlugin from "@utils/types";

let observer: MutationObserver;
const blockedImg = "https://i.ibb.co/1NK0C3L/blocked.png";
const blockedEmoji = "https://cdn.discordapp.com/emojis/1393014224942403725.webp?size=128";
const blockedSticker = "https://media.discordapp.net/stickers/1393014682507280504.webp?size=240&quality=lossless";

function applyReplacement(el: HTMLImageElement, src: string) {
  el.src = src;
  el.srcset = "";
  el.width = 800;
  el.height = 800;
  el.style.width = "800px";
  el.style.height = "800px";
  el.style.objectFit = "contain";
}

function replaceContent() {
  observer = new MutationObserver(() => {
    document.querySelectorAll(".vc-nsfw-img").forEach(msg => {
      msg.querySelectorAll("img").forEach(img => {
        const src = img.src;

        if (
          img.closest(".embedImage-2Ynqkh") ||
          img.closest("[class*=imageContainer]") ||
          img.className.includes("image-") ||
          img.className.includes("gif") ||
          img.tagName === "IMG" && src.match(/\.(jpg|jpeg|png|webp|gif)(\?|$)/i)
        ) {
          applyReplacement(img, blockedImg);
        }
      });

      msg.querySelectorAll("video").forEach(video => {
        const r = document.createElement("img");
        applyReplacement(r, blockedImg);
        video.replaceWith(r);
      });

      // Inline emojis & server emojis
      msg.querySelectorAll("img.emoji, img[src*='/emojis/']").forEach(img => {
        applyReplacement(img, blockedEmoji);
      });

      // Stickers
      msg.querySelectorAll(
        ".wrapper-2a6GCs img, .stickerPreview-1uGQgT img, img[src*='/stickers/'], img.lazyStickers-"
      ).forEach(img => {
        applyReplacement(img, blockedSticker);
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

export default definePlugin({
  name: "betterBlockNSFW",
  description: "Blocks all NSFW media content.",
  authors: ["mxthicdev"],
  patches: [{
    find: "}renderEmbeds(",
    replacement: [{
      match: /\.container/,
      replace: "$&+(this.props.channel.nsfw ? ' vc-nsfw-img' : '')"
    }]
  }],
  start() {
    replaceContent();
  },
  stop() {
    observer.disconnect();
  }
});
