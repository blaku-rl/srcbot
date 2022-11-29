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
        embed.setURL(run.link)
            .setThumbnail(SRCTypes_1.default.allMaps[run.mapId].image)
            .setAuthor({ name: run.GetRunnersString(), iconURL: run.GetRunnerImage() })
            .setDescription(`${SRCTypes_1.default.allMaps[run.mapId].name}\n${run.GetAllCategoryInfo()}`)
            .addField('Time', run.GetTimeString(), true);
        return embed;
    }
    PostNewSubmittedRun(run) {
        console.log(run);
        console.log(run.mapId);
        if (process.env.SUBMITTEDCHANNEL === undefined)
            return;
        index_1.default.channels.fetch(process.env.SUBMITTEDCHANNEL)
            .then(channel => {
            if (channel === null || (channel === null || channel === void 0 ? void 0 : channel.type) !== 'GUILD_TEXT')
                return;
            try {
                const message = new discord_js_1.MessageEmbed()
                    .setTitle("NEW SUBMITTED RUN");
                this.SetRunInfoInEmbed(run, message);
                channel.send({ embeds: [message] })
                    .then((msg) => {
                    SRCTypes_1.default.allMaps[run.mapId].oldSubmittedRuns[run.id] = {
                        messageID: msg.id,
                        run: run
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
        if (process.env.SUBMITTEDCHANNEL === undefined)
            return;
        index_1.default.channels.fetch(process.env.SUBMITTEDCHANNEL)
            .then(channel => {
            if (channel === null || (channel === null || channel === void 0 ? void 0 : channel.type) !== 'GUILD_TEXT')
                return;
            try {
                channel.messages.fetch(oldSubmittedRun.messageID).then(msg => msg.delete());
            }
            catch (error) {
                console.error(error);
                this.PostError();
            }
        })
            .catch(console.error);
    }
    PostNewVerifiedRun(run, place, total) {
        if (process.env.VERIFIEDCHANNEL === undefined)
            return;
        index_1.default.channels.fetch(process.env.VERIFIEDCHANNEL)
            .then(channel => {
            if (channel === null || (channel === null || channel === void 0 ? void 0 : channel.type) !== 'GUILD_TEXT')
                return;
            try {
                const message = new discord_js_1.MessageEmbed()
                    .setTitle(place === 1 ? 'NEW WORLD RECORD' : 'NEW VERIFIED RUN');
                this.SetRunInfoInEmbed(run, message);
                message.addField('Place', `${place} / ${total}`, true);
                channel.send({ embeds: [message] });
            }
            catch (error) {
                console.error(error);
                this.PostError();
            }
        })
            .catch(console.error);
    }
    PostError(message = '') {
        if (message !== '') {
            console.log(message);
        }
        if (process.env.ERRORCHANNEL === undefined)
            return;
        index_1.default.channels.fetch(process.env.ERRORCHANNEL)
            .then(channel => {
            if (channel === null || (channel === null || channel === void 0 ? void 0 : channel.type) !== 'GUILD_TEXT')
                return;
            try {
                channel.send({ content: `An error has occured${message === '' ? '' : `: '${message}'`}, check the logs <@333083158616735745>` });
            }
            catch (error) {
                console.error(error);
            }
        })
            .catch(console.error);
    }
}
exports.RunPoster = RunPoster;
const runPoster = new RunPoster();
exports.default = runPoster;
