import definePlugin, { OptionType } from "@utils/types";
import { definePluginSettings } from "@api/Settings";
import { showToast, Toasts } from "@webpack/common";
import { showNotification } from "@api/Notifications";
import { sendMessage } from "@utils/discord";

const enum Mode {
    Everytime,
    Random,
    Never,
}

const settings = definePluginSettings({
    enablePlugin: {
        description: "Allow the plugin to run",
        type: OptionType.BOOLEAN,
        default: true,
    },
    mode: {
        description: "How plugin should disable spoiler reveal",
        type: OptionType.SELECT,
        options: [
            { label: "Everytime", value: Mode.Everytime, default: true },
            { label: "Randomly", value: Mode.Random },
            { label: "Never", value: Mode.Never },
        ],
    },
    enableTracking: {
        description: "Allow to send a message to a channel whenever you try to reveal a spoiler",
        type: OptionType.BOOLEAN,
        default: false,
    },
    trackerChannelId: {
        description: "Id of the Channel where you will notify that you tried to reveal a spoiler",
        type: OptionType.STRING,
        default: "",
    },
    trackerMessageToSend: {
        description: "Message to send whenever you try to reveal a spoiler",
        type: OptionType.STRING,
        default: "I've tried to unspoiler a message.",
    },
});

export default definePlugin({
    name: "PluneSpoiler",
    authors: [{ id: 1370136814085603388n, name: "httx.sereti" }],
    description: "Enhance your Spoilers experience using Spoiler Plugin by @PluneCorp",

    settings,

    patches: [
        {
            find: ".removeObscurity,",
            replacement: {
                match: /(?<="removeObscurity",(\i)=>{)/,
                replace: (_this, event) => `if (!$self.handleReveal(this, ${event})) return;`
            },
            predicate: () => settings.store.enablePlugin
        }
    ],

    /**
     * Return true if User can reveal a spoiler.
     * @param _this ReactElement
     * @param event MouseEvent
     * @returns boolean
     */
    handleReveal(_this: any, _event: MouseEvent): boolean {
        // Allow to reveal spoiler (mode is disabled)
        if (settings.store.mode == Mode.Never) {
            return true;
        }

        // 50/50 to be allowed
        if (settings.store.mode == Mode.Random) {
            const isLucky: boolean = Math.random() < 0.5;

            if (isLucky) {
                showToast("You're lucky, spoiler is reveal!", Toasts.Type.SUCCESS);
                return true;
            }
        }

        // Notify User can't reveal the spoiler
        try {
            showToast("You can't reveal spoilers!", Toasts.Type.FAILURE);
            showNotification({
                color: "#a537fd",
                title: "Nope.",
                body: "Awn :( Nah. You can't reveal that spoilered thing.",
                noPersist: true
            });
        } catch { }
        
        // Tracker configured and enabled?
        if (settings.store.enableTracking && settings.store.trackerChannelId !== "" && settings.store.trackerMessageToSend !== "") {
            try {
                sendMessage(
                    settings.store.trackerChannelId,
                    { content: settings.store.trackerMessageToSend },
                    false,
                )
                showToast("Successfully notified your action.", Toasts.Type.SUCCESS);
            } catch { }
        }

        return false;
    }
});
