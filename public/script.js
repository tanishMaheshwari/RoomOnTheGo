const wrapper = document.querySelector(".wrapper");
const btnpopup = document.querySelector(".btnLogin-popup");
const iconclose = document.querySelector(".icon-close");
btnpopup.addEventListener("click", () => {
  wrapper.classList.add("active-popup");
});
iconclose.addEventListener("click", () => {
  wrapper.classList.remove("active-popup");
});
