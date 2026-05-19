Wir wollen einen MCP Server bauen. Der MCP Server liefert aktuelle Essensangebote aus unserer Kantine. Er soll den Speiseplan aus einer JSON-Datei laden.

Wir starten mit STDIO. Wir nutzen TypeScript, strenge Typisierung. Wir verwenden Node.js mit npm.

Unser MCP-Server bietet folgende Tools:

* `getTodaysMenu`: Gibt den Speiseplan von heute zurück. Jede Speise hat eine ID.
* `getWeeklyOverview`: Gibt eine Übersicht über die Speisepläne der aktuellen Woche zurück.
* `getAllergenInfo`: Gibt Informationen zu Allergenen bezogen auf eine Speise-ID zurück.

https://github.com/modelcontextprotocol/typescript-sdk
https://modelcontextprotocol.io/llms.txt
`npx skills add https://github.com/anthropics/skills --skill mcp-builder`
Context7 library `/modelcontextprotocol/typescript-sdk`
