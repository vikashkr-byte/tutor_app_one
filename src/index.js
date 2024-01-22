import dotenv from "dotenv"
import connectToDB from "./db/db_connect.js"
import { app } from "./app.js"
dotenv.config({
    path: "./.env"
})
connectToDB()
    .then(() => {
        app.on("error", (error) => {
            console.log('error:', error)
            throw error
        })
        app.listen(process.env.PORT || 8000)
        console.log(`Serving at http://localhost:${process.env.PORT}`);
    })