const BASE_URL = "http://10.0.2.2:3000"; // emulator

export async function apiRequest(path, method = "GET", body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  return res.json();
}
