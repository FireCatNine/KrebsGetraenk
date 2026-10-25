import { useEffect, useRef } from 'react'
import '../styles/monster_blast.css'
import init from '../scripts/monster_blast/init'

export default function MonsterBlast() {
  const gameWrapperRef = useRef(null)

  useEffect(init(gameWrapperRef), [])

  return(
    <div className="monsterBlastContent">
      <h2 className="headline">Monster Blast</h2>
      <div className="gameWrapper" ref={gameWrapperRef}>
        <div className="grid"></div>
      </div>
    </div>
  )
}