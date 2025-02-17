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
