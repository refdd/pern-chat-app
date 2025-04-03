import express from 'express';
import authRoutes from "../src/routes/auth.route.js";
import messageRoutes from "../src/routes/message.route.js";
import dotenv from "dotenv";
const app = express();
app.use(express.json()); // for parsing application json
dotenv.config();
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
