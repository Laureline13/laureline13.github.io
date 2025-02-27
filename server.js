const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const stockage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({
    storage: stockage,
    fileFilter: (req, file, cb) => {
        let types = ["image/png", "image/jpeg", "application/pdf"];
        if (types.includes(file.mimetype)) cb(null, true);
        else cb(new Error("Format de fichier non autorisé"));
    }
});

app.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "Aucun fichier reçu" });
    res.json({ filename: req.file.filename, path: "/uploads/" + req.file.filename });
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.listen(3000, () => console.log("Serveur démarré sur http://localhost:3000"));
