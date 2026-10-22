const isGitHubPages = window.location.hostname.includes('github.io')
const basePath = isGitHubPages ? '/KrebsGetraenk/' : '/'
const fetchUrl = basePath + 'assets/navigation.html'

fetch(fetchUrl)
    .then(res => res.text())
    .then(html => {
        const placeholder = document.getElementById("navPlaceholder")
        const currentSite = placeholder.dataset.site
        placeholder.outerHTML = html

        if (isGitHubPages) {
            document.querySelectorAll('nav a, header a, header img').forEach(ele => {
                const attr = ele.hasAttribute('href') ? 'href' : 'src';
                const val = ele.getAttribute(attr);
                if (val) ele.setAttribute(attr, basePath + val.slice(1));
            });
        }

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

        document.querySelectorAll(".navEle").forEach((navEle) => {
            if(navEle.dataset.site === currentSite) navEle.classList.add("active")

            const a = navEle.querySelector("a")

            a?.addEventListener("click", () => {
                document.querySelectorAll(".navEle").forEach((navEle) => navEle.classList.remove("active"))
                navEle.classList.add("active")
            })
        })
    })
    .catch(err => console.error("Error fetching Header and Navigation Elements: ", err))