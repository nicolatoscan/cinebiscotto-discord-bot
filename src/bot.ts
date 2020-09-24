import * as dotenv from 'dotenv';
import { Client, Message, Channel, GuildMember, TextChannel } from 'discord.js';
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
        if ((<TextChannel>msg.channel).name !== "biglietteria")
            return;

        let params: string[] = msg.content.split(" ");

        switch (params[0].toLocaleLowerCase()) {
            case 'help':
            case 'aiuto':
            case 'h':
            case 'sos':
                this.helpMsg(msg, params);
                break;

            case 'ping':
                this.pingMsg(msg, params);
                break;

            case 'countdown':
            case 'cd':
                this.countdown(msg, params);
                break;

            case 'biglietto':
            case 'ticket':
            case 't':
            case 'b':
                this.bigliettoMsg(msg, params);
                break;

            case 'sala':
            case 'saloon':
            case 'salone':
            case 's':
                this.salaMsg(msg, params);
                break;

            case 'chiudi':
            case 'close':
            case 'c':
                this.chiudiMsg(msg, params);
                break;

            default:
                break;
        }

    }

    private helpMsg(msg: Message, params: string[]) {
        msg.reply(
            "\n"
            + "Ping:\n"
            + "`ping`\n\n"

            + "Crea una sala ore e posti\n"
            + "`sala | s  <nr di ore> <nr di posti>`\n\n"

            + "Ottieni un biglietto per la Sala X\n"
            + "`biglietto | ticket | b | t <nr sala>`\n\n"

            + "Chiudi la Sala X\n"
            + "`chiudi | close | c <nr sala>`\n\n"

            + "Countdown\n"
            + "`countdown | cd`\n\n")
    }

    private pingMsg(msg: Message, params: string[]) {
        msg.reply("", { files: ["./asssets/muto.mp4"] })
    }

    private bigliettoMsg(msg: Message, params: string[]) {

        if (params.length >= 2) {
            let nr = +params[1];

            let sala = Sala.sale.find(s => s.getIndex() == nr);
            if (!sala) {
                msg.reply('404 Sala non trovata');
                return;
            }
            if (!sala.reserve(msg.member)) {
                msg.reply('Error: La sala è piena');
                return;
            }

            msg.reply(`Eccoti il biglietto per la sala ${nr} buona visione :)`);

        } else {
            msg.reply('Error: usa `biglietto <nr sala>`');
        }

    }

    private async salaMsg(msg: Message, params: string[]) {

        if (Sala.sale.length >= 20) {
            msg.reply('Il multisala ha esaurito le sale');
            return;
        }

        if (params.length >= 3) {
            let h: number = +params[1];
            let posti: number = +params[2];

            if (h >= 1 && posti >= 1) {
                if (h > 10 || posti > 50) {
                    msg.reply('Error: la sala può essere di massimo 10 ore e 50 posti');
                    return;
                }

                let sala = new Sala(posti, msg.guild, h);
                await sala.setUp();
                Sala.sale.push(sala);
                msg.reply(`Sala ${sala.getIndex()} da ${posti} posti è stata creata per ${h} ore`);
            } else {
                msg.reply('Error: usa `sala <nr ore> <nr posti>`');
            }

        } else {
            msg.reply('Error: usa `sala <nr ore> <nr posti>`');
        }
    }

    private async chiudiMsg(msg: Message, params: string[]) {
        if (params.length >= 2) {
            let nr = +params[1];
            let sala = Sala.sale.find(s => s.getIndex() == nr);
            if (!sala) {
                msg.reply('404 Sala non trovata');
                return;
            }

            if (await sala.closeSala(msg.member))
                msg.reply(`Grazie aver tenuto pulito, la sala ${nr} è stata chiusa`);
            else
                msg.reply(`Impossibile chiudere la sala`);

        } else {
            msg.reply('Error: usa `biglietto <nr sala>`');
        }
    }

    private async countdown(msg: Message, params: string[]) {
        let channel = msg.member.voice.channel;
        if (channel) {
            let conn = await channel.join();
            let dispatcher = conn.play("./asssets/countdown.mp3");

            dispatcher.on('finish', f => {
                setTimeout(() => {
                    channel.leave();
                }, 300)
            })
        }
    }



}

new Bot();
