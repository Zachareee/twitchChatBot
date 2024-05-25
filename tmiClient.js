import { Client } from "tmi.js"
import fetch from "node-fetch"
import { getLink } from "./dbutils.js"

const used = {
  join: 0,
}

const CD = {
  join: 10000,
}

export async function init(code) {
  const client = Client({
    options: { debug: true },
    identity: {
      username: 'notredynot',
      password: `oauth:${code}`
    },
    channels: ['redynotredy']
  })

  client.connect()

  client.on("message", async (channel, tags, message, self) => {
    if (self) return

    console.log(tags)
    const { username, "display-name": displayName } = tags
    message = message.toLowerCase().trim()
    if (message === '$join') {
      if (Date.now() - used["join"] <= CD.join) return console.log("$join skipped")

      used["join"] = Date.now()
      const link = await getLink()
      console.log(link)
      if (!link) {
        return client.say(channel, `@${username} there are no links available currently`)
      }

      fetch(`https://api.twitch.tv/helix/whispers?from_user_id=551022705&to_user_id=${tags["user-id"]}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${code}`,
          "Client-Id": process.env.ID,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "message": link
        })
      }).then(async result => {
        if (!result.ok) {
          console.log(await result.json())
          client.say(channel, `@${username} Something went wrong, we'll get back to you shortly`)
        } else {
          client.say(channel, `@${username} I've sent you the invite link, check your whispers!`)
        }
      })
    }
  })

  return client
}