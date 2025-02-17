const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

// Configuration de Multer pour stocker les fichiers
const stockage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/"); // Dossier où stocker les fichiers
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname); // Nom unique
    }
});
const upload = multer({ storage: stockage });

app.post("/upload", upload.single("file"), (req, res) => {
    res.json({ filename: req.file.filename, path: "/uploads/" + req.file.filename });
});

app.listen(3000, () => console.log("Serveur démarré sur http://localhost:3000"));
const path = require("path");

// Servir le dossier "uploads"
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Obtenir la liste des fichiers stockés
app.get("/fichiers", (req, res) => {
    fs.readdir("uploads/", (err, files) => {
        if (err) return res.status(500).json({ error: "Erreur lors de la lecture des fichiers" });
        res.json(files.map(file => ({ name: file, url: `/uploads/${file}` })));
    });
});
