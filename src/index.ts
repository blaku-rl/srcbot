import {
  ChannelType,
  Client,
  Events,
  GatewayIntentBits,
  Partials,
} from "discord.js";
import dotenv from "dotenv";
import requestManager from "./speedrun/RequestManager";
dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
  partials: [Partials.Channel],
});

client.on(Events.ClientReady, () => {
  console.log("Bot is online");
  requestManager.BeginLooping();
});

const approvedLevelIls = [
  "Limited Boost Dribble Challenge",
  "Dribbling Challenge #2",
];

const approvedMainCategories = [
  "Training (Tutorial: Basic)",
  "Training (Tutorial: Advanced)",
  "Training (Tutorial: Basic + Advanced)",
  "Training (Aerial)",
  "Training (Goalie)",
  "Training (Striker)",
  "Training (All Training + Tutorial)",
  "Exhibition Match (Soccar, 1v1, Beginner, 5 Goals)",
  "Exhibition Match (Soccar, 2v2, Beginner, 5 Goals)",
  "Exhibition Match (Soccar, 3v3, Beginner, 5 Goals)",
  "Exhibition Match (Soccar, 4v4, Beginner, 5 Goals)",
  "Exhibition Match (Soccar, 1v2, Beginner, 5 Goals)",
  "Exhibition Match (Soccar, 1v3, Beginner, 5 Goals)",
  "Exhibition Match (Soccar, 1v4, Beginner, 5 Goals)",
];

const approvedExtensionCategories = [
	"Dribble",
	"Air Dribble",
	"Flip Reset",
]

client.on(Events.MessageCreate, async (message) => {
  if (message.channel.type !== ChannelType.GuildAnnouncement) return;
  if (!message.author.bot) return;
  if (message.embeds.length !== 1) return;

  const embed = message.embeds[0];
  const desc = embed.description;
  const title = embed.title;

  if (title === null || title !== "NEW WORLD RECORD" || desc === null) return;
  const details = desc.split("\n");
  if (details.length !== 2) return;

  const mapName = details[0].trim();
  const category = details[1].trim();

  if (
    category.toLowerCase().startsWith("level") &&
    !approvedLevelIls.includes(mapName)
  )
    return;
  if (mapName === "Rocket League" && !approvedMainCategories.includes(category))
    return;

	if (mapName === "Rocket League Category Extensions"){
		let blockedCategory = true;
		for (const cat in approvedExtensionCategories)
			if (category.startsWith(cat)) blockedCategory = false;

		if (blockedCategory) return;
	}

  message.crosspost();
});

client.login(process.env.TOKEN);
export default client;
