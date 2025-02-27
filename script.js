async function rechercherPharmacies() {
    let adresse = document.getElementById("adresse").value;
    if (!adresse) {
        alert("Veuillez entrer une adresse valide.");
        return;
    }

    let response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(adresse)}`);
    let data = await response.json();
    if (data.length === 0) {
        alert("Adresse introuvable.");
        return;
    }

    let pharmacies = ["Pharmacie Centrale", "Pharmacie du Centre", "Pharmacie de la Gare"];
    let medicaments = [
        { nom: "Paracétamol", prix: 2.50 },
        { nom: "Ibuprofène", prix: 3.00 },
        { nom: "CBD", prix: 5.00 }
    ];

    let medContainer = document.getElementById("medicaments");
    medContainer.innerHTML = "<h3>Choisissez une pharmacie :</h3>";
    pharmacies.forEach((nom, index) => {
        medContainer.innerHTML += `<input type='radio' name='pharmacie' value='${index}' ${index === 0 ? "checked" : ""}> ${nom}<br>`;
    });

    medContainer.innerHTML += "<h3>Choisissez vos articles :</h3>";
    medicaments.forEach((med, index) => {
        medContainer.innerHTML += `<label>${med.nom} (${med.prix.toFixed(2)}€) <input type='number' min='0' value='0' id='med-${index}'></label><br>`;
    });

    medContainer.innerHTML += `
        <h3>Déposer vos documents :</h3>
        <label>Ordonnance : <input type='file' id='ordonnance'></label><br>
        <label>Carte Vitale : <input type='file' id='carteVitale'></label><br>
        <label>Mutuelle : <input type='file' id='mutuelle'></label><br>
        <button onclick='ouvrirPagePaiement()'>Procéder au paiement</button>
    `;
}

function ouvrirPagePaiement() {
    let nom = document.getElementById("nom").value;
    let prenom = document.getElementById("prenom").value;
    let adresse = document.getElementById("adresse").value;
    if (!nom || !prenom || !adresse) {
        alert("Veuillez renseigner toutes les informations.");
        return;
    }

    let pharmacieChoisie = document.querySelector("input[name='pharmacie']:checked").nextSibling.textContent.trim();
    let medicaments = [
        { nom: "Paracétamol", prix: 2.50 },
        { nom: "Ibuprofène", prix: 3.00 },
        { nom: "CBD", prix: 5.00 }
    ];
    let total = 5.00;
    let commande = medicaments.map((med, index) => {
        let quantite = parseInt(document.getElementById(`med-${index}`).value);
        return quantite > 0 ? { nom: med.nom, quantite, prix: med.prix * quantite } : null;
    }).filter(item => item);
    total += commande.reduce((sum, item) => sum + item.prix, 0);

    let documents = {
        ordonnance: document.getElementById("ordonnance").files[0]?.name || "Non fourni",
        carteVitale: document.getElementById("carteVitale").files[0]?.name || "Non fournie",
        mutuelle: document.getElementById("mutuelle").files[0]?.name || "Non fournie"
    };

    let recap = { nom, prenom, adresse, pharmacie: pharmacieChoisie, commande, total, documents };
    localStorage.setItem("recapCommande", JSON.stringify(recap));
    window.location.href = "paiement.html";
}
