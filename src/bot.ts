import * as dotenv from 'dotenv';
import { Client, Message, Channel, GuildMember } from 'discord.js';
import Sala from './sala';

dotenv.config();
class Bot {

    private bot: Client = null;
    private sala: Sala = null;

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

    private onMessage(msg: Message) {

        let params: string[] = msg.content.split(" ");

        if (params[0] === 'help') {
            msg.reply("\n`ping` - Pingami\n`sala <nr ore> <nr posti>` - Crea una sala\n`biglietto` - Ottieni un biglietto\n`chiudi` - Chiudi la sala")
        } else if (params[0] === 'ping') {
            msg.reply("", { files: ["./src/muto.mp4"] })
        } else if (params[0] === 'biglietto') {
            //BIGLIETTO
            if (this.sala == null)
                msg.reply(`La sala non esiste.`);
            else if (!this.sala.reserve(msg.member))
                msg.reply('La sala è piena');
            else
                msg.reply(`Ecco il biglietto.`);

            return;
        } else if (params[0] === 'sala') {
            //SALA
            if (this.sala !== null) {
                msg.reply('Il multisala ha finito le sale');
                return;
            }

            if (params.length >= 2) {
                let h: number = +params[1];
                let posti: number = +params[2];

                if (h > 60) {
                    msg.reply('Errore: la sala può essere al massimo di 6 ore');
                    return;
                }


                this.sala = new Sala(posti, msg.guild.roles.cache.find(role => role.name == "biglietto"));

                setTimeout(() => {
                    if (this.sala !== null) {
                        this.sala.closeSala();
                        this.sala = null;
                    }
                }, h * 60 * 60 * 1000)

                msg.reply(`La sala da ${posti} posti è stata creata per ${h} ore.`);

            } else {
                msg.reply('Errore: usa `sala <nr ore> <nr posti>`');
            }

            return;
        } else if (params[0] === 'chiudi') {
            //CHIUDI
            if (this.sala === null) {
                msg.reply("Nessuna sala trovata");
            } else if (!this.sala.isInSala(msg.member)) {
                msg.reply("Devi essere nella sala per poter chiuderla");
            } else {
                this.sala.closeSala();
                this.sala = null;
                msg.reply("La sala è stata chiusa");
            }
            return;
        }

    }

}

new Bot();