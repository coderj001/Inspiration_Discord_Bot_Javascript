const Discord = require("discord.js");
const dotenv = require("dotenv").config({ path: "env" });
const Database = require("@replit/database");
const fetch = require("node-fetch");
const keepAlive = require("./server");

const db = new Database();
const client = new Discord.Client();

const sadWords = [
  "sad",
  "lonely",
  "heartbroken",
  "gloomy",
  "disappointed",
  "hopeless",
  "grieved",
  "unhappy",
  "lost",
  "troubled",
  "resigned",
  "miserable",
];

const startEncouragements = [
  "Cheer Up or Kill Yourself",
  "Please don't be sad, because no one cares.",
  "Sorry, No one likes Your.",
];

db.get("encouragements").then((encouragements) => {
  if (!encouragements || encouragements.length < 1) {
    db.set("encouragements", startEncouragements);
  }
});

function addEncouragement(encouragementMsg) {
  db.get("encouragements").then((encouragements) => {
    encouragements.push([encouragementMsg]);
    db.set("encouragements", encouragements);
  });
}

function deleteEncouragement(index) {
  db.get("encouragements").then((encouragements) => {
    if (encouragements.length > index) {
      encouragements.splice(index, 1);
    }
    db.set("encouragements", encouragements);
  });
}

function getQuote() {
  return fetch("https://zenquotes.io/api/random")
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      return data[0]["q"] + " -" + data[0]["a"];
    });
}

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", (msg) => {
  if (msg.author.bot) return;
  if (msg.content === "$inspire") {
    getQuote().then((quote) => msg.channel.send(quote));
  }
  if (sadWords.some((word) => msg.content.includes(word))) {
    db.get("encouragements").then((encouragements) => {
      const encouragement =
        encouragements[Math.floor(Math.random() * encouragements.length)];
      msg.reply(encouragement);
    });
  }

  if (msg.content.startsWith("$new")) {
    encouragementMsg = msg.content.split("$new ")[1];
    addEncouragement(encouragementMsg);
    msg.channel.send("New encouragement message added.");
  }

  if (msg.content.startsWith("$del")) {
    index = msg.content.split("$new ")[1];
    deleteEncouragement(index);
    msg.channel.send("Delete encouragement message.");
  }

  if (msg.content.startsWith("$list")) {
    db.get("encouragements").then((encouragements) => {
      msg.channel.send(encouragements);
    });
  }
});

keepAlive();

client.login(dotenv.parsed.KEY);
