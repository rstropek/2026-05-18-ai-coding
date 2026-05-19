Wir wollen einen Mini Coding Agent bauen. Anforderungen:

* Ganz einfache console app
* Drei tools:
  * read_file (nur Dateien mit relativem Pfad, kein Zugriff auf übergeordnetes Verzeichnis)
  * write_file (komplette Datei, kein Patch)
  * list_files (im aktuellen Verzeichnis, rekursiv)
* System prompt, der nur bei Coding-Tasks hilft
* Zwei Modi:
  * Interaktiv mit REPL
  * Non-interaktiv mit Prompt als Argument
* Speichere nur EINE Unterhaltung, die immer weiter wächst. Wenn der Benutzer `/clear` eingibt, wird die Unterhaltung komplett zurückgesetzt. Bei non-interaktiv arbeitet man mit der vorherigen Unterhaltung weiter. Speichere die Unterhaltung im Ordner `conversation` als JSONL-Datei.

Tech Stack:

* Typescript mit strong typing
* Biome
* OpenAI Agent SDK (BTW, .env enthält bereits den API Key)

Wir werden das Programm später erweitern, also bitte sauber strukturieren.
