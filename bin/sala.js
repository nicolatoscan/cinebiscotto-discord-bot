"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Sala {
    constructor(max, role) {
        this.max = 0;
        this.members = [];
        this.role = null;
        this.max = max;
        this.role = role;
    }
    reserve(member) {
        if (this.members.length < this.max && this.members.indexOf(member) < 0) {
            member.roles.add(this.role);
            this.members.push(member);
            return true;
        }
        return false;
    }
    closeSala() {
        this.members.forEach(m => {
            m.roles.remove(this.role);
        });
    }
}
exports.default = Sala;
