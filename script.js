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

    medC
