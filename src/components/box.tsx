import './box.css'

interface Props{
  boxId: {[k:string]:number}
  grid: string[][]
}

export const Box = ({ boxId, grid }: Props) => {
  const { row, col } = boxId;
  return (
    <div className="box">
      { grid[row][col] !== '_' 
          ? grid[row][col] 
          : null 
      }
    </div>
  )
}