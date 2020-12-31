import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import Pusher from "pusher";
import Messages from "./dbMessages.js";


//app config
const app = express();
const port = process.env.PORT || 9000;

const connectUrl = "mongodb+srv://admin:hwUL4ez2CGrPMGQc@cluster0.bifte.mongodb.net/whtsappdb?retryWrites=true&w=majority";
mongoose.connect(connectUrl, {
    useCreateIndex: true,
    useNewUrlParser :true,
    useUnifiedTopology :true
})

const db = mongoose.connection;
db.once("open", () => {
    console.log("DB connected");

    const msgCollection = db.collection("messagecontents");
    const changeStream = msgCollection.watch();

    changeStream.on("change", (change) => {

        if(change.operationType === "insert"){
            const messageDetails = change.fullDocument;
            pusher.trigger("messages", "inserted", {
                name : messageDetails.name,
                message : messageDetails.message,
                timestamp : messageDetails.timestamp,
                received : messageDetails.received
            });
        }else{
            console.log("Error Triggering Pusher")
        }
    });
    
});

const pusher = new Pusher({
    appId: "1130788",
    key: "c64290f451c65bb943ba",
    secret: "1e4572fe26bab7013b14",
    cluster: "eu",
    useTLS: true
  });

  //middleware
  app.use(express.json());
  app.use(cors());

//api routes
app.get("/", (req, res) => {
    res.status(200).send("Aye");
});

app.get("/messages/sync", (req, res) => {
    Messages.find((err, data) =>{
        if(err){
            res.status(500).send(err);
        }else{
            res.status(200).send(data)
        }
    })
})

app.post("/messages/new", (req, res) => {
    const dbMessage = req.body;

    Messages.create(dbMessage, (err, data) =>{
        if(err){
            res.status(500).send(err);
        }else{
            res.status(201).send(`${data}`);
        }
    })
})


app.listen(port, () => {
    console.log(`Listening on localhost:${port}`);
});