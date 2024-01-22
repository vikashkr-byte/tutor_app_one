import dotenv from "dotenv"
import connectToDB from "./db/db_connect.js"
import { app } from "./app.js"
dotenv.config({
    path: "./.env"
})

const PORT = process.env.PORT || 8000
connectToDB()
    .then(() => {
        app.on("error", (error) => {
            console.log('error:', error)
            throw error
        })
        app.listen(PORT)
        console.log(`Serving at http://localhost:${PORT}`);
    })