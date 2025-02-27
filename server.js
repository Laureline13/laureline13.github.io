const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const upload = multer({ storage: multer.diskStorage({
    destination: (_, __, cb) => cb(null, "uploads/"),
    filename: (_, file, cb) => cb(null, Date.now() + "-" + file.originalname)
}) });

app.post("/upload", upload.single("file"), (req, res) => {
    res.json({ filename: req.file.filename, path: "/uploads/" + req.file.filename });
});

app.get("/fichiers", (_, res) => {
    fs.readdir("uploads/", (err, files) => {
        if (err) return res.status(500).json({ error: "Erreur lors de la lecture des fichiers" });
        res.json(files.map(file => ({ name: file, url: `/uploads/${file}` })));
    });
});

app.listen(3000, () => console.log("Serveur démarré sur http://localhost:3000"));
