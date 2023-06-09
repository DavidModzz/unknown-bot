require("./config");
const {
  default: AnyWASocket,
  makeInMemoryStore,
  downloadContentFromMessage,
  DisconnectReason,
  useSingleFileAuthState,
} = require("@adiwajshing/baileys");
const fs = require("fs");
const P = require("pino");
const { Boom } = require("@hapi/boom");
const axios = require("axios");
const util = require("util");
const fetch = require("node-fetch");
const BodyForm = require("form-data");
const mimetype = require("mime-types");
const speed = require("performance-now");
const moment = require("moment-timezone");
const { color } = require("./lib/color");
const { fetchJson } = require("./lib/fetcher");
const { fromBuffer } = require("file-type");
const { banner, banner2 } = require("./lib/functions");
const hour = moment.tz(timezone).format("HH:mm:ss");
const date = moment.tz(timezone).format("DD/MM/YY");
const telegraph = require("./lib/telegraph");
const { isFiltered, addFilter } = require("./lib/spam");
const girastamp = speed();
const latensi = speed() - girastamp;

async function start() {
  const store = makeInMemoryStore({
    logger: P().child({ level: "debug", stream: "store" }),
  });

  const { state, saveState } = useSingleFileAuthState("./session.json");
  const clearState = () => fs.unlink("./session.json");
  console.log(banner.string);
  console.log(banner2.string);
  const client = AnyWASocket({
    logger: P({ level: "fatal" }),
    printQRInTerminal: true,
    browser: [botName, "Firefox", "4.0.0"],
    auth: state,
  });

  client.ev.on("creds.update", saveState);

  client.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;
    if (update.qr) {
      console.log(
        color("[", "white"),
        color("!", "red"),
        color("]", "white"),
        color(`Escanea el código QR`, "blue")
      );
    }
    if (connection === "close") {
      const { statusCode } = new Boom(lastDisconnect?.error).output;
      if (statusCode !== DisconnectReason.loggedOut) {
        console.log("Conectando...");
        setTimeout(() => start(), 3000);
      } else {
        console.log("Disconnected.", true);
        clearState();
        console.log("Starting...");
        setTimeout(() => start(), 3000);
      }
    }
    if (connection === "connecting") {
      client.state = "connecting";
      console.log("Conectando a WhatsApp...");
    }
    if (connection === "open") {
      client.state = "open";
      console.log("🤖", color(`${botName} está listo!!`, "green"));
    }
  });

  client.ev.on("messages.upsert", async (msg) => {
    m = msg;
    try {
      const getRandom = (ext) => {
        return `${Math.floor(Math.random() * 10000)}${ext}`;
      };
      const getExtension = async (type) => {
        return await mimetype.extension(type);
      };
      const getBuffer = (url, options) =>
        new Promise(async (resolve, reject) => {
          options ? options : {};
          await axios({
            method: "get",
            url,
            headers: { DNT: 1, "Upgrade-Insecure-Request": 1 },
            ...options,
            responseType: "arraybuffer",
          })
            .then((res) => {
              resolve(res.data);
            })
            .catch(reject);
        });
      //***************[ FUNÇÕES ]***************//
      const info = msg.messages[0];
      if (!info.message) return;
      if (info.key && info.key.remoteJid == "status@broadcast") return;
      const type =
        Object.keys(info.message)[0] == "senderKeyDistributionMessage"
          ? Object.keys(info.message)[2]
          : Object.keys(info.message)[0] == "messageContextInfo"
          ? Object.keys(info.message)[1]
          : Object.keys(info.message)[0];
      const content = JSON.stringify(info.message);
      const altpdf = Object.keys(info.message);
      const from = info.key.remoteJid;
      var body =
        type === "conversation"
          ? info.message.conversation
          : type == "imageMessage"
          ? info.message.imageMessage.caption
          : type == "videoMessage"
          ? info.message.videoMessage.caption
          : type == "extendedTextMessage"
          ? info.message.extendedTextMessage.text
          : type == "buttonsResponseMessage"
          ? info.message.buttonsResponseMessage.selectedButtonId
          : type == "listResponseMessage"
          ? info.message.listResponseMessage.singleSelectReply.selectedRowId
          : type == "templateButtonReplyMessage"
          ? info.message.templateButtonReplyMessage.selectedId
          : "";
      const budy =
        type === "conversation"
          ? info.message.conversation
          : type === "extendedTextMessage"
          ? info.message.extendedTextMessage.text
          : "";
      var pes =
        type === "conversation" && info.message.conversation
          ? info.message.conversation
          : type == "imageMessage" && info.message.imageMessage.caption
          ? info.message.imageMessage.caption
          : type == "videoMessage" && info.message.videoMessage.caption
          ? info.message.videoMessage.caption
          : type == "extendedTextMessage" &&
            info.message.extendedTextMessage.text
          ? info.message.extendedTextMessage.text
          : "";
      const args = body.trim().split(/ +/).slice(1);
      const isCmd = body.startsWith(prefix);
      const comando = isCmd
        ? body.slice(1).trim().split(/ +/).shift().toLocaleLowerCase()
        : null;
      bidy = budy.toLowerCase();

      ///////////////
      const getFileBuffer = async (mediakey, MediaType) => {
        const stream = await downloadContentFromMessage(mediakey, MediaType);
        let buffer = Buffer.from([]);
        for await (const chunk of stream) {
          buffer = Buffer.concat([buffer, chunk]);
        }
        return buffer;
      };
      const mentions = (teks, memberr, id) => {
        id == null || id == undefined || id == false
          ? client.sendMessage(from, { text: teks.trim(), mentions: memberr })
          : client.sendMessage(from, { text: teks.trim(), mentions: memberr });
      };
      const getGroupAdmins = (participants) => {
        admins = [];
        for (let i of participants) {
          if (i.admin == "admin") admins.push(i.id);
          if (i.admin == "superadmin") admins.push(i.id);
        }
        return admins;
      };
      const messagesC = pes.slice(0).trim().split(/ +/).shift().toLowerCase();
      const arg = body.substring(body.indexOf(" ") + 1);
      const botNum = client.user.id.split(":")[0];
      const argss = body.split(/ +/g);
      const testat = body;
      const ants = body;
      const isGroup = info.key.remoteJid.endsWith("@g.us");
      const q = args.join(" ");
      const sender = isGroup ? info.key.participant : info.key.remoteJid;
      const pushname = info.pushName ? info.pushName : "";
      const groupMetadata = isGroup ? await client.groupMetadata(from) : "";
      const groupName = isGroup ? groupMetadata.subject : "";
      const groupDesc = isGroup ? groupMetadata.desc : "";
      const groupMembers = isGroup ? groupMetadata.participants : "";
      const groupAdmins = isGroup ? getGroupAdmins(groupMembers) : "";
      const text = args.join(" ");
      const enviar = (texto) => {
        client.sendMessage(from, { text: texto }, { quoted: info });
      };
      const quoted = info.quoted ? info.quoted : info;
      const mime = (quoted.info || quoted).mimetype || "";
      const isBot = info.key.fromMe ? true : false;
      const isBotGroupAdmins = groupAdmins.includes(botNum) || false;
      const isGroupAdmins = groupAdmins.includes(sender) || false;
      const isOwner = sender.includes(ownerNum);
      const groupId = isGroup ? groupMetadata.jid : "";
      banChats = true;
      const argis = bidy.trim().split(/ +/);

      // Consts isQuoted
      const isImage = type == "imageMessage";
      const isVideo = type == "videoMessage";
      const isAudio = type == "audioMessage";
      const isSticker = type == "stickerMessage";
      const isContact = type == "contactMessage";
      const isLocation = type == "locationMessage";
      const isProduct = type == "productMessage";
      const isMedia =
        type === "imageMessage" ||
        type === "videoMessage" ||
        type === "audioMessage";
      typeMessage = body.substr(0, 50).replace(/\n/g, "");
      if (isImage) typeMessage = "Image";
      else if (isVideo) typeMessage = "Video";
      else if (isAudio) typeMessage = "Audio";
      else if (isSticker) typeMessage = "Sticker";
      else if (isContact) typeMessage = "Contact";
      else if (isLocation) typeMessage = "Location";
      else if (isProduct) typeMessage = "Product";
      const isQuotedMsg =
        type === "extendedTextMessage" && content.includes("textMessage");
      const isQuotedImage =
        type === "extendedTextMessage" && content.includes("imageMessage");
      const isQuotedVideo =
        type === "extendedTextMessage" && content.includes("videoMessage");
      const isQuotedDocument =
        type === "extendedTextMessage" && content.includes("documentMessage");
      const isQuotedAudio =
        type === "extendedTextMessage" && content.includes("audioMessage");
      const isQuotedSticker =
        type === "extendedTextMessage" && content.includes("stickerMessage");
      const isQuotedContact =
        type === "extendedTextMessage" && content.includes("contactMessage");
      const isQuotedLocation =
        type === "extendedTextMessage" && content.includes("locationMessage");
      const isQuotedProduct =
        type === "extendedTextMessage" && content.includes("productMessage");

      //       message logging
      if (!isGroup && isCmd)
        console.log(
          color("Comando:", "blue"),
          `${comando}`,
          "\n",
          color("De:", "blue"),
          `${sender.split("@")[0]}`,
          "\n"
        );
      if (!isGroup && !isCmd)
        console.log(
          color("Mensaje", "blue"),
          "\n",
          color("De:", "blue"),
          `${sender.split("@")[0]}`,
          "\n"
        );
      if (isCmd && isGroup)
        console.log(
          color("Comando:", "blue"),
          `${comando}`,
          "\n",
          color("De:", "blue"),
          `${sender.split("@")[0]}`,
          "\n",
          color("En:", "blue"),
          `${groupName}`,
          "\n"
        );
      if (!isCmd && isGroup)
        console.log(
          color("Mensaje", "blue"),
          color("De:", "blue"),
          `${sender.split("@")[0]}`,
          "\n",
          color("En:", "blue"),
          `${groupName}`,
          "\n"
        );

      switch (comando) {
        // comienzo de comandos con prefix

        case "attp":
          try {
            attp = args.join(" ");
            url = encodeURI(`https://kurupi.onrender.com/attp?texto=${attp}`);
            attp = await getBuffer(url);
            client.sendMessage(from, { sticker: attp }, { quoted: info });
          } catch (e) {
            enviar("Error");
            console.log(e);
          }
          break;

        // fin de comandos con prefix
        default:
          // comienzo de comandos sin prefix

          if (isCmd) {
            enviar("*Este comando no existe*");
          }

        // fin de comandos sin prefix
      }
    } catch (e) {
      console.log(e);
    }
  });
}
start();
