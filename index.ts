import definePlugin from "@utils/types";

let contentObserver: MutationObserver;
const blockedImage = "https://i.ibb.co/1NK0C3L/blocked.png";

function replaceMediaContent() {
  const observer = new MutationObserver(() => {
    document.querySelectorAll(".vc-nsfw-img").forEach(msg => {
      msg.querySelectorAll("img, video").forEach(el => {
        const isImg = el.tagName === "IMG";
        const isVid = el.tagName === "VIDEO";

        if (isImg && (
          el.closest(".embedImage-2Ynqkh") ||
          el.closest("[class*=imageContainer]") ||
          el.className.includes("image-") ||
          el.className.includes("gif")
        )) {
          Object.assign(el, { src: blockedImage, srcset: "" });
          Object.assign(el.style, { width: "800px", height: "800px", objectFit: "contain" });
        }
        else if (isVid) {
          const r = document.createElement("img");
          r.src = blockedImage;
          Object.assign(r.style, { width: "800px", height: "800px", objectFit: "contain" });
          video.replaceWith(r);
        }
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
  return observer;
}

export default definePlugin({
  name: "betterBlockNSFW",
  description: "Replaces all media to 800x800 blocked image or text tag.",
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
    contentObserver = replaceMediaContent();
  },
  stop() {
    contentObserver?.disconnect();
  }
});
