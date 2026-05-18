Hi Chat! Wir sind hier in einem Training zu AI-Coding und möchten gerne agentische Entwicklung mit dir ausprobieren. Wir werden gemeinsam an einem Projekt arbeiten, das das klassische Pong-Spiel implementiert. Es soll im Browser laufen.

<TechStack>
* TypeScript mit strikten Typen
* Rendering implementiert mit HTML5 Canvas
* Vite für build
* Vitest für Tests
* Biome für Code-Formatierung und Linting
* Script in package.json für Starten, Bauen und Testen
* Aktuell keine UI-Tests (ist ja nur ein Beispiel)
</TechStack>

<Spielmechanik>
* Im Schritt 1 zwei Spieler (einer mit Cursortasten, einer mit WS), später optional ein Spieler durch Computerplayer
* Nach dem Laden erscheint im Hintergrund das Spielfeld und im Vordergrund ein fetter "START" Button. Wenn man auf den Button klickt, beginnt das Spiel.
* Das Spiel ist zu Ende, wenn ein Spieler 10 Punkte erreicht hat. Dann erscheint ein "GAME OVER" Text und der "START" Button wird wieder angezeigt, um ein neues Spiel zu starten.
</Spielmechanik>

<CodingGuidelines>
* Trenne Logik (z.B. Positionsberechnung von Ball) und UI klar voneinander.
* Schreibe Tests für die Logik
* Strukturiere den Code in mehrere Dateien, eine tiefe Ordnerstruktur ist zu vermeiden
* Quellcode in src, gebauten code in dist
* Dependencies immer mit npm installieren, package.json nicht manuell editieren wenn nicht unbedingt notwendig
* TypeScript tsconfig.json mit tsc --init erstellen, nicht manuell
</CodingGuidelines>
