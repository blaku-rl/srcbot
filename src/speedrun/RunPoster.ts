import { ChannelType, EmbedBuilder } from "discord.js";
import srcData, { RunInfo, SittingSubmittedRun } from "./SRCTypes";
import client from "../index";

export class RunPoster {
  private SetRunInfoInEmbed(run: RunInfo, embed: EmbedBuilder): EmbedBuilder {
    embed
      .setURL(run.link)
      .setThumbnail(srcData.allMaps[run.mapId].image)
      .setAuthor({
        name: run.GetRunnersString(),
        iconURL: run.GetRunnerImage(),
      })
      .setDescription(
        `${srcData.allMaps[run.mapId].name}\n${run.GetAllCategoryInfo()}`,
      )
      .addFields({ name: "Time", value: run.GetTimeString(), inline: true });
    return embed;
  }

  PostNewSubmittedRun(run: RunInfo) {
    console.log(`New submitted run ${run.link}`);
    this.DevLog(run);
    if (process.env.SUBMITTEDCHANNEL === undefined) {
      console.error("Submitted Channel is not defined");
      return;
    }
    client.channels
      .fetch(process.env.SUBMITTEDCHANNEL)
      .then((channel) => {
        if (channel === null || channel?.type !== ChannelType.GuildText) return;
        try {
          const message: EmbedBuilder = new EmbedBuilder().setTitle(
            "NEW SUBMITTED RUN",
          );
          this.SetRunInfoInEmbed(run, message);
          channel.send({ embeds: [message] }).then((msg) => {
            srcData.allMaps[run.mapId].oldSubmittedRuns[run.id] = {
              messageID: msg.id,
              run: run,
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
    console.log("Deleting old submitted run");
    if (process.env.SUBMITTEDCHANNEL === undefined) {
      console.error("Submitted Channel is not defined");
      return;
    }
    client.channels
      .fetch(process.env.SUBMITTEDCHANNEL)
      .then((channel) => {
        if (channel === null || channel?.type !== ChannelType.GuildText) return;
        try {
          channel.messages
            .fetch(oldSubmittedRun.messageID)
            .then((msg) => msg.delete());
        } catch (error) {
          console.error(error);
          this.PostError();
        }
      })
      .catch(console.error);
  }

  PostNewVerifiedRun(run: RunInfo, place: number, total: number) {
    console.log(`New verified run posted ${run.link}`);
    if (process.env.VERIFIEDCHANNEL === undefined) {
      console.error("Verified Channel is not defined");
      return;
    }
    client.channels
      .fetch(process.env.VERIFIEDCHANNEL)
      .then((channel) => {
        if (channel === null || channel?.type !== ChannelType.GuildText) return;
        try {
          const message: EmbedBuilder = new EmbedBuilder().setTitle(
            place === 1 ? "NEW WORLD RECORD" : "NEW VERIFIED RUN",
          );
          this.SetRunInfoInEmbed(run, message);
          message.addFields({
            name: "Place",
            value: `${place} / ${total}`,
            inline: true,
          });
          channel.send({ embeds: [message] });
        } catch (error) {
          console.error(error);
          this.PostError();
        }
      })
      .catch(console.error);
  }

  PostError(message: string = "") {
    if (message !== "") {
      console.error(message);
    }
    if (process.env.ERRORCHANNEL === undefined) {
      console.error("Error Channel is not defined");
      return;
    }
    client.channels
      .fetch(process.env.ERRORCHANNEL)
      .then((channel) => {
        if (channel === null || channel?.type !== ChannelType.GuildText) return;
        try {
          channel.send({
            content: `An error has occured${message === "" ? "" : `: '${message}'`}, check the logs <@333083158616735745>`,
          });
        } catch (error) {
          console.error(error);
        }
      })
      .catch(console.error);
  }

  DevLog(message: any) {
    if (process.env.ENVIRONMENT === "Dev") {
      console.log(message);
    }
  }
}

const runPoster: RunPoster = new RunPoster();
export default runPoster;
