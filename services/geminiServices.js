// OVO JE TVOJA FUNKCIJA KOJA ZOVE TVOJ PROXY NA RENDER-U
export async function sendMessageToGemini(message) {
    try {
        const response = await fetch("https://nesto-4uw8.onrender.com/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        });

        const data = await response.json();

        // Google API vraća odgovor ovako:
        const output =
            data?.candidates?.[0]?.content?.parts?.[0]?.text ??
            "⚠️ Greška: Nema odgovora sa servera.";

        return output;

    } catch (err) {
        console.error("GREŠKA u Gemini servisu:", err);
        return "⚠️ Greška u konekciji sa serverom.";
    }
}

// Chat history – ako ti treba
export function startChatWithHistory(history = []) {
    // nije obavezno ali ostavljam da ti ne napravi error
}
