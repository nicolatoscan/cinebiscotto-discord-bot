import { Guild, GuildMember, Role, VoiceChannel } from "discord.js";

export default class Sala {

    public static sale: Sala[] = [];
    private static currIndex = 0;

    private index: number = 0;
    private max: number = 0;
    private guild: Guild = null;
    private role: Role = null;
    private channel: VoiceChannel = null;
    private members: GuildMember[] = [];


    constructor(max: number, guild: Guild, lenghtH: number) {
        Sala.currIndex = (Sala.currIndex + 1) % 100;
        this.index = Sala.currIndex;
        this.max = max;
        this.guild = guild;

        setTimeout(() => {
            this.closeSala();
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
            permissionOverwrites: [{
                id: this.guild.id,
                allow: ['CONNECT']
            },{
                id: this.role.id,
                allow: ['CONNECT']
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

    public closeSala(): void {
        this.members.forEach(m => {
            m.roles.remove(this.role);
        })
        this.channel.delete();
        Sala.sale = Sala.sale.filter(s => s != null)
    }

    public isInSala(m: GuildMember): boolean {
        return this.members.indexOf(m) >= 0;
    }

    public getIndex(): number {
        return this.index;
    }
}