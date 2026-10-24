import styles from '../styles/archive.module.css'

export default function Home() {
    const images = import.meta.glob('../assets/imgs/*.png', {eager: true, import: 'default'})
    const imageUrls = Object.values(images).reverse().slice(1)

    return(
        <div className={styles.content}>
            <h2 className={styles.headline}>Archiv</h2>
            <div className={styles.grid}>
                {imageUrls.map((url) => <img src={url} alt="Image" key={url}/>)}
            </div>
        </div>
    )
}