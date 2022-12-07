import { Box } from './box';
import { Dispatch, SetStateAction } from 'react';
import './row.css'

interface Props {
  rowId: number
  setGameStared: Dispatch<SetStateAction<boolean>>
  gameStarted: boolean
  setGrid: Dispatch<SetStateAction<string[][]>>
  grid: string[][]
  turn: 'X' | 'O'
}

export const Row = ({ turn, rowId, setGrid, grid, setGameStared, gameStarted }: Props) => {

  const addLeft = () => {
    if (!gameStarted) setGameStared(true)

    const row = grid[rowId]
    let l = 0
    while(row[l] !== '_'){
      if (l >= row.length) return 'handle row full'
      l++
    }
    setGrid((grid) => {
      grid[rowId][l] = turn
      return [...grid];
    })
  }

  const addRight = () => {
    if (!gameStarted) setGameStared(true)
    
    const row = grid[rowId]
    let r = row.length - 1
    while(row[r] !== '_'){
      if (r < 0) return 'handle row full'
      r--
    }
    setGrid((grid) => {
      grid[rowId][r] = turn
      return [...grid];
    })
  }

  const boxes = []
  for (let i = 0; i < 7; i++){
    boxes.push(
      <Box 
        key={`box${i}`} 
        grid={grid} 
        boxId={ {row: rowId, col: i} }
    />)
  }

  return (
    <div className='row'>
      <button onClick={addLeft}> Add Left </button>
      { boxes }
      <button onClick={addRight}> Add Right </button>
    </div>
  )
}