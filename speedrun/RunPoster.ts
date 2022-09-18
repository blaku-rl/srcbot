import { MessageEmbed } from "discord.js";
import srcData, { RunInfo, SittingSubmittedRun } from './SRCTypes';
import client from '../index';

let idStr: string = '';

export class RunPoster {
    private SetRunInfoInEmbed(run: RunInfo, embed: MessageEmbed): MessageEmbed {
        embed.setURL(run.link)
            .setThumbnail(srcData.allMaps[run.mapId].image)
            .setAuthor({name: run.GetRunnersString(), iconURL: run.GetRunnerImage()})
            .setDescription(`${srcData.allMaps[run.mapId].name}\n${run.GetAllCategoryInfo()}`)
            .addField('Time', run.GetTimeString(), true);
        return embed;
    }

    PostNewSubmittedRun(run : RunInfo) {
        if(process.env.SUBMITTEDCHANNEL === undefined) return;
        client.channels.fetch(process.env.SUBMITTEDCHANNEL)
            .then(channel => {
                if (channel === null || channel?.type !== 'GUILD_TEXT') return;
                try {
                    const message : MessageEmbed = new MessageEmbed()
                        .setTitle("NEW SUBMITTED RUN");
                    this.SetRunInfoInEmbed(run, message);
                    channel.send({ embeds: [message] })
                        .then((msg) => {
                            srcData.allMaps[run.mapId].oldSubmittedRuns[run.id] = {
                                messageID: msg.id,
                                run: run
                            };
                        });
                } catch (error) {
                    console.error(error);
                    this.PostError();
                }
            })
            .catch(console.error);
    }

    DeleteOldSubmittedRun(oldSubmittedRun: SittingSubmittedRun) {
        if(process.env.SUBMITTEDCHANNEL === undefined) return;
        client.channels.fetch(process.env.SUBMITTEDCHANNEL)
            .then(channel => {
                if (channel === null || channel?.type !== 'GUILD_TEXT') return;
                try {
                    channel.messages.fetch(oldSubmittedRun.messageID).then(msg => msg.delete());
                } catch (error) {
                    console.error(error);
                    this.PostError();
                }
            })
            .catch(console.error);
    }

    PostNewVerifiedRun(run : RunInfo, place: number, total: number) {
        if(process.env.VERIFIEDCHANNEL === undefined) return;
        client.channels.fetch(process.env.VERIFIEDCHANNEL)
            .then(channel => {
                if (channel === null || channel?.type !== 'GUILD_TEXT') return;
                try {
                    const message : MessageEmbed = new MessageEmbed()
                        .setTitle(place === 1 ? 'NEW WORLD RECORD' : 'NEW VERIFIED RUN');
                    this.SetRunInfoInEmbed(run, message);
                    message.addField('Place', `${place} / ${total}`, true);
                    channel.send({ embeds: [message] })
                } catch (error) {
                    console.error(error);
                    this.PostError();
                }
            })
            .catch(console.error);
    }

    PostError(message: string = '') {
        if(message !== '') {
            console.log(message);
        }
        if(process.env.ERRORCHANNEL === undefined) return;
        client.channels.fetch(process.env.ERRORCHANNEL)
            .then(channel => {
                if (channel === null || channel?.type !== 'GUILD_TEXT') return;
                try {
                    channel.send({ content: `An error has occured${message === '' ? '' : `: '${message}'`}, check the logs <@333083158616735745>` })
                } catch (error) {
                    console.error(error);
                }
            })
            .catch(console.error);
    }

    PostDelete() {
        if(process.env.ERRORCHANNEL === undefined) return;
        client.channels.fetch(process.env.ERRORCHANNEL)
            .then(channel => {
                if (channel === null || channel?.type !== 'GUILD_TEXT') return;
                try {
                    channel.send({content: 'Hey Delete me plz'})
                        .then((message) => {
                            console.log(message.id);
                            idStr = message.id;
                        })
                } catch (error) {
                    console.error(error);
                }
            })
            .catch(console.error);
    }
}

const runPoster: RunPoster = new RunPoster();
export default runPoster;