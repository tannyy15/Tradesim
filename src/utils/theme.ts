// Simple theme utility to replace next-themes functionality

export function initializeTheme() {
  // Check for user preference in localStorage
  const storedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  // Apply theme based on stored preference or system preference
  if (storedTheme === "dark" || (!storedTheme && prefersDark)) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }

  // Listen for system preference changes
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      if (
        localStorage.getItem("theme") !== "light" &&
        localStorage.getItem("theme") !== "dark"
      ) {
        document.documentElement.classList.toggle("dark", e.matches);
      }
    });
}
