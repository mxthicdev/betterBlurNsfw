import definePlugin from "@utils/types";

let observer: MutationObserver | null = null;
const blockedImg = "https://i.ibb.co/1NK0C3L/blocked.png";
const blockedEmoji = "https://cdn.discordapp.com/emojis/1393014224942403725.webp?size=128";
const blockedSticker = "https://media.discordapp.net/stickers/1393014682507280504.webp?size=240&quality=lossless";

function applyReplacement(el: HTMLImageElement, src: string, size: number = 320) {
  try {
    el.src = src;
    el.srcset = "";
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.maxWidth = "100%";
    el.style.maxHeight = "100%";
    el.style.objectFit = "contain";
    el.style.display = "block";
    el.removeAttribute("width");
    el.removeAttribute("height");
  } catch (e) {
    console.error("betterBlockNSFW: Error in applyReplacement:", e);
  }
}

function replaceContent() {
  observer?.disconnect();

  observer = new MutationObserver((mutations) => {
    try {
      mutations.forEach((mutation) => {
        if (!mutation.addedNodes.length) return;

        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;

          const containers = node.matches("[class*=message-], [class*=embedWrapper], .vc-nsfw-img")
            ? [node]
            : node.querySelectorAll("[class*=message-], [class*=embedWrapper], .vc-nsfw-img");

          containers.forEach((msg) => {
            msg.querySelectorAll(
              "img:not(.emoji):not([src*='/emojis/']):not([src*='/stickers/']):not([class*='sticker'])"
            ).forEach((img) => {
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

            msg.querySelectorAll("video").forEach((video) => {
              const r = document.createElement("img");
              applyReplacement(r, blockedImg);
              video.replaceWith(r);
            });

            msg.querySelectorAll(
              "img[class*='emoji'], img[src*='discordapp.com/emojis/'], img[src*='discord.com/emojis/']"
            ).forEach((emoji) => {
              applyReplacement(emoji, blockedEmoji, 48);
            });

            msg.querySelectorAll(
              "[class*='stickerAsset'] img, img[src*='/stickers/'], img[class*='sticker']"
            ).forEach((sticker) => {
              const wrapper = document.createElement("div");
              wrapper.style.maxWidth = "320px";
              wrapper.style.maxHeight = "320px";
              wrapper.style.display = "flex";
              wrapper.style.alignItems = "center";
              wrapper.style.justifyContent = "center";
              wrapper.style.overflow = "hidden";

              const replacement = document.createElement("img");
              applyReplacement(replacement, blockedSticker, 320);
              wrapper.appendChild(replacement);
              sticker.replaceWith(wrapper);
            });
          });
        });
      });
    } catch (e) {
      console.error("betterBlockNSFW: Error in MutationObserver:", e);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,
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
    observer = null;
  },
});
