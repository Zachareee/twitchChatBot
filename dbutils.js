import Database from "@replit/database"
import fetch from "node-fetch" 

const db = new Database()

export async function addLink(link) {
  return db.get("link").then(arr => {
    if (!arr) {
      arr = [link]
      db.set("link", arr)
      return 1
    }

    const len = arr.unshift(link)
    db.set("link", arr)
    return len
  })
}

export async function getLink() {
  return db.get("link").then(arr => {
    if (!arr || arr.length == 0) {
      DM("Please refill links")
      return null
    }

    const link = arr.pop()
    db.set("link",arr)
    return link
  })
}

export async function DM(message) {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bot ${process.env.DISC_TOKEN}`
  }
  fetch("https://discord.com/api/v10/users/@me/channels", {
    method: "POST",
    headers: headers,
    body: JSON.stringify({recipient_id: process.env.DISC_ID})
  }).then(async result => {
    const { id } = await result.json()
    fetch(`https://discord.com/api/v10/channels/${id}/messages`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({content: message})
    })
  })
}