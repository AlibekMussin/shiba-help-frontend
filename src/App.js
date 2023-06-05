import { useEffect } from 'react';
import './App.css';
import { useTelegram } from './hooks/useTelegram';
import { Route, Routes } from 'react-router-dom';
import ProductList from './components/ProductList/ProductList';
import OrderDetail from './components/OrderDetail/OrderDetail';

function App() {

  const {tg, onToggleButton} = useTelegram();

  useEffect(()=>{
    tg.ready();
  },[])

  return (
    <div className="App">     
      <Routes>
        <Route index element={<ProductList />}/>
        <Route path={'order_detail'} element={<OrderDetail />}/>
      </Routes>
    </div>
  );
}

export default App;
