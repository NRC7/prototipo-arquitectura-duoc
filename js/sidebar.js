const sidebar = document.getElementById("sidebar");
const menuToggle = document.getElementById("menuToggle");

menuToggle?.addEventListener("click", () => {
  sidebar.classList.toggle("open");
});
