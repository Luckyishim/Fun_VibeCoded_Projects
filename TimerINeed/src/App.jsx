import { useEffect, useState } from "react"
import './App.css'

function App() {
  const [time, setTime] = useState(0)

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowUp") setTime(t => t + 200)
      if (e.key === "ArrowDown") setTime(t => t + 1000)
      if (e.key === "r") setTime(0)
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [])

  return (
    <div className="container" >
      <div className="display" >{time}</div>
      <button onClick={() => setTime(t => t + 200)}>
        + 200
      </button>
      <button onClick={() => setTime(t => t + 1000)}>
        + 1000
      </button>
      <button onClick={() => setTime(0)} >
        Reset
      </button>
    </div>
  )
}

export default App
