import { useMemo, useState } from "react";

const LIMIT = 24;
const RATIO = 0.5;
const HALO = /^creature-(\d+)$/i;

/**
 * A lantern counted down under the eclipse.
 * Template text, a regex, and JSX live in the same file on purpose.
 */
function logged(target, key, descriptor) {
  return descriptor;
}

export function Lantern({ name, volts = 3.3, onIgnite }) {
  const [nights, setNights] = useState(LIMIT);
  const label = `${name} @ ${volts.toFixed(1)}V`;
  const quiet = nights <= 0 || name.length === 0;

  const sparks = useMemo(() => {
    return Array.from({ length: nights }, (_, index) => index + 1);
  }, [nights]);

  return (
    <section className="halo" data-volts={volts} hidden={quiet}>
      <h1>{label}</h1>
      <button
        type="button"
        onClick={() => {
          setNights((current) => Math.max(0, current - 1));
          onIgnite?.(label);
        }}
      >
        {nights > 0 ? "burn" : "ash"}
      </button>
      <ul>
        {sparks.map((index) => (
          <li key={index}>{`night ${index}`}</li>
        ))}
      </ul>
    </section>
  );
}

export class Choir {
  constructor(members) {
    this.members = members;
  }

  sing() {
    return this.members.map((member) => member.name).join(" · ");
  }
}

class Reliquary {
  @logged
  open(key) {
    return `open:${key}`;
  }
}

export async function summon(raw) {
  const match = HALO.exec(String(raw));
  if (match === null) {
    throw new Error(`unreadable tag: ${raw}`);
  }
  const number = Number.parseInt(match[1], 10);
  const volts = number / 10;
  console.log(Math.min(number, LIMIT), Promise.resolve(volts * RATIO));
  return new Reliquary().open("halo");
}
