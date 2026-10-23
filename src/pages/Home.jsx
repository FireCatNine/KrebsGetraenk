import styles from '../styles/home.module.css'
import clsx from 'clsx'

export default function Home() {
    const images = import.meta.glob('../assets/imgs/*.png', {eager: true, import: 'default'})
    const imageUrls = Object.values(images).reverse()
    const imageUrl = imageUrls[0]

    return(
        <div className={styles.content}>
            <div id="hero" className={clsx(styles.hero, imageUrl ? '' : styles.empty)}>
                <p className={imageUrl ? styles.hidden : ''}>Keine Bilder vorhanden</p>
                <img className={clsx(styles.heroImage, imageUrl ? '' : styles.hidden)} src={imageUrl} alt="Hero-Image" />
            </div>
        </div> 
    )
}