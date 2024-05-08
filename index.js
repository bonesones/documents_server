const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors")
const authRouter = require('./router/authRouter')
const PORT = process?.env?.PORT || 5000

const app = express();

app.use(express.json())
app.use(cors())
app.use('/auth', authRouter)


const start = async () => {
    try {
        await  mongoose.connect('mongodb+srv://frolov2004dima:Skty8RSZEqeT4blI@cluster0.ee5ou3o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')

        app.listen(PORT, () => console.log("Server has been started on PORT", PORT ))
    
    } catch (e) {
        console.log(e)
    }
}

start()

export default app