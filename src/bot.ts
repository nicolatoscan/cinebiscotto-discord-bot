import * as dotenv from 'dotenv';
import { Client, Message, Channel, GuildMember } from 'discord.js';
import Sala from './sala';

dotenv.config();
class Bot {

    private bot: Client = null;

    constructor() {
        this.bot = new Client();
        this.bot.login(process.env.BOT_TOKEN);

        this.middleware();


        this.bot.on('ready', () => {
            console.log(`Logged in as ${this.bot.user.tag}!`);
        });
    }

    private middleware() {
        this.bot.on('message', msg => this.onMessage(msg));
    }

    private async onMessage(msg: Message) {

        let params: string[] = msg.content.split(" ");

        if (params[0] === 'help') {
            this.helpMsg(msg, params);
        } else if (params[0] === 'ping') {
            this.pingMsg(msg, params);
        } else if (params[0] === 'biglietto') {
            this.bigliettoMsg(msg, params);
        } else if (params[0] === 'sala') {
            this.salaMsg(msg, params);
        } else if (params[0] === 'chiudi') {
            this.chiudiMsg(msg, params);
        }

    }

    private helpMsg(msg: Message, params: string[]) {
        msg.reply(
            "\n`ping` - Pingami\n"
            + "`sala <nr ore> <nr posti>` - Crea una sala\n"
            + "`biglietto <nr sala>` - Ottieni un biglietto per la Sala X\n"
            + "`chiudi <nr sala>` - Chiudi la Sala X")
    }

    private pingMsg(msg: Message, params: string[]) {
        msg.reply("", { files: ["./src/muto.mp4"] })
    }

    private bigliettoMsg(msg: Message, params: string[]) {

        if (params.length >= 2) {
            let nr = +params[1];

            let sala = Sala.sale.find(s => s.getIndex() == nr);
            if (!sala) {
                msg.reply('Errore: Sala non trovata');
                return;
            }
            if (!sala.reserve(msg.member)) {
                msg.reply('Errore: La sala è piena');
                return;
            }

            msg.reply(`Ecco il biglietto per la sala ${nr}.`);

        } else {
            msg.reply('Errore: usa `biglietto <numero sala>`');
        }

    }

    private async salaMsg(msg: Message, params: string[]) {

        if (Sala.sale.length >= 100) {
            msg.reply('Il multisala ha finito le sale');
            return;
        }

        if (params.length >= 3) {
            let h: number = +params[1];
            let posti: number = +params[2];

            if (h >= 1 && posti >= 1) {
                if (h > 6 || posti > 100) {
                    msg.reply('Errore: massimo 6 ore e 100 posti`');
                    return;
                }

                let sala = new Sala(posti, msg.guild, h);
                await sala.setUp();
                Sala.sale.push(sala);
                msg.reply(`La sala ${sala.getIndex()} da ${posti} posti è stata creata per ${h} ore.`);
            } else {
                msg.reply('Errore: usa `sala <nr ore> <nr posti>`');
            }

        } else {
            msg.reply('Errore: usa `sala <nr ore> <nr posti>`');
        }
    }

    private async chiudiMsg(msg: Message, params: string[]) {
        if (params.length >= 2) {
            let nr = +params[1];
            let sala = Sala.sale.find(s => s.getIndex() == nr);
            if (!sala) {
                msg.reply('Errore: Sala non trovata');
                return;
            }

            if (await sala.closeSala(msg.member))
                msg.reply(`Sala ${nr} chiusa.`);
            else
                msg.reply(`Impossibile chiudere la sala.`);

        } else {
            msg.reply('Errore: usa `biglietto <numero sala>`');
        }
    }



}

new Bot();