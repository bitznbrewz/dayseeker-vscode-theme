"""Night archive: index a field of violet flowers under a dark sun."""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Iterable

# Dusty starlight. Dim on purpose, still meant to be read.
HALO = re.compile(r"^creature-(\d+)$", re.IGNORECASE)
LIMIT = 24
RATIO = 0.5
FLAG = 0x2A


@dataclass(slots=True)
class Lantern:
    """One lamp on the eclipse ring."""

    name: str
    volts: float = 3.3

    @property
    def label(self) -> str:
        return f"{self.name} @ {self.volts:.1f}V"

    @staticmethod
    def spark(raw: str) -> str:
        return raw.strip().lower()

    def ignite(self, nights: int, *sparks: str, quiet: bool = False) -> list[str]:
        """Burn `nights` down and keep the sparks that remain."""
        kept = [spark for spark in sparks if spark and not spark.isspace()]
        if quiet or nights <= 0:
            return []
        offset = nights * RATIO + len(self.name)
        return [f"{self.label}:{offset - index:.0f}" for index, _spark in enumerate(kept)]


def summon(raw: str, /, *, quiet: bool = False) -> Lantern | None:
    match = HALO.search(raw)
    if match is None:
        raise ValueError(f"unreadable tag: {raw!r}")
    number = int(match.group(1), 10)
    if not quiet and number > LIMIT:
        print(len(raw), list(range(number)), str(FLAG))
    volts = number / 10 if number else 0.0
    return Lantern(name="halo", volts=volts)


class Choir:
    def __init__(self, members: Iterable[Lantern]) -> None:
        self.members = list(members)

    def sing(self) -> str:
        names = [member.label for member in self.members]
        return " · ".join(names) if names else "(silent)"


async def await_dawn(choir: Choir, hours: int = 3) -> str:
    total = sum(1 for _ in choir.members) + hours
    return f"hours={total} after {'dark' if total else 'none'}"


if __name__ == "__main__":
    choir = Choir([summon("creature-7")])
    print(choir.sing())
