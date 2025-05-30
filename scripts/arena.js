class Arena {
  constructor() {
    this.size = 7;
    this.grid = this.createGrid();
    this.players = [];
  }

  createGrid() {
    const grid = [];
    for (let row = 0; row < this.size; row++) {
      grid[row] = [];
      for (let col = 0; col < this.size; col++) {
        grid[row][col] = {
          row: row,
          col: col,
          player: null,
          type: "empty",
        };
      }
    }
    return grid;
  }

  addPlayer(player, row, col) {
    if (this.isValidPosition(row, col) && !this.grid[row][col].player) {
      this.grid[row][col].player = player;
      player.position = { row, col };
      this.players.push(player);
      return true;
    }
    return false;
  }

  movePlayer(player, newRow, newCol) {
    console.log(
      `Tentative de déplacement: ${player.name} de (${player.position.row}, ${player.position.col}) vers (${newRow}, ${newCol})`
    );

    // Vérification que ce n'est pas la même position
    if (player.position.row === newRow && player.position.col === newCol) {
      console.log(" Impossible de se déplacer vers sa propre position");
      return false;
    }

    // Vérification de base
    if (
      !this.isValidPosition(newRow, newCol) ||
      this.grid[newRow][newCol].player
    ) {
      console.log("Position invalide ou occupée");
      return false;
    }

    // Vérification que le mouvement respecte les règles du héros
    if (!this.isValidMoveForPlayer(player, newRow, newCol)) {
      console.log(
        `Mvmt invalide pour ${player.heroType}: ne respecte les règles `
      );
      return false;
    }

    const oldPos = player.position;
    this.grid[oldPos.row][oldPos.col].player = null;

    this.grid[newRow][newCol].player = player;
    player.position = { row: newRow, col: newCol };

    console.log(
      `${player.name} s'est déplacé de (${oldPos.row}, ${oldPos.col}) vers (${newRow}, ${newCol})`
    );
    return true;
  }

  // Fonction pour obtenir la distance de déplacement selon le type de héros
  getDistanceDeplacement(heroType) {
    if (heroType === "ninja") return 2;
    return 1; // Chevalier et Sorcier
  }

  // Méthode pour valider si un mouvement respecte les règles du héros
  isValidMoveForPlayer(player, newRow, newCol) {
    const { row, col } = player.position;
    const deltaRow = newRow - row;
    const deltaCol = newCol - col;
    const absDeltaRow = Math.abs(deltaRow);
    const absDeltaCol = Math.abs(deltaCol);

    console.log(
      `Validation mouvement ${player.heroType}: deltaRow=${deltaRow}, deltaCol=${deltaCol}`
    );

    // RÈGLE 1:mouvement en diagonale non autorisé
    if (deltaRow !== 0 && deltaCol !== 0) {
      console.log("INTERDIT: Mouvement en diagonale détecté");
      return false;
    }

    // RÈGLE 2: Le mouvement doit être dans une seule direction cardinale
    if (deltaRow === 0 && deltaCol === 0) {
      console.log("INTERDIT: Aucun mouvement détecté");
      return false;
    }

    // RÈGLE 3: Le mouvement doit être dans UNE SEULE direction
    if (absDeltaRow > 0 && absDeltaCol > 0) {
      console.log("INTERDIT: Mouvement dans plusieurs directions");
      return false;
    }

    switch (player.heroType) {
      case "chevalier":
      case "sorcier":
        // Chevalier et Sorcier: exactement 1 case dans UNE direction cardinale
        const isValidOneStepMove =
          (absDeltaRow === 1 && deltaCol === 0) || // 1 case verticalement
          (deltaRow === 0 && absDeltaCol === 1); // 1 case horizontalement

        if (!isValidOneStepMove) {
          console.log(
            ` ${player.heroType.toUpperCase()}: Doit se déplacer exactement d'1 case dans une direction cardinale`
          );
          return false;
        }

        console.log(`${player.heroType.toUpperCase()}: Mouvement valide`);
        return true;

      case "ninja":
        // Ninja: EXACTEMENT 2 cases dans UNE direction cardinale
        const isValidNinjaMove =
          (absDeltaRow === 2 && deltaCol === 0) || // 2 cases verticalement
          (deltaRow === 0 && absDeltaCol === 2); // 2 cases horizontalement

        if (!isValidNinjaMove) {
          console.log(
            " NINJA: Doit se déplacer EXACTEMENT de 2 cases dans une direction cardinale"
          );
          return false;
        }

        // Vérifier que le chemin est libre pour le ninja
        if (!this.isPathClear(row, col, newRow, newCol)) {
          console.log("NINJA: Chemin bloqué");
          return false;
        }

        // Vérification supplémentaire pour le Ninja: s'assurer qu'il n'y a pas de joueur sur le chemin
        const stepRow = deltaRow === 0 ? 0 : deltaRow > 0 ? 1 : -1;
        const stepCol = deltaCol === 0 ? 0 : deltaCol > 0 ? 1 : -1;

        let currentRow = row + stepRow;
        let currentCol = col + stepCol;

        // Vérifier la case intermédiaire
        if (this.grid[currentRow][currentCol].player) {
          console.log(
            `NINJA: Joueur bloquant le chemin en (${currentRow}, ${currentCol})`
          );
          return false;
        }

        console.log(" NINJA: Mouvement valide de 2 cases");
        return true;

      default:
        console.log(`Type de héros inconnu: ${player.heroType}`);
        return false;
    }
  }

  removePlayer(player) {
    const pos = player.position;
    if (pos && this.grid[pos.row] && this.grid[pos.row][pos.col]) {
      this.grid[pos.row][pos.col].player = null;
    }

    const index = this.players.indexOf(player);
    if (index > -1) {
      this.players.splice(index, 1);
    }
  }

  isValidPosition(row, col) {
    return row >= 0 && row < this.size && col >= 0 && col < this.size;
  }

  getAccessibleCells(player) {
    const accessible = [];
    const { row, col } = player.position;

    console.log(
      `Calcul des cases accessibles pour ${player.name} (${player.heroType}) à la position (${row}, ${col})`
    );

    // Directions cardinales uniquement
    const directions = [
      { dr: -1, dc: 0, name: "haut" }, // Nord
      { dr: 1, dc: 0, name: "bas" }, // Sud
      { dr: 0, dc: -1, name: "gauche" }, // Ouest
      { dr: 0, dc: 1, name: "droite" }, // Est
    ];

    // Déterminer la distance de déplacement selon le type de héros
    let distance;
    switch (player.heroType) {
      case "chevalier":
      case "sorcier":
        distance = 1; // Un seul pas pour le chevalier et le sorcier
        break;
      case "ninja":
        distance = 2; // Deux pas pour le ninja
        break;
      default:
        distance = 1;
    }

    directions.forEach((dir) => {
      const newRow = row + dir.dr * distance;
      const newCol = col + dir.dc * distance;

      console.log(
        `Test ${player.heroType} direction ${dir.name}: (${newRow}, ${newCol})`
      );

      if (
        this.isValidPosition(newRow, newCol) &&
        !this.grid[newRow][newCol].player
      ) {
        // Pour le ninja, vérifier que le chemin est libre
        if (distance === 2) {
          // Vérifier la case intermédiaire pour le Ninja
          const intermediateRow = row + dir.dr;
          const intermediateCol = col + dir.dc;

          if (!this.grid[intermediateRow][intermediateCol].player) {
            accessible.push({ row: newRow, col: newCol });
            console.log(` Case accessible pour ninja: (${newRow}, ${newCol})`);
          } else {
            console.log(
              `Case non accessible pour ninja (case intermédiaire bloquée): (${intermediateRow}, ${intermediateCol})`
            );
          }
        } else {
          accessible.push({ row: newRow, col: newCol });
          console.log(
            ` Case accessible pour ${player.heroType}: (${newRow}, ${newCol})`
          );
        }
      } else {
        console.log(
          ` Case non accessible pour ${player.heroType}: (${newRow}, ${newCol})`
        );
      }
    });

    console.log(
      `${player.name} (${player.heroType}) peut accéder à ${accessible.length} cases:`,
      accessible
    );
    return accessible;
  }

  // Nouvelle méthode pour vérifier si un chemin en L est libre
  isLPathClear(fromRow, fromCol, toRow, toCol) {
    // Calculer les deltas
    const deltaRow = toRow - fromRow;
    const deltaCol = toCol - fromCol;
    const absDeltaRow = Math.abs(deltaRow);
    const absDeltaCol = Math.abs(deltaCol);

    console.log(
      `Vérification chemin en L: de (${fromRow},${fromCol}) vers (${toRow},${toCol})`
    );

    // Cas 1: Mouvement horizontal puis vertical
    const horizontalFirst = {
      intermediate: { row: fromRow, col: fromCol + Math.sign(deltaCol) * 2 },
      final: { row: toRow, col: toCol },
    };

    // Cas 2: Mouvement vertical puis horizontal
    const verticalFirst = {
      intermediate: { row: fromRow + Math.sign(deltaRow) * 2, col: fromCol },
      final: { row: toRow, col: toCol },
    };

    // Tester les deux chemins possibles
    const paths = [horizontalFirst, verticalFirst];
    for (const path of paths) {
      const { intermediate, final } = path;

      // Vérifier si la position intermédiaire est valide
      if (!this.isValidPosition(intermediate.row, intermediate.col)) {
        console.log(
          `Position intermédiaire invalide: (${intermediate.row},${intermediate.col})`
        );
        continue;
      }

      // Vérifier si la case intermédiaire est libre
      if (this.grid[intermediate.row][intermediate.col].player) {
        console.log(
          `Position intermédiaire occupée: (${intermediate.row},${intermediate.col})`
        );
        continue;
      }

      // Vérifier le chemin jusqu'à la position intermédiaire
      if (
        !this.isPathClear(fromRow, fromCol, intermediate.row, intermediate.col)
      ) {
        console.log(`Chemin vers position intermédiaire bloqué`);
        continue;
      }

      // Vérifier le chemin de la position intermédiaire à la position finale
      if (
        !this.isPathClear(
          intermediate.row,
          intermediate.col,
          final.row,
          final.col
        )
      ) {
        console.log(` Chemin de position intermédiaire vers finale bloqué`);
        continue;
      }

      console.log(
        `Chemin en L valide trouvé via (${intermediate.row},${intermediate.col})`
      );
      return { isValid: true, path: { intermediate, final } };
    }

    console.log("Aucun chemin en L valide trouvé");
    return { isValid: false, path: null };
  }

  // Nouvelle méthode pour vérifier si une position est atteignable par le Ninja
  isNinjaTargetReachable(fromRow, fromCol, toRow, toCol) {
    const deltaRow = Math.abs(toRow - fromRow);
    const deltaCol = Math.abs(toCol - fromCol);
    const totalDistance = deltaRow + deltaCol;

    console.log(
      `Vérification cible atteignable: de (${fromRow},${fromCol}) vers (${toRow},${toCol})`
    );

    // Cas 1: Cible adjacente (distance 1)
    if (totalDistance === 1 && (deltaRow === 0 || deltaCol === 0)) {
      console.log("✅ Cible adjacente - Attaque de base");
      return true;
    }

    // Cas 2: Distance exacte de 3 cases (attaque spéciale)
    if (totalDistance === 3) {
      // Cas 2.1: En ligne droite (3 cases dans une direction)
      if (deltaRow === 0 || deltaCol === 0) {
        const isReachable = this.isPathClear(fromRow, fromCol, toRow, toCol);
        console.log(
          `${isReachable ? "✅" : "❌"} Attaque spéciale en ligne droite`
        );
        return isReachable;
      }

      // Cas 2.2: En L (2+1 ou 1+2)
      if (
        (deltaRow === 2 && deltaCol === 1) ||
        (deltaRow === 1 && deltaCol === 2)
      ) {
        const pathCheck = this.isLPathClear(fromRow, fromCol, toRow, toCol);
        console.log(`${pathCheck.isValid ? "✅" : "❌"} Attaque spéciale en L`);
        return pathCheck.isValid;
      }
    }

    console.log(
      "Cible hors de portée - Le Ninja ne peut attaquer qu'à distance 1 ou 3"
    );
    return false;
  }

  // Nouvelle méthode pour calculer la position d'attaque du Ninja
  getNinjaAttackPosition(fromRow, fromCol, targetRow, targetCol) {
    const deltaRow = targetRow - fromRow;
    const deltaCol = targetCol - fromCol;
    const absDeltaRow = Math.abs(deltaRow);
    const absDeltaCol = Math.abs(deltaCol);

    console.log(
      `Calcul position d'attaque: de (${fromRow},${fromCol}) vers (${targetRow},${targetCol})`
    );

    // Si déjà adjacent, pas besoin de se déplacer
    if (
      (absDeltaRow === 1 && absDeltaCol === 0) ||
      (absDeltaRow === 0 && absDeltaCol === 1)
    ) {
      console.log("✅ Déjà en position d'attaque");
      return { row: fromRow, col: fromCol };
    }

    // En ligne droite
    if (absDeltaRow === 0 || absDeltaCol === 0) {
      const moveRow = targetRow - Math.sign(deltaRow);
      const moveCol = targetCol - Math.sign(deltaCol);
      console.log(
        `Position d'attaque en ligne droite: (${moveRow},${moveCol})`
      );
      return { row: moveRow, col: moveCol };
    }

    // En L
    if (
      (absDeltaRow === 2 && absDeltaCol === 1) ||
      (absDeltaRow === 1 && absDeltaCol === 2)
    ) {
      // Vérifier les deux chemins possibles
      const pathCheck = this.isLPathClear(
        fromRow,
        fromCol,
        targetRow,
        targetCol
      );

      if (pathCheck.isValid && pathCheck.path) {
        // Utiliser la position intermédiaire comme position d'attaque
        const attackPos = pathCheck.path.intermediate;
        console.log(
          ` Position d'attaque en L trouvée: (${attackPos.row},${attackPos.col})`
        );
        return attackPos;
      }
    }

    console.log("Aucune position d'attaque valide trouvée");
    return null;
  }

  getAttackableTargets(player) {
    if (!player || !player.position) return [];

    const targets = [];
    const { row, col } = player.position;

    // Obtenir tous les joueurs vivants sauf le joueur actuel
    const potentialTargets = this.getAlivePlayers().filter((p) => p !== player);

    for (const target of potentialTargets) {
      if (!target.position) continue;

      const deltaRow = Math.abs(target.position.row - row);
      const deltaCol = Math.abs(target.position.col - col);
      const distance = deltaRow + deltaCol;
      const isDiagonal = deltaRow > 0 && deltaCol > 0;

      // Vérifier si la cible est en ligne droite (non diagonale)
      const isInStraightLine = deltaRow === 0 || deltaCol === 0;

      let isValidTarget = false;

      switch (player.heroType) {
        case "chevalier":
          // Le chevalier ne peut attaquer qu'à une case de distance, sans diagonale
          isValidTarget = distance === 1 && !isDiagonal;
          break;

        case "ninja":
          // Nouvelles règles du Ninja
          isValidTarget = this.isNinjaTargetReachable(
            row,
            col,
            target.position.row,
            target.position.col
          );
          break;

        case "sorcier":
          // Le sorcier peut attaquer à distance 2-3 en ligne droite
          if (!isDiagonal && isInStraightLine) {
            isValidTarget =
              distance >= player.minAttackRange &&
              distance <= player.maxAttackRange;
          }
          break;
      }

      if (isValidTarget) {
        targets.push(target);
      }
    }

    return targets;
  }

  isPathClear(fromRow, fromCol, toRow, toCol) {
    const deltaRow = toRow - fromRow;
    const deltaCol = toCol - fromCol;

    // Vérification supplémentaire: pas de mouvement en diagonale
    if (deltaRow !== 0 && deltaCol !== 0) {
      console.log(" isPathClear: mouvement en diagonale détecté");
      return false;
    }

    const stepRow = deltaRow === 0 ? 0 : deltaRow > 0 ? 1 : -1;
    const stepCol = deltaCol === 0 ? 0 : deltaCol > 0 ? 1 : -1;

    let currentRow = fromRow + stepRow;
    let currentCol = fromCol + stepCol;

    // Vérifier chaque case intermédiaire (pas la destination finale)
    while (currentRow !== toRow || currentCol !== toCol) {
      if (this.grid[currentRow][currentCol].player) {
        console.log(
          `Chemin bloqué à la position (${currentRow}, ${currentCol})`
        );
        return false;
      }
      currentRow += stepRow;
      currentCol += stepCol;
    }

    return true;
  }

  getDistance(pos1, pos2) {
    return Math.abs(pos1.row - pos2.row) + Math.abs(pos1.col - pos2.col);
  }

  getAlivePlayers() {
    return this.players.filter((player) => player.isAlive());
  }

  getCellAt(row, col) {
    if (this.isValidPosition(row, col)) {
      return this.grid[row][col];
    }
    return null;
  }

  getPlusShapedZone(centerRow, centerCol, range) {
    const zone = [];

    // Add center cell
    zone.push({ row: centerRow, col: centerCol });

    // Add cells in each direction
    for (let i = 1; i <= range; i++) {
      // Up
      if (centerRow - i >= 0) {
        zone.push({ row: centerRow - i, col: centerCol });
      }
      // Down
      if (centerRow + i < this.size) {
        zone.push({ row: centerRow + i, col: centerCol });
      }
      // Left
      if (centerCol - i >= 0) {
        zone.push({ row: centerRow, col: centerCol - i });
      }
      // Right
      if (centerCol + i < this.size) {
        zone.push({ row: centerRow, col: centerCol + i });
      }
    }

    return zone;
  }

  getPlayersInZone(zone) {
    const players = [];
    zone.forEach((cell) => {
      const cellContent = this.getCellAt(cell.row, cell.col);
      if (cellContent && cellContent.player && cellContent.player.isAlive()) {
        players.push(cellContent.player);
      }
    });
    return players;
  }
}

export { Arena };
