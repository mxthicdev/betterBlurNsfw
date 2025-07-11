// Credits to Vencord and the original plugin developer: https://github.com/Vendicated/Vencord/blob/main/src/plugins/blurNsfw/index.ts
// https://github.com/sadan4

import { Settings } from "@api/Settings";
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";
import { findStore } from "@api/stores";
import { ChannelStore } from "discord-types/general";

let style: HTMLStyleElement;
let observer: MutationObserver;

function setCss() {
    style.textContent = `
        .vc-nsfw-blur {
            filter: blur(${9007199254740991}px) !important;
            transition: filter 0.2s;
        }
        `;
}

function isNsfwChannel(channelId: string): boolean {
    const channel = findStore("ChannelStore").getChannel(channelId);
    return channel?.nsfw ?? false;
}

function applyBlur() {
    const channelId = document.querySelector("[class*=guildChannel]")?.getAttribute("data-channel-id");
    if (!channelId || !isNsfwChannel(channelId)) return;

    const emojis = document.querySelectorAll("img[src*='cdn.discordapp.com/emojis']");
    emojis.forEach((emoji) => {
        if (!emoji.classList.contains("vc-nsfw-blur")) {
            emoji.classList.add("vc-nsfw-blur");
        }
    });

    const images = document.querySelectorAll("img:not([class*=spoiler])");
    images.forEach((img) => {
        if (img.src.includes("cdn.discordapp.com/attachments") && !img.classList.contains("vc-nsfw-blur")) {
            img.classList.add("vc-nsfw-blur");
        }
    });

    const stickers = document.querySelectorAll("[class*=sticker]");
    stickers.forEach((sticker) => {
        if (!sticker.classList.contains("vc-nsfw-blur")) {
            sticker.classList.add("vc-nsfw-blur");
        }
    });
}

export default definePlugin({
    name: "betterBlurNSFW",
    description: "Blur attachments, stickers, and emojis in NSFW channels permanently.",
    authors: [{ name: "m.xthic", id: 1294029340543156245 }],

    patches: [],

    start() {
        style = document.createElement("style");
        style.id = "VcBlurNsfw";
        document.head.appendChild(style);

        setCss();

        observer = new MutationObserver((mutations) => {
            mutations.forEach(() => applyBlur());
        });

        observer.observe(document.body, { childList: true, subtree: true });
        applyBlur();
    },

    stop() {
        style?.remove();
        observer?.disconnect();
    }
});
