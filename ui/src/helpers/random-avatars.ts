const randomBoredApes = [
  "https://img.seadn.io/files/8d625952a863680de6b255c9906d5bc3.png?auto=format&fit=max&w=256",
  "https://img.seadn.io/files/07f4b348f4855a7cfe60d6a7b3a60225.png?auto=format&fit=max&w=256",
  "https://img.seadn.io/files/c893d3fcac3dec581f1fc96894c8158e.png?auto=format&fit=max&w=256",
  "https://img.seadn.io/files/8c3f8e7949c499bd630def761c07fbda.png?auto=format&fit=max&w=256",
]

export const randomAvatar = (arr = randomBoredApes) => 
  arr[Math.floor(Math.random() * arr.length)]

export const chatBubbles = (channel: string) => [
  {
    channel: channel,
    username: "dcts",
    avatarUrl: "https://img.seadn.io/files/66196dd65af5e25c2fac209b0e33bd8d.png?auto=format&fit=max&w=256",
    agentPubKey: "ascou3v8asv8yx0984v0p7duzk"
  },
  {
    channel: channel,
    username: "Art Brock",
    avatarUrl: "https://img.seadn.io/files/45e5b8384841b475e7411dafd6c6291a.png?auto=format&fit=max&w=256",
    agentPubKey: "x7f33168savLSKJOIQzasd"
  },
  {
    channel: channel,
    username: "dcts",
    avatarUrl: "https://img.seadn.io/files/4f809b585367ec71fa19daba04066cd0.png?auto=format&fit=max&w=256",
    agentPubKey: "v8274sduv2874eva98dv0lki"
  },
  {
    channel: channel,
    username: "dcts",
    avatarUrl: "https://img.seadn.io/files/4f809b585367ec71fa19daba04066cd0.png?auto=format&fit=max&w=256",
    agentPubKey: "v8274sduv2874eva98dv0lki"
  },
  {
    channel: channel,
    username: "dcts",
    avatarUrl: "https://img.seadn.io/files/4f809b585367ec71fa19daba04066cd0.png?auto=format&fit=max&w=256",
    agentPubKey: "v8274sduv2874eva98dv0lki"
  },
];