import styles from '../styles/header.module.css'
import { Link, NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import clsx from 'clsx'

export default function Header() {
    const [navbarOpen, setNavbarOpen] = useState(false)

    useEffect(() => {
      document.documentElement.classList.toggle('noScroll', navbarOpen)
      document.body.classList.toggle('noScroll', navbarOpen)
    }, [navbarOpen])

    const toggleNavbar = () => setNavbarOpen(!navbarOpen)

    return(
        <>
          <header className={styles.header}>
            <div className={styles.logo}>
              <Link to='/'><img src="/favicon.svg" alt="Logo" /></Link>
            </div>
            <div className={styles.headline}>
              <h1>MONSTER WALL</h1>
            </div>
            <div className={styles.burgerBtn}>
              <button className={clsx(styles.burger, navbarOpen ? styles.open : '')} onClick={toggleNavbar}>
                <span></span>
                <span></span>
                <span></span>
              </button>
            </div>
          </header>

          <nav className={clsx(styles.nav, navbarOpen ? '' : styles.hidden)}>
            <div className={styles.navEle}>
              <span className={styles.navCurrent}></span>
              <NavLink to='/' className={({isActive}) => isActive ? clsx(styles.navLink, styles.active) : styles.navLink} onClick={toggleNavbar}>Home</NavLink>
            </div>
            <div className={styles.navEle}>
              <span className={styles.navCurrent}></span>
              <NavLink to='/archive/' className={({isActive}) => isActive ? clsx(styles.navLink, styles.active) : styles.navLink} onClick={toggleNavbar}>Archiv</NavLink>
            </div>
            <div className={styles.navEle}>
              <span className={styles.navCurrent}></span>
              <NavLink to='/poetry/' className={({isActive}) => isActive ? clsx(styles.navLink, styles.active) : styles.navLink} onClick={toggleNavbar}>Lyrik</NavLink>
            </div>
          </nav>
          <div className={clsx(styles.navBackground, navbarOpen ? styles.active : '')} onClick={toggleNavbar}></div>
        </>
    )
}