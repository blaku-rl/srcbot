"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunPoster = void 0;
const discord_js_1 = require("discord.js");
const SRCTypes_1 = __importDefault(require("./SRCTypes"));
const index_1 = __importDefault(require("../index"));
class RunPoster {
    SetRunInfoInEmbed(run, embed) {
        embed
            .setURL(run.link)
            .setThumbnail(SRCTypes_1.default.allMaps[run.mapId].image)
            .setAuthor({
            name: run.GetRunnersString(),
            iconURL: run.GetRunnerImage(),
        })
            .setDescription(`${SRCTypes_1.default.allMaps[run.mapId].name}\n${run.GetAllCategoryInfo()}`)
            .addFields({ name: "Time", value: run.GetTimeString(), inline: true });
        return embed;
    }
    PostNewSubmittedRun(run) {
        console.log(`New submitted run ${run.link}`);
        this.DevLog(run);
        if (process.env.SUBMITTEDCHANNEL === undefined) {
            console.error("Submitted Channel is not defined");
            return;
        }
        index_1.default.channels
            .fetch(process.env.SUBMITTEDCHANNEL)
            .then((channel) => {
            if (channel === null || channel?.type !== discord_js_1.ChannelType.GuildText)
                return;
            try {
                const message = new discord_js_1.EmbedBuilder().setTitle("NEW SUBMITTED RUN");
                this.SetRunInfoInEmbed(run, message);
                channel.send({ embeds: [message] }).then((msg) => {
                    SRCTypes_1.default.allMaps[run.mapId].oldSubmittedRuns[run.id] = {
                        messageID: msg.id,
                        run: run,
                    };
                });
            }
            catch (error) {
                console.error(error);
                this.PostError();
            }
        })
            .catch(console.error);
    }
    DeleteOldSubmittedRun(oldSubmittedRun) {
        console.log("Deleting old submitted run");
        if (process.env.SUBMITTEDCHANNEL === undefined) {
            console.error("Submitted Channel is not defined");
            return;
        }
        index_1.default.channels
            .fetch(process.env.SUBMITTEDCHANNEL)
            .then((channel) => {
            if (channel === null || channel?.type !== discord_js_1.ChannelType.GuildText)
                return;
            try {
                channel.messages
                    .fetch(oldSubmittedRun.messageID)
                    .then((msg) => msg.delete());
            }
            catch (error) {
                console.error(error);
                this.PostError();
            }
        })
            .catch(console.error);
    }
    PostNewVerifiedRun(run, place, total) {
        console.log(`New verified run posted ${run.link}`);
        if (process.env.VERIFIEDCHANNEL === undefined) {
            console.error("Verified Channel is not defined");
            return;
        }
        index_1.default.channels
            .fetch(process.env.VERIFIEDCHANNEL)
            .then((channel) => {
            if (channel === null || channel?.type !== discord_js_1.ChannelType.GuildText)
                return;
            try {
                const message = new discord_js_1.EmbedBuilder().setTitle(place === 1 ? "NEW WORLD RECORD" : "NEW VERIFIED RUN");
                this.SetRunInfoInEmbed(run, message);
                message.addFields({
                    name: "Place",
                    value: `${place} / ${total}`,
                    inline: true,
                });
                channel.send({ embeds: [message] });
            }
            catch (error) {
                console.error(error);
                this.PostError();
            }
        })
            .catch(console.error);
    }
    PostError(message = "") {
        if (message !== "") {
            console.error(message);
        }
        if (process.env.ERRORCHANNEL === undefined) {
            console.error("Error Channel is not defined");
            return;
        }
        index_1.default.channels
            .fetch(process.env.ERRORCHANNEL)
            .then((channel) => {
            if (channel === null || channel?.type !== discord_js_1.ChannelType.GuildText)
                return;
            try {
                channel.send({
                    content: `An error has occured${message === "" ? "" : `: '${message}'`}, check the logs <@333083158616735745>`,
                });
            }
            catch (error) {
                console.error(error);
            }
        })
            .catch(console.error);
    }
    DevLog(message) {
        if (process.env.ENVIRONMENT === "Dev") {
            console.log(message);
        }
    }
}
exports.RunPoster = RunPoster;
const runPoster = new RunPoster();
exports.default = runPoster;
