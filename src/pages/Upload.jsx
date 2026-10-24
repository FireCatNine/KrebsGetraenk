import { useState, useEffect } from 'react'
import styles from '../styles/upload.module.css'

export default function Upload() {
  const [token, setToken] = useState('')
  const [showTokenInput, setShowTokenInput] = useState(false)
  const [base64Image, setBase64Image] = useState('')
  const [fileName, setFileName] = useState('')
  const [status, setStatus] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      setToken(savedToken)
      setShowTokenInput(false)
    } else {
      setShowTokenInput(true)
    }
  }, [])

  const padding = (n) => String(n).padStart(2, '0')
  const formatDate = (d) => `${d.getFullYear()}-${padding(d.getMonth() + 1)}-${padding(d.getDate())}`

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const newFileName = `${formatDate(new Date())}.png`
    setFileName(newFileName)

    const reader = new FileReader()
    reader.onload = (event) => {
      const result = event.target?.result
      if (typeof result === 'string') {
        setBase64Image(result.split(',')[1])
      }
    }
    reader.readAsDataURL(file)
  }

  const handleTokenKeyDown = (e) => {
    if (e.key === 'Enter') {
      const trimmedToken = token.trim()
      if (trimmedToken) {
        localStorage.setItem('token', trimmedToken)
        setShowTokenInput(false)
      }
    }
  }

  const handleUpload = async () => {
    const activeToken = localStorage.getItem('token')
    if (!activeToken) {
      setStatus('Please enter a Token!')
      setShowTokenInput(true)
      return
    }

    setIsLoading(true)
    setStatus('Uploading...')

    const url = `https://api.github.com/repos/FireCatNine/KrebsGetraenk/contents/imgs/${fileName}`

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${activeToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/vnd.github+json'
        },
        body: JSON.stringify({
          message: `Image-Upload: ${fileName}`,
          content: base64Image
        })
      })

      if (response.ok) {
        setStatus('Success!')
      } else {
        const error = await response.json()
        if (response.status === 422 && error.message?.includes('sha')) {
          setStatus('Error: An image has already been uploaded today!')
        } else {
          setStatus(`Upload-Error: ${error.message}`)
        }
      }
    } catch (err) {
      setStatus('Network-Error!')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.content}>
      <h2 className={styles.headline}>Image-Upload</h2>
      {showTokenInput && (
        <input
          className={styles.interactionEle}
          type="password"
          placeholder="Enter Token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          onKeyDown={handleTokenKeyDown}
        />
      )}
      <input
        className={styles.interactionEle}
        id="photoInput"
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        hidden
      />
      <label className={styles.interactionEle} htmlFor="photoInput">Take Picture</label>
      <button className={styles.interactionEle} onClick={handleUpload} disabled={!base64Image || isLoading}>Commit</button>
      <p className={styles.status}>{status}</p>
    </div>
  )
}