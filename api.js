export async function sendToFitMind(message) {
  const response = await fetch("https://nesto-4uw8.onrender.com/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  return response.json();
}
