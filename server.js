import express from "express"
import mongoose from "mongoose"
import dotenv from "dotenv"

import offerRoutes from "./routes/offer.js";
import leadRoutes from "./routes/leads.js";
import scoreRoutes from "./routes/score.js";

dotenv.config();
const app = express();
app.use(express.json());



const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGODB_URI;


mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log(`MongoDB connected`))
.catch(err => console.error(err));
 
// Routes
app.use('/offer', offerRoutes)
app.use('/leads', leadRoutes)
app.use('/score', scoreRoutes)


 app.listen(PORT, ()=>{
    console.log(`Server is Running ${PORT}`)
 })