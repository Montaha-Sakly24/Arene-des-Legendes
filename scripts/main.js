import { Game } from "./game.js";

document.addEventListener("DOMContentLoaded", () => {
  try {
    window.game = new Game();

    console.log("Arène des Légendes - Prêt à jouer !");

    if (!window.game.arena) {
      console.warn("L'arène n'a pas été correctement initialisée");
    }

    if (!window.game.ui) {
      console.warn(
        " L'interface utilisateur n'a pas été correctement initialisée"
      );
    }
  } catch (error) {
    console.error("Erreur lors de l'initialisation:", error);

    console.error("Détails de l'erreur:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    if (error instanceof ReferenceError) {
      console.error("Vérifiez l'importation et l'exportation de classes");
    }

    if (error instanceof TypeError) {
      console.error(
        "Vérifiez que les méthodes appelées existent et sont accessibles"
      );
    }

    const errorElement = document.createElement("div");
    errorElement.style.color = "red";
    errorElement.style.padding = "20px";
    errorElement.style.margin = "20px";
    errorElement.style.border = "1px solid red";
    errorElement.style.borderRadius = "5px";
    errorElement.style.backgroundColor = "#fff0f0";
    errorElement.innerHTML = `
            <h2>Erreur lors du chargement du jeu</h2>
            <p>${error.message}</p>
            <p>Veuillez vérifier la console pour plus de détails.</p>
        `;
    document.body.prepend(errorElement);
  }
});

window.restartGame = () => {
  console.log(" Redémarrage du jeu ");
  try {
    delete window.game;
    window.game = new Game();
    const errorElements = document.querySelectorAll(
      'div[style*="border: 1px solid red"]'
    );
    errorElements.forEach((el) => el.remove());

    return true;
  } catch (error) {
    console.error("Erreur lors du redémarrage:", error);
    return false;
  }
};

window.gameStatus = () => {
  if (!window.game) {
    console.error("Aucune instance de jeu trouvée");
    return;
  }

  console.log("État actuel du jeu:");
  console.log(`État: ${window.game.gameState}`);
  console.log(`Tour: ${window.game.roundNumber}`);
  console.log(
    `Joueur actuel: ${window.game.getCurrentPlayer()?.name || "Aucun"}`
  );

  console.log("Joueurs:");
  window.game.players.forEach((player, index) => {
    console.log(
      `${index + 1}. ${player.name} (${player.heroType}) - PV: ${player.hp} - ${
        player.isAlive() ? "Vivant" : " Mort"
      }`
    );
  });

  return {
    state: window.game.gameState,
    round: window.game.roundNumber,
    currentPlayer: window.game.getCurrentPlayer(),
    players: window.game.players,
  };
};
