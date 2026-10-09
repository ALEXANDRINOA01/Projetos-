/* Ponto de entrada: inicializa cada modulo e faz a primeira renderizacao. */

document.addEventListener('DOMContentLoaded', () => {
  initDashboard();
  initDesigns();
  initLetters();
  initDocuments();

  updateLetter();
  draw();
  renderLetterLists();
});
