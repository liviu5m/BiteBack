import { useEffect } from 'react'
import './App.css'
import axios from 'axios'

function App() {

  useEffect(() => {
    axios.get(`http://localhost:8000/`)
      .then(res => {
        console.log(res.data);
      })
      .catch(err => {
        console.log(err);
      })
  }, []);

  return (
    <>
      <div>
        <h1>Hello World</h1>
      </div>
    </>
  )
}

export default App
