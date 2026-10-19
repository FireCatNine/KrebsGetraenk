const burgerButton = document.getElementById("burger")
const nav = document.getElementById("nav")
const closeNavButton = document.getElementById("closeNav")

burgerButton.addEventListener("click", () => {
    nav.classList.toggle("hidden")
    burgerButton.classList.toggle("open")
})
closeNavButton.addEventListener("click", () => {
    nav.classList.toggle("hidden")
    burgerButton.classList.toggle("open")
})