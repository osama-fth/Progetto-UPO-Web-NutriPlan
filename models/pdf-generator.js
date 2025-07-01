'use strict';

function generaPianoPDF(doc, piano) {
  try {
    doc.fontSize(20).font('Helvetica-Bold').text('NutriPlan', { align: 'center' });
    doc.moveDown();

    doc.fontSize(16).font('Helvetica-Bold')
      .text(`Piano Alimentare: ${piano.titolo || 'Senza titolo'}`, { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).font('Helvetica')
      .text(`Data creazione: ${new Date(piano.data_creazione).toLocaleDateString('it-IT')}`)
      .text(piano.descrizione || 'Nessuna descrizione disponibile')
      .moveDown();

    let contenuto = piano.contenuto;
    if (typeof contenuto === 'string') {
      try {
        contenuto = JSON.parse(contenuto);
      } catch (err) {
        console.error('Errore parsing contenuto:', err);
        contenuto = {};
      }
    }

    const giorni = ['lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato', 'domenica'];

    giorni.forEach(giorno => {
      if (contenuto[giorno]) {
        doc.fontSize(14).font('Helvetica-Bold')
          .text(giorno.toUpperCase())
          .moveDown(0.5);

        ['colazione', 'pranzo', 'cena'].forEach(pasto => {
          if (contenuto[giorno][pasto]) {
            doc.fontSize(12).font('Helvetica-Bold')
              .text(`${pasto.toUpperCase()}:`)
              .font('Helvetica')
              .text(contenuto[giorno][pasto] || 'Non specificato')
              .moveDown(0.5);
          }
        });

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
