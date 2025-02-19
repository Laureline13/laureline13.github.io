async function rechercherPharmacies() {
    let adresse = document.getElementById("adresse").value;
    if (!adresse) {
        alert("Veuillez entrer une adresse valide.");
        return;
    }

    // Obtenir les coordonnées GPS de l'adresse via Nominatim API
    let response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(adresse)}`);
    let data = await response.json();
    if (data.length === 0) {
        alert("Adresse introuvable.");
        return;
    }
    let { lat, lon } = data[0];

    // Liste de pharmacies fictives avec coordonnées GPS
    let pharmacies = [
        { nom: "Pharmacie Centrale", lat: 48.8566, lon: 2.3522 },
        { nom: "Pharmacie du Centre", lat: 48.8575, lon: 2.3515 },
        { nom: "Pharmacie de la Gare", lat: 48.8580, lon: 2.3500 }
    ];

    let medContainer = document.getElementById("medicaments");
    medContainer.innerHTML = "<h3>Choisissez une pharmacie :</h3>";
    pharmacies.forEach((pharmacie, index) => {
        let radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "pharmacie";
        radio.value = index;
        if (index === 0) radio.checked = true;
        let label = document.createElement("label");
        label.textContent = pharmacie.nom;
        medContainer.appendChild(radio);
        medContainer.appendChild(label);
        medContainer.appendChild(document.createElement("br"));
    });

    let medicaments = [
        { nom: "Paracétamol", prix: 2.50 },
        { nom: "Ibuprofène", prix: 3.00 },
        { nom: "CBD", prix: 5.00 }
    ];

    medContainer.innerHTML += "<h3>Choisissez vos articles :</h3>";
    medicaments.forEach((med, index) => {
        let label = document.createElement("label");
        label.textContent = `${med.nom} (${med.prix.toFixed(2)}€)`;
        let input = document.createElement("input");
        input.type = "number";
        input.min = 0;
        input.value = 0;
        input.id = `med-${index}`;
        medContainer.appendChild(label);
        medContainer.appendChild(input);
        medContainer.appendChild(document.createElement("br"));
    });

    // Ajout du téléchargement de documents (ordonnance, carte vitale, mutuelle)
    let uploadDiv = document.createElement("div");
    uploadDiv.innerHTML = `
        <h3>Déposer vos documents :</h3>
        <label>Ordonnance : <input type="file" id="ordonnance"></label><br>
        <label>Carte Vitale : <input type="file" id="carteVitale"></label><br>
        <label>Mutuelle : <input type="file" id="mutuelle"></label><br>
    `;
    medContainer.appendChild(uploadDiv);
    
    let boutonPaiement = document.createElement("button");
    boutonPaiement.textContent = "Procéder au paiement";
    boutonPaiement.onclick = ouvrirPagePaiement;
    medContainer.appendChild(boutonPaiement);
}

function sauvegarderCommande() {
    let commandes = JSON.parse(localStorage.getItem("commandes")) || [];
    let recap = JSON.parse(localStorage.getItem("recapCommande"));

    if (!recap) return;

    commandes.push(recap);
    localStorage.setItem("commandes", JSON.stringify(commandes));

    // Télécharger un fichier JSON avec les commandes
    let blob = new Blob([JSON.stringify(commandes, null, 2)], { type: "application/json" });
    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "commandes.json";
    a.click();
}

function ouvrirPagePaiement() {
    let nom = document.getElementById("nom").value;
    let prenom = document.getElementById("prenom").value;
    let adresse = document.getElementById("adresse").value;
    
    if (!nom || !prenom || !adresse) {
        alert("Veuillez renseigner votre nom, prénom et adresse de livraison.");
        return;
    }

    let pharmacieIndex = document.querySelector("input[name='pharmacie']:checked").value;
    let pharmacies = ["Pharmacie Centrale", "Pharmacie du Centre", "Pharmacie de la Gare"];
    let pharmacieChoisie = pharmacies[pharmacieIndex];

    let medicaments = [
        { nom: "Paracétamol", prix: 2.50 },
        { nom: "Ibuprofène", prix: 3.00 },
        { nom: "CBD", prix: 5.00 }
    ];
    
    let total = 5.00; // Frais de livraison
    let commande = [];

    medicaments.forEach((med, index) => {
        let quantite = parseInt(document.getElementById(`med-${index}`).value);
        if (quantite > 0) {
            commande.push({ nom: med.nom, quantite, prix: med.prix * quantite });
            total += med.prix * quantite;
        }
    });
    
    let ordonnanceFile = document.getElementById("ordonnance").files[0];
    let carteVitaleFile = document.getElementById("carteVitale").files[0];
    let mutuelleFile = document.getElementById("mutuelle").files[0];
    
    let documents = {};

    function sauvegardeFinale() {
        let recap = { nom, prenom, adresse, pharmacie: pharmacieChoisie, commande, total, documents };
        let commandes = JSON.parse(localStorage.getItem("commandes")) || [];
        commandes.push(recap);
        localStorage.setItem("recapCommande", JSON.stringify(recap));
        
        window.location.href = "paiement.html";
    }

    async function traiterDocuments() {
        if (ordonnanceFile) {
            documents.ordonnance = await envoyerFichierAuServeur(ordonnanceFile);
        }
        if (carteVitaleFile) {
            documents.carteVitale = await envoyerFichierAuServeur(carteVitaleFile);
        }
        if (mutuelleFile) {
            documents.mutuelle = await envoyerFichierAuServeur(mutuelleFile);
        }
        sauvegardeFinale();
    }

    // Lancer le traitement des fichiers
    traiterDocuments();

    let fichiersCharge = 0;
    let totalFichiers = [ordonnanceFile, carteVitaleFile, mutuelleFile].filter(f => f).length;

    function fichierTermine() {
        fichiersCharge++;
        if (fichiersCharge === totalFichiers) {
            sauvegardeFinale();
        }
    }

    if (ordonnanceFile) {
        lireFichierBase64(ordonnanceFile, (base64) => {
            documents.ordonnance = base64;
            fichierTermine();
        });
    }

    if (carteVitaleFile) {
        lireFichierBase64(carteVitaleFile, (base64) => {
            documents.carteVitale = base64;
            fichierTermine();
        });
    }

    if (mutuelleFile) {
        lireFichierBase64(mutuelleFile, (base64) => {
            documents.mutuelle = base64;
            fichierTermine();
        });
    }

    if (totalFichiers === 0) {
        sauvegardeFinale();
    }
    localStorage.setItem("recapCommande", JSON.stringify(recap));
    window.location.href = "paiement.html";
}

async function envoyerFichierAuServeur(file) {
    let formData = new FormData();
    formData.append("file", file);

    let response = await fetch("http://localhost:3000/upload", {
        method: "POST",
        body: formData
    });

    let data = await response.json();
    return data.path; // Retourne le chemin du fichier stocké
};
