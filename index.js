import express from "express"
import { use_code, tokenEval } from "./TTVutils.js"
import { init } from "./tmiClient.js"
import { createHmac, timingSafeEqual } from "crypto"
import { addLink } from "./dbutils.js"

const PORT = process.env.port || 3000
const app = express()
const path = process.cwd()

var client = null

app.use(express.json({ verify: verifySignature() }))

app.get("/", async (req, res) => {
  console.log("Pinged")
  if (!client) {
    const token = await tokenEval()
    if(token) {
      client = await init(token)
    }
  }
  res.sendFile(path + "/index.html")
})

app.get("/authorised", async (req, res) => {
  const { code } = req.query

  if (client) client.disconnect()
  client = init(await use_code(code))
  res.send("You have been authorised")
})

app.post("/link", async (req, res) => {
  const { link } = req.body

  res.send(`${await addLink(link)} links currently stored`)
})

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})

function verifySignature() {
  return (req, res, buffer, encoding) => {
    const header = req.header("SHA1-Signature")
    const sigBuffer = Buffer.from(header, "hex")
    const hash = createHmac("sha1", process.env.hmac).update(buffer).digest()
    try {
      if (!timingSafeEqual(hash, sigBuffer)) {
        throw new Error("Bad request signature")
      }
    } catch (err) {
      console.error(err)
      console.log(`Hash: ${hash.toString("hex")}, signature: ${header}`)
      return res.status(401).send("Bad request signature")
    }
  }
}