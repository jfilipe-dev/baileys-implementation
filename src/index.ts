import cors from "cors";
import express, { Request, Response, Router } from "express";
import { connectToWhatsApp } from "./services/whatsappSessions";
import { delay } from "@whiskeysockets/baileys";
import { deleteSession } from "./services/databaseHelpers";

const app = express();

app.use(express.json());
app.use(cors());

const routes = Router();

routes.post("/scan", async (req: Request, res: Response) => {
  const { userPhone } = req.body;

  deleteSession(userPhone);

  const socket = await connectToWhatsApp(userPhone);

  await delay(1000);

  const code = await socket.requestPairingCode(userPhone);

  res.status(200).json({ code });
});

routes.post("/send", async (req: Request, res: Response) => {
  const { number, message, userPhone } = req.body;

  const jid = `${number}@s.whatsapp.net`;
  const socket = await connectToWhatsApp(userPhone);

  await delay(1000);

  await socket.sendMessage(jid, { text: message });

  res.status(200).json({ success: true });
});

app.use("/api", routes);

export { app };
