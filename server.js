import express from "express";
import fs from "fs";
import { exec } from "child_process";
import https from "https";

const app = express();
app.use(express.json());

const API_KEY = process.env.API_KEY || "mysecret";

function auth(req, res) {
  if (req.headers["x-api-key"] !== API_KEY) {
    res.status(403).json({ ok: false, error: "Invalid API key" });
    return false;
  }
  return true;
}

// تنفيذ أوامر شِل عامة
app.post("/run", (req, res) => {
  if (!auth(req, res)) return;
  exec(req.body.cmd, (error, stdout, stderr) => {
    res.json({ ok: !error, output: stdout || stderr });
  });
});

// إدارة الملفات
app.post("/file/create", (req, res) => {
  if (!auth(req, res)) return;
  fs.writeFileSync(req.body.path, req.body.content || "");
  res.json({ ok: true });
});

app.post("/file/delete", (req, res) => {
  if (!auth(req, res)) return;
  fs.unlinkSync(req.body.path);
  res.json({ ok: true });
});

app.post("/file/read", (req, res) => {
  if (!auth(req, res)) return;
  const content = fs.readFileSync(req.body.path, "utf8");
  res.json({ ok: true, content });
});

app.post("/file/write", (req, res) => {
  if (!auth(req, res)) return;
  fs.writeFileSync(req.body.path, req.body.content);
  res.json({ ok: true });
});

app.post("/file/copy", (req, res) => {
  if (!auth(req, res)) return;
  fs.copyFileSync(req.body.from, req.body.to);
  res.json({ ok: true });
});

app.post("/file/move", (req, res) => {
  if (!auth(req, res)) return;
  fs.renameSync(req.body.from, req.body.to);
  res.json({ ok: true });
});

// تنزيل ملف خارجي (أداة، سكربت، إلخ)
app.post("/file/download", (req, res) => {
  if (!auth(req, res)) return;

  const url = req.body.url;
  const dest = req.body.path;

  const file = fs.createWriteStream(dest);
  https.get(url, response => {
    response.pipe(file);
    file.on("finish", () => {
      file.close(() => res.json({ ok: true }));
    });
  }).on("error", err => {
    fs.unlink(dest, () => {});
    res.json({ ok: false, error: err.message });
  });
});

app.listen(3000, () => console.log("Full Command+File+Download API ready"));
