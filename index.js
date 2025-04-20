require("dotenv").config();
const { Client, GatewayIntentBits, Events, ActivityType } = require("discord.js");
const {
  joinVoiceChannel,
  entersState,
  VoiceConnectionStatus,
  createAudioPlayer,
  createAudioResource,
  StreamType
} = require("@discordjs/voice");
const express = require("express");
const fs = require("fs");

// UptimeRobot için web sunucusu
const app = express();
app.get("/", (req, res) => res.send("Bot aktif"));
app.listen(3000, () => console.log("🌐 Ping sunucusu çalışıyor."));

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

client.once(Events.ClientReady, async () => {
  console.log(`✅ Bot giriş yaptı: ${client.user.tag}`);
  client.user.setActivity("921", { type: ActivityType.Playing });

  const guild = await client.guilds.fetch(process.env.GUILD_ID);
  const channel = await guild.channels.fetch(process.env.VOICE_CHANNEL_ID);

  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: guild.id,
    adapterCreator: guild.voiceAdapterCreator,
    selfDeaf: false, // Kullanıcılar duyabilir (ama zaten sessiz)
  });

  try {
    await entersState(connection, VoiceConnectionStatus.Ready, 30000);
    console.log("🎧 Ses kanalına bağlanıldı.");

    // Sessiz ses dosyası oluştur (1 saniyelik boşluk)
    const silence = Buffer.from([0xF8, 0xFF, 0xFE]);
    const resource = createAudioResource(silence, {
      inputType: StreamType.Raw,
    });

    const player = createAudioPlayer();
    connection.subscribe(player);
    player.play(resource);

    console.log("🔇 Sessiz yayın başlatıldı.");
  } catch (error) {
    console.error("❌ Ses kanalına bağlanırken hata:", error);
  }
});

client.login(process.env.TOKEN);
