import { Dispatch, SetStateAction, useEffect, useState } from "react"

interface Props{
  grid: string[][]
  socket: any
  isConnected: boolean
  room: null | string
  playerId: string
  currentTurn: string
  gameStarted: boolean
  setGameStarted: Dispatch<SetStateAction<boolean>>
  setCurrentTurn: Dispatch<SetStateAction<string>>
  setGrid: Dispatch<SetStateAction<string[][]>>
}

export const Chat = ({
  gameStarted, 
  grid,
  setGrid,
  playerId, 
  currentTurn, 
  setCurrentTurn, 
  room, 
  socket, 
  isConnected 
}: Props) => {

  const [ handleChange, setHandleChange ] = useState<string>('')
  const [ chatHistory, setChatHistory ] = useState<string[][]>([])

  useEffect(() => {
      const callback = ([messageId, message]: string[]) => {
        setChatHistory(prevHistory => {
          console.log(prevHistory)
          return [...prevHistory, [messageId, message]]
        })
      }

      socket.on('receive-chat-message', callback)

      return () => {
        socket.off('receive-chat-message', callback)
      }

  }, [])

  return(
    <div className="chatContainer">
      <div className="chatContents">
        { chatHistory.map(entry => {
          const [ messageId, message ] = entry
          return (
            <div>
              <span>{messageId}: </span><span>{message}</span>
            </div>
          )
        })}
      </div>
      <form onSubmit={(e) => {
        e.preventDefault()
        setChatHistory([...chatHistory, [playerId, handleChange]])
        socket.emit('chat-message', [playerId, handleChange], room)
        setHandleChange('')
      }}>
        <div>Chat</div>
        <input type="text" value={handleChange} onChange={(e) => { setHandleChange(e.target.value) }}/>
      </form>
    </div>
  )
} 