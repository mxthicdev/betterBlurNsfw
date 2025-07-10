import definePlugin from "@utils/types";

let observer: MutationObserver;
const BLOCKED = "https://i.ibb.co/1NK0C3L/blocked.png";

function startBlocking() {
  observer = new MutationObserver(() => {
    document.querySelectorAll(".vc-nsfw-img").forEach(msg => {
      msg.querySelectorAll("img").forEach(img => {
        if (img.closest(".embedImage-2Ynqkh") ||
            img.closest("[class*=imageContainer]") ||
            img.className.includes("image-") ||
            img.className.includes("gif")) {
          img.src = BLOCKED;
          img.srcset = "";
          img.removeAttribute("srcset");
          img.style.objectFit = "contain";
          img.style.maxWidth = "";
          img.style.maxHeight = "";
          img.width = 800;
          img.height = 800;
        }
      });

      msg.querySelectorAll("video").forEach(video => {
        const replacement = document.createElement("img");
        replacement.src = BLOCKED;
        replacement.width = 800;
        replacement.height = 800;
        replacement.style.objectFit = "contain";
        video.replaceWith(replacement);
      });

      msg.querySelectorAll("img.emoji").forEach(img => {
        if (!img.src.includes("twemoji")) {
          const span = document.createElement("span");
          span.textContent = "`[NSFW BLOCKED]`";
          img.replaceWith(span);
        }
      });

      msg.querySelectorAll(".stickerPreview-1uGQgT img, .wrapper-2a6GCs img").forEach(sticker => {
        const span = document.createElement("span");
        span.textContent = "`[NSFW BLOCKED]`";
        sticker.replaceWith(span);
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

export default definePlugin({
  name: "betterBlockNSFW",
  description: "Replace GIFs/images/videos with blocked image at 800×800, and block emojis/stickers",
  authors: ["mxthicdev"],
  patches: [{
    find: "}renderEmbeds(",
    replacement: [{
      match: /\.container/,
      replace: "$&+(this.props.channel.nsfw ? ' vc-nsfw-img' : '')"
    }]
  }],
  start() {
    startBlocking();
  },
  stop() {
    observer.disconnect();
  }
});
