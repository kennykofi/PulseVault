export function hasConsentedToCookies() {
  return localStorage.getItem("cookie-preference") === "accepted";
}



