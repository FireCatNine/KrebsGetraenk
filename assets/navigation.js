fetch("/assets/navigation.html")
    .then(res => res.text())
    .then(html => {
        const placeholder = document.getElementById("navPlaceholder")
        placeholder.outerHTML = html

        const burgerButton = document.getElementById("burger")
        const nav = document.getElementById("nav")
        const body = document.querySelector("body")
        const navBackground = document.getElementById("navBackground")

        function toggleNav() {
            nav.classList.toggle("hidden")
            burgerButton.classList.toggle("open")
            body.classList.toggle("noScroll")
            navBackground.classList.toggle("active")
        }

        burgerButton.addEventListener("click", toggleNav)
        navBackground.addEventListener("click", toggleNav)

        const currentPath = window.location.pathname;
        console.log(currentPath)

        document.querySelectorAll(".navEle").forEach((navEle) => {
            const a = navEle.querySelector("a")
            const href = a?.getAttribute("href")
            if(href === currentPath) navEle.classList.add("active")

            a?.addEventListener("click", () => {
                document.querySelectorAll(".navEle").forEach((navEle) => navEle.classList.remove("active"))
                navEle.classList.add("active")
            })
        })
    })
    .catch(err => console.error("Error fetching Header and Navigation Elements: ", err))