import definePlugin from "@utils/types";

let observer: MutationObserver;
const blockedImg = "https://i.ibb.co/1NK0C3L/blocked.png";
const blockedEmoji = "https://cdn.discordapp.com/emojis/1393014224942403725.webp?size=128";
const blockedSticker = "https://media.discordapp.net/stickers/1393014682507280504.webp?size=240&quality=lossless";

function applyReplacement(el: HTMLImageElement, src: string, size: number = 400) {
  el.src = src;
  el.srcset = "";
  // Use CSS for sizing to respect container constraints
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
  el.style.maxWidth = "100%"; // Prevent overflow
  el.style.maxHeight = "100%"; // Prevent overflow
  el.style.objectFit = "contain";
  el.style.display = "block"; // Ensure consistent rendering
  // Remove HTML attributes to avoid conflicts
  el.removeAttribute("width");
  el.removeAttribute("height");
}

function replaceContent() {
  observer = new MutationObserver((mutations) => {
    // Optimize by targeting specific containers
    const containers = document.querySelectorAll(".vc-nsfw-img, [class*=messageContent], [class*=embedWrapper]");
    containers.forEach((msg) => {
      // Replace images
      msg.querySelectorAll("img:not(.emoji):not([src*='/emojis/']):not([src*='/stickers/'])").forEach((img) => {
        const src = img.src;
        if (
          img.closest(".embedImage-2Ynqkh") ||
          img.closest("[class*=imageContainer]") ||
          img.className.includes("image-") ||
          img.className.includes("gif") ||
          (img.tagName === "IMG" && src.match(/\.(jpg|jpeg|png|webp|gif)(\?|$)/i))
        ) {
          applyReplacement(img, blockedImg);
        }
      });

      // Replace videos
      msg.querySelectorAll("video").forEach((video) => {
        const r = document.createElement("img");
        applyReplacement(r, blockedImg);
        video.replaceWith(r);
      });

      // Replace server emojis
      msg.querySelectorAll("img.emoji, img[src*='/emojis/'], img[class*='emoji'], img[src*='discordapp.com/emojis/'], img[src*='discord.com/emojis/']").forEach((emoji) => {
        applyReplacement(emoji, blockedEmoji, 64); // Smaller size for emojis
      });

      // Replace stickers
      msg.querySelectorAll(
        ".wrapper-2a6GCs img, .stickerPreview-1uGQgT img, img[src*='/stickers/'], img[class*='sticker']"
      ).forEach((sticker) => {
        const wrapper = document.createElement("div");
        wrapper.style.maxWidth = "400px"; // Cap size to prevent overflow
        wrapper.style.maxHeight = "400px";
        wrapper.style.display = "flex";
        wrapper.style.alignItems = "center";
        wrapper.style.justifyContent = "center";
        wrapper.style.overflow = "hidden";

        const replacement = document.createElement("img");
        applyReplacement(replacement, blockedSticker, 400);
        wrapper.appendChild(replacement);
        sticker.replaceWith(wrapper);
      });
    });
  });

  // Optimize observer to specific containers
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false, // Don't observe attribute changes
  });
}

export default definePlugin({
  name: "betterBlockNSFW",
  description: "Replace NSFW media, emojis, and stickers with custom blocked assets at a responsive size.",
  authors: ["mxthicdev"],
  patches: [
    {
      find: "}renderEmbeds(",
      replacement: [
        {
          match: /\.container/,
          replace: "$&+(this.props.channel.nsfw ? ' vc-nsfw-img' : '')",
        },
      ],
    },
    {
      // Add patch for message content to catch inline images
      find: "renderAttachments(",
      replacement: [
        {
          match: /\.messageContent/,
          replace: "$&+(this.props.channel.nsfw ? ' vc-nsfw-img' : '')",
        },
      ],
    },
  ],
  start() {
    replaceContent();
  },
  stop() {
    observer?.disconnect();
  },
});
