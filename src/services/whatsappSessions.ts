import makeWASocket, {
    DisconnectReason,
    makeCacheableSignalKeyStore,
    useMultiFileAuthState,
} from "@whiskeysockets/baileys";

import { Boom } from "@hapi/boom";
import { deleteSession } from "./databaseHelpers";

const P = require("pino")({
  level: "silent",
});

export async function connectToWhatsApp(phone: string) {

  const { saveCreds, state } = await useMultiFileAuthState(`baileys_auth_info-${phone}`);

  const socket = makeWASocket({
    printQRInTerminal: false,
    defaultQueryTimeoutMs: 0,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, P),
    },
    browser: ['Windows', 'Firefox', '123.0'],
  });

  socket.ev.on("connection.update", (update) => {
    const status = (update.lastDisconnect?.error as Boom)?.output?.statusCode;
    console.log("🚀 ~ socket.ev.on ~ status:", status)

    if (status == DisconnectReason.restartRequired) {
      connectToWhatsApp(phone);
    }

    if (status == DisconnectReason.loggedOut) {
      deleteSession(phone);
    }
  });

  socket.ev.on("creds.update", saveCreds);

  return socket;
}

async function reconnectAllSessions() {
  // Do a for loop and reconnect all sessions
  await connectToWhatsApp('');
}

reconnectAllSessions()