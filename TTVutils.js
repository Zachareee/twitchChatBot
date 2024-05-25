import Database from "@replit/database"
import { DM } from "./dbutils.js"
import fetch from "node-fetch"

const db = new Database()

export async function use_code(code) {
  const body = `client_id=${process.env.ID}&` +
    `client_secret=${process.env.secret}&` +
    `code=${code}&` +
    `grant_type=authorization_code&` +
    `redirect_uri=https://twitchBot.zachareee1.repl.co/authorised`
  return fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: body
  }).then(async result => {
    const obj = await result.json()
    saveToken(obj)
    return obj.access_token
  })
}

function saveToken(data) {
  const { access_token: access = null,
         refresh_token: refresh = null
        } = data
  db.set("token", access)
  db.set("refresh", refresh)
}

export async function tokenEval() {
  return db.get("token").then(token => {
    return fetch("https://id.twitch.tv/oauth2/validate", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(async result => {
      console.log(`tokenEval(): ${JSON.stringify(await result.json())}`)
      if (result.status == 200) {
        return token
      }

      return await refreshToken()
    })
  })
}

async function refreshToken() {
  return db.get("refresh").then(refresh => {
    const body = `grant_type=refresh_token&` +
    `refresh_token=${refresh}&` +
    `client_id=${process.env.ID}&` +
    `client_secret=${process.env.secret}`

    return fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: body
    }).then(async result => {
      if (result.status == 400) {
        db.delete("refresh")
        DM("Refresh access token")
        return null
      }

      const obj = await result.json()
      saveToken(obj)
      return obj.access_token
    })
  })
}