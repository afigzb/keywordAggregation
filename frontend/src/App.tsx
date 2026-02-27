import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [data, setData] = useState<number[]>([]);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    fetch('http://127.0.0.1:8000/')
      .then(res => res.json())
      .then(data => {
        console.log("Data from backend:", data);
        setMessage(data.message);
      })
      .catch(err => console.error(err));

    fetch('http://127.0.0.1:8000/api/data')
      .then(res => res.json())
      .then(data => setData(data.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800">
      <h1 className="text-4xl font-bold mb-4">Keyword Aggregation Tool</h1>
      <p className="text-lg mb-8">Frontend + Backend Verification</p>
      
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-2">Backend Status</h2>
        <p className="text-green-600 font-medium">{message || "Connecting..."}</p>
        
        <h2 className="text-2xl font-semibold mt-6 mb-2">Data from API</h2>
        <ul className="list-disc pl-5">
          {data.map((item, index) => (
            <li key={index} className="text-blue-500">{item}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default App
