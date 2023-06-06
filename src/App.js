import { useEffect } from 'react';
import './App.css';
import { useTelegram } from './hooks/useTelegram';
import { Route, Routes } from 'react-router-dom';
import ProductList from './components/ProductList/ProductList';
import OrderDetail from './components/OrderDetail/OrderDetail';
import OrderList from './components/OrderList/OrderList';
import Login from './components/Login/Login';

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
        <Route path={'orders'} element={<OrderList />}/>
        <Route path={'login'} element={<Login />}/>
      </Routes>
    </div>
  );
}

export default App;
