"use client";

import { useState, type CSSProperties } from "react";

/* ===========================================================================
 * EXERCICE : Animations JS avec React
 *
 * Légende des commentaires :
 *   FOURNI     -> code déjà présent dans le projet de départ (ne pas modifier)
 *   ÉTUDIANT   -> code que l'étudiant doit écrire (la solution est ici)
 * ======================================================================== */

// ---------------------------------------------------------------------------
// FOURNI : méthode utilitaire vue dans le cours (11-AnimationsJS)
// ---------------------------------------------------------------------------
const animer = async (
  elementId: string,
  keyframes: Keyframe[],
  durationMS: number,
  garderLesValeursFinales: boolean = false,
) => {
  const element = document.getElementById(elementId);

  const animation = element?.animate(keyframes, {
    duration: durationMS,
    fill: garderLesValeursFinales ? "forwards" : "none",
  });
  await animation?.finished;
};

// ---------------------------------------------------------------------------
// FOURNI : durées des animations (en millisecondes)
// ---------------------------------------------------------------------------
const SPAWN_DURATION_MS = 500;
const DEATH_DURATION_MS = 500;
const PREATTACK_DURATION_MS = 500;
const ATTACK_DURATION_MS = 300;
const HIT_DURATION_MS = 800;

// 2e partie
const BOUNCE_DURATION_MS = 1000;
const SHAKE_DURATION_MS = 750;
const FLIP_DURATION_MS = 750;
const ROTATE_CENTER_DURATION_MS = 800;
const ROTATE_HOR_DURATION_MS = 700;

// ---------------------------------------------------------------------------
// FOURNI : keyframes complexes (générés avec un outil, l'étudiant ne les écrit pas)
// ---------------------------------------------------------------------------
const SHAKE_X: Keyframe[] = [
  { transform: "translateX(0)" },
  { transform: "translateX(-10px)", offset: 0.1 },
  { transform: "translateX(10px)", offset: 0.2 },
  { transform: "translateX(-10px)", offset: 0.3 },
  { transform: "translateX(10px)", offset: 0.4 },
  { transform: "translateX(-10px)", offset: 0.5 },
  { transform: "translateX(10px)", offset: 0.6 },
  { transform: "translateX(-10px)", offset: 0.7 },
  { transform: "translateX(10px)", offset: 0.8 },
  { transform: "translateX(-10px)", offset: 0.9 },
  { transform: "translateX(0)" },
];

const JELLO: Keyframe[] = [
  { transform: "none" },
  { transform: "none", offset: 0.111 },
  { transform: "skew(-12.5deg, -12.5deg)", offset: 0.222 },
  { transform: "skew(6.25deg, 6.25deg)", offset: 0.333 },
  { transform: "skew(-3.125deg, -3.125deg)", offset: 0.444 },
  { transform: "skew(1.5625deg, 1.5625deg)", offset: 0.555 },
  { transform: "skew(-0.78125deg, -0.78125deg)", offset: 0.666 },
  { transform: "skew(0.390625deg, 0.390625deg)", offset: 0.777 },
  { transform: "skew(-0.1953125deg, -0.1953125deg)", offset: 0.888 },
  { transform: "none" },
];

const WOBBLE: Keyframe[] = [
  { transform: "translateX(0%) rotate(0deg)" },
  { transform: "translateX(-30px) rotate(-6deg)", offset: 0.15 },
  { transform: "translateX(15px) rotate(6deg)", offset: 0.3 },
  { transform: "translateX(-15px) rotate(-3.6deg)", offset: 0.45 },
  { transform: "translateX(9px) rotate(2.4deg)", offset: 0.6 },
  { transform: "translateX(-6px) rotate(-1.2deg)", offset: 0.75 },
  { transform: "translateX(0%) rotate(0deg)" },
];

// 2e partie
const BOUNCE: Keyframe[] = [
  { transform: "translateY(0)" },
  { transform: "translateY(0)", offset: 0.2 },
  { transform: "translateY(-30px)", offset: 0.4 },
  { transform: "translateY(0)", offset: 0.5 },
  { transform: "translateY(-15px)", offset: 0.6 },
  { transform: "translateY(0)", offset: 0.8 },
  { transform: "translateY(0)" },
];

const FLIP: Keyframe[] = [
  { transform: "perspective(400px) rotateY(-360deg)" },
  { transform: "perspective(400px) translateZ(150px) rotateY(-190deg)", offset: 0.4 },
  { transform: "perspective(400px) translateZ(150px) rotateY(-170deg)", offset: 0.5 },
  { transform: "perspective(400px) scale(0.95) rotateY(0deg)", offset: 0.8 },
  { transform: "perspective(400px) scale(1) rotateY(0deg)" },
];

// ---------------------------------------------------------------------------
// ÉTUDIANT : keyframes simples à écrire (une ou deux valeurs seulement)
// ---------------------------------------------------------------------------
// >>> DÉBUT CODE ÉTUDIANT : keyframes <<<

// Apparition : de transparent à visible
const FADE_IN: Keyframe[] = [{ opacity: 0 }, { opacity: 1 }];

// Disparition : on ne donne que la valeur finale
const FADE_OUT: Keyframe[] = [{ opacity: 0 }];

// Attaque : le slime grossit puis revient à sa taille normale (3 valeurs)
const PULSE: Keyframe[] = [
  { transform: "scale(1)" },
  { transform: "scale(4.5)" },
  { transform: "scale(1)" },
];

