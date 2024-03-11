import fs from "fs";

export async function deleteSession(userPhone: string) {
  if (fs.existsSync(`baileys_auth_info-${userPhone}`)) {
    fs.rmSync(`baileys_auth_info-${userPhone}`, {
      force: true,
      recursive: true,
    });
  }
}
