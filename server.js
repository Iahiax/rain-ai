import express from "express";
import { exec } from "child_process";

const app = express();
app.use(express.json());

// حماية بسيطة عبر مفتاح API
const API_KEY = process.env.API_KEY || "mysecret";

app.post("/run", (req, res) => {
    if (req.headers["x-api-key"] !== API_KEY) {
        return res.status(403).json({ ok: false, error: "Invalid API key" });
    }

    const cmd = req.body.cmd;

    exec(cmd, (error, stdout, stderr) => {
        res.json({
            ok: !error,
            output: stdout || stderr,
        });
    });
});

app.listen(3000, () => console.log("Command API ready"));
