import "./water/index.css";

import { render, h } from "preact";
import Stores, { player, commands, channel } from "./data";
import App from "./jsx/App";
import { connect } from "./core/irc";
import { handle } from "./core/command";

// @ts-expect-error
window.Stores = Stores;
// @ts-expect-error
window.Player = player;

player.on("play", (s) => console.log(`Started playing ${s}`));
player.on("stop", (s) => console.log(`Stopped playing ${s}`));

render(<App channel={channel} commands={commands} player={player} />, document.querySelector("#app")!);

if (channel) {
  async function onclose() {
    console.log("Disconnected, reconnecting...");
    ws = await connect(channel!);
    ws.onclose = onclose;
    ws.onmessage = onmessage;
  }

  function onmessage({ data: message }: MessageEvent<any>) {
    if (message.includes("PING")) return ws.send("PONG :tmi.twitch.tv");
    console.log("DEBUG", message);
    handle(Stores.users, Stores.prefs, Stores.prefix, commands, message);
  }

  let ws = await connect(channel);
  ws.onclose = onclose;
  ws.onmessage = onmessage;

  console.log("Connected");
  console.log("channel", channel);
  console.log("prefix", Stores.prefix.get());
  console.log("preferences", Stores.prefs.get());
  console.log("users", Stores.users.get());
  console.log("aliases", Stores.aliases.get());
  console.log("cooldowns", Stores.cooldowns.get());
  console.log("commands", commands);
  console.log("player", player);
}