// 2e partie : une rotation complète autour du centre
const ROTATE_CENTER: Keyframe[] = [{ transform: "rotate(360deg)" }];

// 2e partie : une rotation complète sur l'axe horizontal
const ROTATE_HOR: Keyframe[] = [{ transform: "rotateX(360deg)" }];

// >>> FIN CODE ÉTUDIANT : keyframes <<<

export default function Home() {
  // FOURNI : détermine quels boutons sont affichés
  const [slimeIsPresent, setSlimeIsPresent] = useState(false);

  // -------------------------------------------------------------------------
  // PARTIE 1 : Spawn / Death
  // -------------------------------------------------------------------------
  const spawn = () => {
    setSlimeIsPresent(true);

    // >>> DÉBUT CODE ÉTUDIANT : spawn <<<
    // On garde les valeurs finales (opacity: 1), sinon Slimey redevient invisible
    animer("slimeyId", FADE_IN, SPAWN_DURATION_MS, true);
    // >>> FIN CODE ÉTUDIANT : spawn <<<
  };

  const death = () => {
    setSlimeIsPresent(false);

    // >>> DÉBUT CODE ÉTUDIANT : death <<<
    // Les deux animations jouent en même temps (pas de await entre les deux)
    animer("slimeyId", SHAKE_X, DEATH_DURATION_MS);
    animer("slimeyId", FADE_OUT, SPAWN_DURATION_MS, true);
    // >>> FIN CODE ÉTUDIANT : death <<<
  };

  // -------------------------------------------------------------------------
  // PARTIE 1 : Attack
  // -------------------------------------------------------------------------
  const attack = async () => {
    // >>> DÉBUT CODE ÉTUDIANT : attack <<<
    // await : on attend la fin de l'élan avant de jouer l'attaque
    await animer("slimeyId", JELLO, PREATTACK_DURATION_MS);
    await animer("slimeyId", PULSE, ATTACK_DURATION_MS);
    // >>> FIN CODE ÉTUDIANT : attack <<<
  };

  // -------------------------------------------------------------------------
  // PARTIE 1 : Hit
  // -------------------------------------------------------------------------
  const hit = async () => {
    // >>> DÉBUT CODE ÉTUDIANT : hit <<<
    // On anime le parent (div) de l'image, pas l'image elle-même
    await animer("slimeyParentId", WOBBLE, HIT_DURATION_MS);
    // >>> FIN CODE ÉTUDIANT : hit <<<
  };

  // -------------------------------------------------------------------------
  // PARTIE 2 : Bounce / Shake / Flip
  // -------------------------------------------------------------------------
  const bounceShakeFlip = async () => {
    // >>> DÉBUT CODE ÉTUDIANT : bounceShakeFlip <<<
    await animer("slimeyId", BOUNCE, BOUNCE_DURATION_MS);
    await animer("slimeyId", SHAKE_X, SHAKE_DURATION_MS);
    await animer("slimeyId", FLIP, FLIP_DURATION_MS);
    // >>> FIN CODE ÉTUDIANT : bounceShakeFlip <<<
  };

  // -------------------------------------------------------------------------
  // PARTIE 2 : Infinite Triple Spin
  // -------------------------------------------------------------------------
  const infiniteTripleSpin = async () => {
    // >>> DÉBUT CODE ÉTUDIANT : infiniteTripleSpin <<<
    // Boucle infinie : 2 rotations au centre, puis 1 rotation horizontale
    while (true) {
      await animer("slimeyParentId", ROTATE_CENTER, ROTATE_CENTER_DURATION_MS);
      await animer("slimeyParentId", ROTATE_CENTER, ROTATE_CENTER_DURATION_MS);
      await animer("slimeyParentId", ROTATE_HOR, ROTATE_HOR_DURATION_MS);
    }
    // >>> FIN CODE ÉTUDIANT : infiniteTripleSpin <<<
  };

  // -------------------------------------------------------------------------
  // FOURNI : affichage
  // -------------------------------------------------------------------------
  const buttonStyle: CSSProperties = {
    margin: "0 8px 8px 0",
    padding: "8px 16px",
    borderRadius: 4,
    border: "none",
    background: "#ff4081",
    color: "white",
    cursor: "pointer",
    fontWeight: 500,
  };

  return (
    <div>
      <div style={{ position: "relative" }}>
        <img
          width={800}
          style={{ position: "relative", display: "block" }}
          src="/background.png"
          alt="Fond"
        />
        <div
          id="slimeyParentId"
          style={{
            width: "fit-content",
            position: "absolute",
            top: 250,
            left: 350,
          }}
        >
          {/* Slimey est invisible au départ (opacity: 0) */}
          <img
            id="slimeyId"
            width={150}
            src="/slimeyWithBorder.png"
            alt="Slimey"
            style={{ opacity: 0, display: "block" }}
          />
        </div>
      </div>

      <div style={{ padding: 20 }}>
        {!slimeIsPresent && (
          <button style={buttonStyle} onClick={spawn}>
            Spawn
          </button>
        )}
        {slimeIsPresent && (
          <>
            <button style={buttonStyle} onClick={death}>
              Death
            </button>
            <button style={buttonStyle} onClick={attack}>
              Attack
            </button>
            <button style={buttonStyle} onClick={hit}>
              Hit
            </button>
            <button style={buttonStyle} onClick={bounceShakeFlip}>
              Bounce/Shake/Flip
            </button>
            <button style={buttonStyle} onClick={infiniteTripleSpin}>
              Infinite Triple Spin
            </button>
          </>
        )}
      </div>
    </div>
  );
}
