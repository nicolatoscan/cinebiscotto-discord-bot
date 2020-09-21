import { Guild, GuildMember, Role, VoiceChannel } from "discord.js";
import { allowedNodeEnvironmentFlags } from "process";

export default class Sala {

    public static sale: Sala[] = [];
    private static currIndex = 0;

    private index: number = 0;
    private max: number = 0;
    private guild: Guild = null;
    private role: Role = null;
    private channel: VoiceChannel = null;
    private members: GuildMember[] = [];
    private closed: boolean;


    constructor(max: number, guild: Guild, lenghtH: number) {
        Sala.currIndex = (Sala.currIndex + 1) % 100;
        this.index = Sala.currIndex;
        this.max = max;
        this.guild = guild;
        this.closed = false;

        setTimeout(async () => {
            await this.closeSala(null);
        }, lenghtH * 1000 * 60 * 60)

    }

    public async setUp() {

        this.role = await this.guild.roles.create({
            data: {
                name: `Biglietto Sala ${this.index}`,
                color: 'BLUE'
            }
        });

        this.channel = await this.guild.channels.create(`Sala ${this.index}`, {
            type: 'voice',
            parent: this.guild.channels.cache.find(c => c.name.indexOf("Voice Channels") >= 0),
            permissionOverwrites: [{
                id: this.guild.id,
                allow: ['MANAGE_CHANNELS'],
                deny: ['CONNECT']
            }, {
                id: this.guild.roles.cache.find(r => r.name.indexOf("CineBiscotto") >= 0),
                allow: ["MANAGE_CHANNELS"]
            }, {
                id: this.role.id,
                allow: ['CONNECT', 'MANAGE_CHANNELS']
            }]
        })
    }



    public reserve(member: GuildMember): boolean {
        if (this.members.length < this.max && this.members.indexOf(member) < 0) {
            member.roles.add(this.role);
            this.members.push(member)
            return true;
        }
        return false;
    }

    public async closeSala(member: GuildMember): Promise<boolean> {
        if (this.closed)
            return;

        if (member == null || member.roles.cache.find(r => r.name === this.role.name)) {
            
            this.closed = true;
            this.members.forEach(async m => {
                await m.roles.remove(this.role);
            })
            await this.role.delete();
            await this.channel.delete();
            
            Sala.sale = Sala.sale.filter(s => s != this)
            if (Sala.sale.length === 0)
            Sala.currIndex = 0;
            return true;
        }
        return false;
    }

    public isInSala(m: GuildMember): boolean {
        return this.members.indexOf(m) >= 0;
    }

    public getIndex(): number {
        return this.index;
    }
}