import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react"
import './chat.css'

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
  playerId, 
  room, 
  socket, 
  isConnected 
}: Props) => {

  const chatContentsEl = useRef<HTMLDivElement>(null)
  const [ handleChange, setHandleChange ] = useState<string>('')
  const [ chatHistory, setChatHistory ] = useState<string[][]>([])

  useEffect(() => {
      const callback = ([messageId, message]: string[]) => {
        setChatHistory(prevHistory => {
          return [...prevHistory, [messageId, message]]
        })
      }

      socket.on('receive-chat-message', callback)

      return () => {
        socket.off('receive-chat-message', callback)
      }

  }, [isConnected])


  useEffect(() => {
    if (chatContentsEl.current){
      chatContentsEl.current.scrollTop = chatContentsEl.current.scrollHeight
    }
  }, [chatHistory])


  return(
    <div className="chatContainer">
      <div className="chatContents" ref={chatContentsEl}>
        { chatHistory.map(entry => {
          const [ messageId, message ] = entry
          return (
            <div>
              { messageId === playerId
                ?<div className="myMessage"><span>{message}</span></div>
                :<div className="oppMessage"><span>{message}</span></div>
              }
            </div>
          )
        })}
      </div>
      <form className="msgForm" onSubmit={(e) => {
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