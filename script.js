document.addEventListener('DOMContentLoaded', () => {
    const schedaForm = document.getElementById('schedaForm');
    const exportCSV = document.getElementById('exportCSV');
    const exportJSON = document.getElementById('exportJSON');
    const importJSON = document.getElementById('importJSON');
    const stampaLista = document.getElementById('stampaLista');
    const tableBody = document.getElementById('schedaTable').getElementsByTagName('tbody')[0];
    const jsonViewer = document.getElementById('jsonViewer');
    const jsonContent = document.getElementById('jsonContent');
    const closeJsonViewer = document.getElementById('closeJsonViewer');

    // Carica i dati salvati al caricamento della pagina
    loadSchede();

    // Aggiungi una nuova scheda
    schedaForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const marca = document.getElementById('marca').value;
        const tipoScheda = document.getElementById('tipoScheda').value;
        const pollici = document.getElementById('pollici').value;
        const quantita = document.getElementById('quantita').value;
        const posizione = document.getElementById('posizione').value;

        if (marca && tipoScheda && pollici && quantita && posizione) {
            const scheda = { marca, tipoScheda, pollici, quantita, posizione, id: Date.now() };
            addRowToTable(scheda);
            saveDataToLocalStorage();
            schedaForm.reset();
        }
    });

    // Esporta in CSV
    exportCSV.addEventListener('click', () => {
        const rows = tableBody.querySelectorAll('tr');
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Marca TV,Tipo di Scheda,Pollici TV,Quantità,Posizione\n"; // Intestazione

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            const marca = cells[0].textContent;
            const tipoScheda = cells[1].textContent;
            const pollici = cells[2].textContent;
            const quantita = cells[3].textContent;
            const posizione = cells[4].textContent;
            csvContent += `${marca},${tipoScheda},${pollici},${quantita},${posizione}\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'schede_tv.csv');
        document.body.appendChild(link);
        link.click();
    });

    // Esporta in JSON
    exportJSON.addEventListener('click', () => {
        const schede = JSON.parse(localStorage.getItem('schedeTV')) || [];
        const jsonContentString = JSON.stringify(schede, null, 2);

        if (/Android/i.test(navigator.userAgent)) {
            // Su Android: mostra i dati JSON in una finestra di testo
            jsonContent.value = jsonContentString;
            jsonViewer.classList.remove('hidden');
        } else {
            // Su desktop: scarica il file JSON
            const blob = new Blob([jsonContentString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = 'schede_tv.json';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    });

    // Chiudi la finestra di testo JSON
    closeJsonViewer.addEventListener('click', () => {
        jsonViewer.classList.add('hidden');
    });

    // Importa da JSON
    importJSON.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();

            reader.onload = (event) => {
                const schede = JSON.parse(event.target.result);
                localStorage.setItem('schedeTV', JSON.stringify(schede));
                tableBody.innerHTML = ''; // Svuota la tabella
                schede.forEach(scheda => addRowToTable(scheda));
                alert('Dati importati con successo!');
            };

            reader.readAsText(file);
        };

        input.click();
    });

    // Stampa la lista
    stampaLista.addEventListener('click', () => {
        window.print();
    });

    // Modifica o elimina una scheda
    tableBody.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('edit')) {
            editRow(target);
        } else if (target.classList.contains('delete')) {
            deleteRow(target);
        }
    });

    // Funzioni di supporto
    function addRowToTable(scheda) {
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${scheda.marca}</td>
            <td>${scheda.tipoScheda}</td>
            <td>${scheda.pollici}</td>
            <td>${scheda.quantita}</td>
            <td>${scheda.posizione}</td>
            <td class="actions">
                <button class="edit" data-id="${scheda.id}">Modifica</button>
                <button class="delete" data-id="${scheda.id}">Elimina</button>
            </td>
        `;
        tableBody.appendChild(newRow);
    }

    function editRow(button) {
        const row = button.closest('tr');
        const cells = row.querySelectorAll('td');
        const marca = cells[0].textContent;
        const tipoScheda = cells[1].textContent;
        const pollici = cells[2].textContent;
        const quantita = cells[3].textContent;
        const posizione = cells[4].textContent;

        document.getElementById('marca').value = marca;
        document.getElementById('tipoScheda').value = tipoScheda;
        document.getElementById('pollici').value = pollici;
        document.getElementById('quantita').value = quantita;
        document.getElementById('posizione').value = posizione;

        row.remove();
        saveDataToLocalStorage();
    }

    function deleteRow(button) {
        if (confirm('Sei sicuro di voler eliminare questa scheda?')) {
            const row = button.closest('tr');
            row.remove();
            saveDataToLocalStorage();
        }
    }

    function saveDataToLocalStorage() {
        const rows = tableBody.querySelectorAll('tr');
        const schede = [];
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            schede.push({
                marca: cells[0].textContent,
                tipoScheda: cells[1].textContent,
                pollici: cells[2].textContent,
                quantita: cells[3].textContent,
                posizione: cells[4].textContent,
                id: row.querySelector('.edit').dataset.id
            });
        });
        localStorage.setItem('schedeTV', JSON.stringify(schede));
    }

    function loadSchede() {
        const schede = JSON.parse(localStorage.getItem('schedeTV')) || [];
        schede.forEach(scheda => addRowToTable(scheda));
    }
});