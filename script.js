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

    let documents = {
        ordonnance: document.getElementById("ordonnance").files.length > 0 ? document.getElementById("ordonnance").files[0].name : "Non fournie",
        carteVitale: document.getElementById("carteVitale").files.length > 0 ? document.getElementById("carteVitale").files[0].name : "Non fournie",
        mutuelle: document.getElementById("mutuelle").files.length > 0 ? document.getElementById("mutuelle").files[0].name : "Non fournie"
    };

    localStorage.setItem("recapCommande", JSON.stringify({ 
        nom, prenom, adresse, pharmacie: pharmacieChoisie, commande, total, documents 
    }));

    window.location.href = "paiement.html";

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

// Appelle cette fonction après avoir sauvegardé la commande
ouvrirPagePaiement = () => {
    // Code existant...
    localStorage.setItem("recapCommande", JSON.stringify({ 
        nom, prenom, adresse, pharmacie: pharmacieChoisie, commande, total, documents 
    }));

    sauvegarderCommande(); // Enregistre la commande dans un fichier JSON
    window.location.href = "paiement.html";
};

}
