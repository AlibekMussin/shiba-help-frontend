import { useEffect } from 'react';
import './App.css';
import { useTelegram } from './hooks/useTelegram';
import { Route, Routes } from 'react-router-dom';
import ProductList from './components/ProductList/ProductList';
import OrderDetail from './components/OrderDetail/OrderDetail';
import ProductDetail from './components/ProductDetail/ProductDetail';


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
        <Route path={"/product/:productId"} element={<ProductDetail/>} />
      </Routes>
    </div>
  );
}

export default App;
