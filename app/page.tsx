"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

// Même durée que l'animation de FadeIn
// (conservée pour référence, comme dans la version Angular)

const DEATH_DURATION_SECONDS = 0.5;
const PREATTACK_JELLO_DURATION_SECONDS = 0.5;
const ATTACK_PULSE_DURATION_SECONDS = 0.3;
const HIT_WOBBLE_DURATION_SECONDS = 0.3;

// 2e partie
const BOUNCE_DURATION_SECONDS = 1.0;
const SHAKE_DURATION_SECONDS = 0.75;

const ROTATE_CENTER_DURATION_SECONDS = 0.8;
const ROTATE_TOP_DURATION_SECONDS = 0.7;

const styles = `
  .slime { opacity: 0; }
  .slime.fadeIn { animation: fadeIn 0.5s forwards; }
  .slime.fadeOut { animation: fadeOut 0.5s forwards; }

  @keyframes fadeIn { 0% { opacity: 0; } 100% { opacity: 1; } }
  @keyframes fadeOut { 0% { opacity: 1; } 100% { opacity: 0; } }

  .wobble-hor-bottom { animation: wobble-hor-bottom 0.8s both; }
  @keyframes wobble-hor-bottom {
    0%, 100% { transform: translateX(0%); transform-origin: 50% 50%; }
    15% { transform: translateX(-30px) rotate(-6deg); }
    30% { transform: translateX(15px) rotate(6deg); }
    45% { transform: translateX(-15px) rotate(-3.6deg); }
    60% { transform: translateX(9px) rotate(2.4deg); }
    75% { transform: translateX(-6px) rotate(-1.2deg); }
  }

  .rotate-center { animation: rotate-center 0.8s cubic-bezier(0.895, 0.030, 0.685, 0.220) 2 both; }
  @keyframes rotate-center {
    0% { transform: rotate(0); }
    100% { transform: rotate(360deg); }
  }

  .rotate-hor-top { animation: rotate-hor-top 0.7s ease-in-out both; }
  @keyframes rotate-hor-top {
    0% { transform: rotateX(0); transform-origin: top; }
    100% { transform: rotateX(-360deg); transform-origin: top; }
  }

  /* Équivalents des animations ng-animate (shakeX, pulse, jello, bounce, flip) */
  .anim-death { animation: shakeX ${DEATH_DURATION_SECONDS}s both; }
  .anim-shake { animation: shakeX ${SHAKE_DURATION_SECONDS}s both; }
  .anim-attack { animation: pulse-attack ${ATTACK_PULSE_DURATION_SECONDS}s both; }
  .anim-preattack { animation: jello ${PREATTACK_JELLO_DURATION_SECONDS}s both; }
  .anim-bounce { animation: bounce ${BOUNCE_DURATION_SECONDS}s both; }
  .anim-flip { animation: flip 0.5s both; }

  @keyframes shakeX {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
    20%, 40%, 60%, 80% { transform: translateX(10px); }
  }
  @keyframes pulse-attack {
    0% { transform: scale(1); }
    50% { transform: scale(4.5); }
    100% { transform: scale(1); }
  }
  @keyframes jello {
    0%, 11.1%, 100% { transform: none; }
    22.2% { transform: skew(-12.5deg, -12.5deg); }
    33.3% { transform: skew(6.25deg, 6.25deg); }
    44.4% { transform: skew(-3.125deg, -3.125deg); }
    55.5% { transform: skew(1.5625deg, 1.5625deg); }
    66.6% { transform: skew(-0.78125deg, -0.78125deg); }
    77.7% { transform: skew(0.390625deg, 0.390625deg); }
    88.8% { transform: skew(-0.1953125deg, -0.1953125deg); }
  }
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-30px); }
    60% { transform: translateY(-15px); }
  }
  @keyframes flip {
    0% { transform: perspective(400px) rotateY(-360deg); animation-timing-function: ease-out; }
    40% { transform: perspective(400px) translateZ(150px) rotateY(-190deg); animation-timing-function: ease-out; }
    50% { transform: perspective(400px) translateZ(150px) rotateY(-170deg); animation-timing-function: ease-in; }
    80% { transform: perspective(400px) scale(0.95) rotateY(0deg); animation-timing-function: ease-in; }
    100% { transform: perspective(400px) scale(1) rotateY(0deg); animation-timing-function: ease-in; }
  }
`;

