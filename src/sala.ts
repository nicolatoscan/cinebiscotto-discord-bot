import { GuildMember, Role } from "discord.js";

export default class Sala {
    private max: number = 0;
    private members: GuildMember[] = [];
    private role: Role = null;

    constructor(max: number, role: Role) {
        this.max = max;
        this.role = role;
    }

    public reserve(member: GuildMember): boolean {
        if (this.members.length < this.max && this.members.indexOf(member) < 0) {
            member.roles.add(this.role);
            this.members.push(member)
            return true;
        }
        return false;
    }



    public closeSala() {
        this.members.forEach(m => {
            m.roles.remove(this.role);
        })
    }
}