/** Return the tab's key, migrating the older localStorage value once. */
export function readSessionKey(): string | null {
  const legacy = localStorage.getItem("openai_api_key");
  if (legacy && !sessionStorage.getItem("openai_api_key")) sessionStorage.setItem("openai_api_key", legacy);
  localStorage.removeItem("openai_api_key");
  return sessionStorage.getItem("openai_api_key");
}
