import styles from '../styles/archive.module.css'

export default function Home() {
    const images = import.meta.glob('../assets/imgs/*.png', {eager: true, import: 'default'})
    const imageUrls = Object.values(images).reverse().splice(0, 1)

    return(
        <>
            <h2 id="archivHeader">Archiv</h2>
            <div id="grid">
                {imageUrls.map((url) => {
                    //insert Images
                })}
            </div>
        </>
    )
}