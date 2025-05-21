'use strict';

function generaPianoPDF(doc, piano) {
  try {
    doc.fontSize(16).text(`Piano Alimentare: ${piano.titolo || 'Senza titolo'}`, {
      align: 'center'
    });
    doc.moveDown();

    doc.fontSize(12)
      .text(`Data creazione: ${piano.data_creazione}`)
      .text(piano.descrizione || null)
      .moveDown();

    let pianoData;
    try {
      pianoData = typeof piano.contenuto === 'string' ?
        JSON.parse(piano.contenuto) : piano.contenuto;
    } catch (error) {
      console.error('Errore nel parsing del contenuto del piano:', error);
      pianoData = {};
    }

    const giorni = ['lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato', 'domenica'];

    function renderPasto(pasto, label) {
      if (!pasto) return;

      doc.text(`${label.toUpperCase()}:`);

      if (Array.isArray(pasto)) {
        pasto.forEach(alimento => {
          doc.text(`- ${alimento}`);
        });
      } else if (typeof pasto === 'string' && pasto.trim() !== '') {
        doc.text(`- ${pasto}`);
      } else {
        doc.text('- Non specificato');
      }

      doc.moveDown(0.5);
    }

    giorni.forEach(giorno => {
      if (pianoData[giorno]) {
        doc.fontSize(12).text(giorno.toUpperCase());
        doc.moveDown(0.5);

        renderPasto(pianoData[giorno].colazione, 'Colazione');
        renderPasto(pianoData[giorno].pranzo, 'Pranzo');
        renderPasto(pianoData[giorno].cena, 'Cena');
        renderPasto(pianoData[giorno].spuntini, 'Spuntini');

        doc.moveDown();
      }
    });

    return true;
  } catch (error) {
    console.error('Errore durante la generazione del PDF:', error);
    return false;
  }
}

module.exports = { generaPianoPDF };
