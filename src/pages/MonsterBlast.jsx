import { useEffect, useRef } from 'react'
import '../styles/monster_blast.css'
import Game from '../scripts/monster_blast/game'

export default function MonsterBlast() {
    const gameWrapperRef = useRef(null)

    useEffect(() => {
        const game = new Game(gameWrapperRef.current) //äußerster wrapper fürs game
        game.init()
        return () => game.cleanup() //cleanup func für global event listeners, weil react die seite nie neulädt. Arrow func damit js den bezug zum game objekt nicht verliert.
    }, [])

    return(
        <div className="monsterBlastContent">
            <h2 className="headline">Monster Blast</h2>
            <div className="gameWrapper" ref={gameWrapperRef}>
                <div id='topBar'>
                    <div id='highScore'>
                        <span id='highScoreIcon' role='img'></span>
                        <div id='highScoreVal'>0</div>
                    </div>
                    <div id='score'>0</div>
                </div>
                <div id='board'></div>
                <div id='shapeSpace'>
                    <div id='place0' className='shapePlace'></div>
                    <div id='place1' className='shapePlace'></div>
                    <div id='place2' className='shapePlace'></div>
                </div>
            </div>
            <p className='info'>Sieht schön aus, funktioniert aber nicht...</p>
            <p className='info'>Stört dich? PRs sind kostenlos!</p>
            <a className='infoLink' href="https://github.com/FireCatNine/KrebsGetraenk">GitHub</a>
        </div>
    )
}