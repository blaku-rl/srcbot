import { Client, GatewayIntentBits, Partials } from "discord.js";
import dotenv from "dotenv";
import requestManager from "./speedrun/RequestManager";
dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
  partials: [Partials.Channel],
});

client.on("ready", () => {
  console.log("Bot is online");
  requestManager.BeginLooping();
});

client.login(process.env.TOKEN);
export default client;
