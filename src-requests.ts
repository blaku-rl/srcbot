import axios from 'axios'
import { Client } from 'discord.js';
import constants from './constants';
import commandList from './command-manager';
import { CommandStruct } from './custom-types';

const allItemsReq = 'https://www.speedrun.com/api/v1/series/g7q25m57/games?max=200'
const allMapsIDs : string[] = []
const latestRunForSrcID : Record<string, string> = {}
const httpStart = 'https://www.speedrun.com/api/v1/runs?game=';
const httpEnd = '&status=verified&orderby=verify-date&direction=desc&embed=category,players';
let client : Client

export function ListenForRuns(clientOG : Client) {
    client = clientOG
    GetAllSeriesIDs()
    setTimeout(CheckForNewRuns, 10000)
    setInterval(GetAllSeriesIDs, 86400000)
    setInterval(CheckForNewRuns, 120000)

    commandList['r'] = GetLatestVerifiedRuns
    commandList['recent'] = GetLatestVerifiedRuns
}

function GetAllSeriesIDs() {
	console.log('Getting all series id\'s');
	axios.get(allItemsReq, {
        headers : {
            'User-Agent': 'rlsrcbot/0.2',
        },
    })
    .then(res => {
		console.log(`${res.data.data.length} games found`)
        ParseAllSeriesData(res.data.data);
    })
    .catch(error => {
        console.error(error);
    });
}

function ParseAllSeriesData(data : any) {
    for (const item of data) {
        if (!allMapsIDs.includes(item.id)) {
            allMapsIDs.push(item.id)
        }
    }
}

function CheckForNewRuns() {
	console.log('Checking SRC For New Runs');
	for (const id of allMapsIDs) {
		axios.get(`${httpStart}${id}${httpEnd}`, {
			headers : {
				'User-Agent': 'rlsrcbot/0.2',
			},
		})
		.then(res => {
			ParseAPIRunInfo(res.data.data, id);
		})
		.catch(error => {
			console.error(error);
		});
	}
}

function ParseAPIRunInfo(runs : any, id : string) {
    let firstIteration = false
    if (!(id in latestRunForSrcID)) {
		if (id === 'y655oz86') {
			latestRunForSrcID[id] = 'y4q97e2m'
		}
		else {
			latestRunForSrcID[id] = ''
			firstIteration = true
		}
    }
	if (runs.length === 0) return
	const newLatestRunID = runs[0].id

	if (firstIteration) {
		latestRunForSrcID[id] = newLatestRunID
		return
	}
	if (newLatestRunID === latestRunForSrcID[id]) return

	for (const item of runs) {
		if (item.id === latestRunForSrcID[id]) break
		let playerString = ''
		for (const player of item.players.data) {
			playerString += player.names.international + ', '
		}
		const playerDisplay = `${playerString.substring(0, playerString.length - 2)} ${(item.players.data.length > 1 ? 'have' : 'has')}`
		console.log(`New run message: ${playerDisplay} a new verfied run! ${item.weblink}`)

        //const channel = client.channels.cache.get(constants.verifiedChannelID)
        //if (channel === null || channel?.type !== 'GUILD_TEXT') continue
        //channel.send({ content: `${playerDisplay} a new verfied run! ${item.weblink}` });
		client.channels.fetch(constants.verifiedChannelID)
			.then(channel => {
				console.log('Verification Channel found')
				if (channel === null || channel?.type !== 'GUILD_TEXT') return
				console.log('Verification channel is valid')
				try {
					channel.send({ content: `${playerDisplay} a new verfied run! ${item.weblink}` })
				} catch (error) {
					console.error(error);
				}
			})
			.catch(console.error)
	}

	latestRunForSrcID[id] = newLatestRunID;
}

function GetLatestVerifiedRuns(content : CommandStruct) : CommandStruct {
    return content
}