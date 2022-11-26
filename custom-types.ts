import { Message, MessageEmbed } from 'discord.js'

export type CommandStruct = {
    command : string,
    args : string[],
    userId : string,
    responseEmbed : MessageEmbed,
    message : Message,
    shouldMessage : boolean
}

export type FieldInfo = {
    name : string,
    value : string
}

export type MapInfo = {
    name: string,
    srcID: string
}

export type Category = {
    name: string,
    description: string,
    command: string,
    maps: MapInfo[]
}

export type CategoryInfo = {
    categoriesFields : FieldInfo[],
    categoriesString : string,
    categoriesJson : Category[]
}

export type TimeOutInfo = {
    timeout : NodeJS.Timeout,
    startedTime : number,
    delay : number
}

export type CustomCommand = {
    shortKey : string,
    longKey? : string,
    commandFunc: (arg0 : CommandStruct) => CommandStruct
}

export type BotConstants = {
    commandPrefix : string,
    commandChannelID : string,
    verifiedChannelID : string,
    baseEmbedFunc : () => MessageEmbed
}

export type Queue = {
    playerIDQueue: string[],
    queuePick: boolean,
    queueStatus: () => FieldInfo[],
    startQueue: (arg0 : number) => void,
    stopQueue: () => void
    popQueue: () => void
}