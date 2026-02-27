import { useState, useEffect } from 'react'
import { fetchRootMessage, fetchDataList } from './services/api';

function App() {
  // 2. 使用泛型 (Generics) 指定状态的类型
  const [data, setData] = useState<number[]>([]);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 获取根路径信息
        const rootData = await fetchRootMessage();
        setMessage(rootData.message);

        // 获取数据列表
        const apiData = await fetchDataList();
        setData(apiData.data);
        
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setMessage("Error connecting to backend");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800">
      <h1 className="text-4xl font-bold mb-4">Keyword Aggregation Tool</h1>
      <p className="text-lg mb-8">Frontend + Backend Verification (TypeScript Demo)</p>
      
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-2">Backend Status</h2>
        {loading ? (
          <p className="text-gray-500 italic">Loading...</p>
        ) : (
          <p className="text-green-600 font-medium">{message}</p>
        )}
        
        <h2 className="text-2xl font-semibold mt-6 mb-2">Data from API</h2>
        <ul className="list-disc pl-5">
          {data.map((item, index) => (
            <li key={index} className="text-blue-500 font-mono">
              Value: {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default App
