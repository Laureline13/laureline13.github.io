async function rechercherPharmacies() {
    let adresse = document.getElementById("adresse").value;
    if (!adresse) return alert("Veuillez entrer une adresse valide.");

    // Récupération des coordonnées GPS
    let response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(adresse)}`);
    let data = await response.json();
    if (data.length === 0) return alert("Adresse introuvable.");

    let pharmacies = [
        { nom: "Pharmacie Centrale", lat: 48.8566, lon: 2.3522 },
        { nom: "Pharmacie du Centre", lat: 48.8575, lon: 2.3515 },
        { nom: "Pharmacie de la Gare", lat: 48.8580, lon: 2.3500 }
    ];

    let medicaments = [
        { nom: "Paracétamol", prix: 2.50 },
        { nom: "Ibuprofène", prix: 3.00 },
        { nom: "CBD", prix: 5.00 }
    ];

    let medContainer = document.getElementById("medicaments");
    medContainer.innerHTML = `
        <h3>Choisissez une pharmacie :</h3>
        ${pharmacies.map((p, i) => `<input type="radio" name="pharmacie" value="${i}" ${i === 0 ? "checked" : ""}> ${p.nom}<br>`).join("")}
        <h3>Choisissez vos articles :</h3>
        ${medicaments.map((m, i) => `<label>${m.nom} (${m.prix.toFixed(2)}€) <input type="number" id="med-${i}" min="0" value="0"></label><br>`).join("")}
        <h3>Déposer vos documents :</h3>
        <label>Ordonnance : <input type="file" id="ordonnance"></label><br>
        <label>Carte Vitale : <input type="file" id="carteVitale"></label><br>
        <label>Mutuelle : <input type="file" id="mutuelle"></label><br>
        <button onclick="ouvrirPagePaiement()">Procéder au paiement</button>
    `;
}

async function ouvrirPagePaiement() {
    let nom = document.getElementById("nom").value;
    let prenom = document.getElementById("prenom").value;
    let adresse = document.getElementById("adresse").value;

    if (!nom || !prenom || !adresse) return alert("Veuillez renseigner toutes les informations.");

    let pharmacieIndex = document.querySelector("input[name='pharmacie']:checked").value;
    let pharmacies = ["Pharmacie Centrale", "Pharmacie du Centre", "Pharmacie de la Gare"];
    let pharmacieChoisie = pharmacies[pharmacieIndex];

    let medicaments = [
        { nom: "Paracétamol", prix: 2.50 },
        { nom: "Ibuprofène", prix: 3.00 },
        { nom: "CBD", prix: 5.00 }
    ];

    let commande = medicaments
        .map((med, index) => ({ nom: med.nom, quantite: +document.getElementById(`med-${index}`).value, prix: med.prix }))
        .filter(med => med.quantite > 0)
        .map(med => ({ ...med, prix: med.prix * med.quantite }));

    let total = 5.00 + commande.reduce((acc, med) => acc + med.prix, 0);

    let recap = { nom, prenom, adresse, pharmacie: pharmacieChoisie, commande, total };
    localStorage.setItem("recapCommande", JSON.stringify(recap));

    window.location.href = "paiement.html";
}
