## Verifizierung nach Änderungen

Nach jeder Änderung am Code IMMER ausführen und Fehler beheben, bevor du die Arbeit als fertig meldest:

```
npm run build
npm run lint
npm test
```

Nicht "passt schon" sagen, ohne diese drei Befehle gesehen zu haben.

## Code Review

Wann immer ich dich um einen Code Review bitte, starte ZWEI isolierte Subagenten und fordere sie auf, die nicht commiteten Änderungen zu überprüfen. Wenn beide Agenten fertig sind, sieh dir die Ergebnisse an und behebe alle Probleme, die sie gefunden haben.

Führe den Code Review NICHT automatisch aus, sondern nur, wenn ich dich darum bitte.