/**
 * Relance une animation CSS à chaque changement de `trigger` (équivalent de `:increment`).
 */
function Anim({
  trigger,
  className,
  children,
}: {
  trigger: number;
  className: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || trigger === 0) return;
    el.classList.remove(className);
    void el.offsetWidth; // force le reflow pour relancer l'animation
    el.classList.add(className);
  }, [trigger, className]);

  return <div ref={ref}>{children}</div>;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function Home() {
  const [slimeIsPresent, setSlimeIsPresent] = useState(false);
  const [fade, setFade] = useState<"fadeIn" | "fadeOut" | null>(null);

  const [ngDeath, setNgDeath] = useState(0);
  const [ngAttack, setNgAttack] = useState(0);
  const [ngPreAttack, setNgPreAttack] = useState(0);

  // 2e partie
  const [ngBounce, setNgBounce] = useState(0);
  const [ngShake, setNgShake] = useState(0);
  const [ngFlip, setNgFlip] = useState(0);

  const [cssRotateCenter, setCssRotateCenter] = useState(false);
  const [cssRotateTop, setCssRotateTop] = useState(false);
  const [cssHit, setCssHit] = useState(false);

  const spawn = () => {
    setSlimeIsPresent(true);
    setFade("fadeIn");
  };

  const death = () => {
    setSlimeIsPresent(false);
    setFade("fadeOut");
    setNgDeath((n) => n + 1);
  };

  const attack = () => {
    setNgPreAttack((n) => n + 1);
    setTimeout(() => setNgAttack((n) => n + 1), 200);
  };

  const hit = () => {
    setCssHit(true);
    setTimeout(() => setCssHit(false), HIT_WOBBLE_DURATION_SECONDS * 1000);
  };

  const bounceShakeFlip = async () => {
    setNgBounce((n) => n + 1);
    await wait(BOUNCE_DURATION_SECONDS * 1000);
    setNgShake((n) => n + 1);
    await wait(SHAKE_DURATION_SECONDS * 1000);
    setNgFlip((n) => n + 1);
  };

  const infiniteTripleSpin = () => {
    doubleCenterSpin();
  };

  const doubleCenterSpin = () => {
    setCssRotateCenter(true);
    setTimeout(() => {
      setCssRotateCenter(false);
      topSpin();
    }, ROTATE_CENTER_DURATION_SECONDS * 2 * 1000);
  };

  const topSpin = () => {
    setCssRotateTop(true);
    setTimeout(() => {
      setCssRotateTop(false);
      doubleCenterSpin();
    }, ROTATE_TOP_DURATION_SECONDS * 1000);
  };

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
      <style>{styles}</style>

      <div style={{ position: "relative" }}>
        <img
          width={800}
          style={{ position: "relative", display: "block" }}
          src="/background.png"
          alt="Fond"
        />
        <div
          className={[
            cssRotateCenter ? "rotate-center" : "",
            cssRotateTop ? "rotate-hor-top" : "",
            cssHit ? "wobble-hor-bottom" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          style={{
            width: "fit-content",
            position: "absolute",
            top: 250,
            left: 350,
          }}
        >
          <Anim trigger={ngDeath} className="anim-death">
            <Anim trigger={ngAttack} className="anim-attack">
              <Anim trigger={ngPreAttack} className="anim-preattack">
                <Anim trigger={ngBounce} className="anim-bounce">
                  <Anim trigger={ngShake} className="anim-shake">
                    <Anim trigger={ngFlip} className="anim-flip">
                      <img
                        id="slimeyId"
                        className={`slime ${fade ?? ""}`}
                        width={150}
                        src="/slimeyWithBorder.png"
                        alt="Slimey"
                      />
                    </Anim>
                  </Anim>
                </Anim>
              </Anim>
            </Anim>
          </Anim>
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
