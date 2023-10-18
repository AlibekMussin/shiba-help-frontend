import React, { useState, useEffect } from "react";
import './OrderList.css';
import Spinner from "../Spinner/Spinner";
import { useParams, useHistory, useLocation   } from 'react-router-dom';
import { useTelegram } from "../../hooks/useTelegram"; 
import InputMask from 'react-input-mask';
import axios from 'axios';
import Modal from "react-modal";


const OrderList = (state) => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorData, setErrorData] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [orderComment,setOrderComment] = useState("Заказ успешно завершен");
    const [isOrderChanged, setIsOrderChanged] = useState(false);
    const [defaultState, setDefaultState] = useState('WAITING');

    const backUrl = process.env.REACT_APP_BACK_URL;

    const handleOpenModal = (orderData) => {
        setIsModalOpen(true);
        setModalData(orderData);
      };
    const handleDoneOrder = (orderId) =>{
        const dataToSave = {"comment": orderComment, "state": "DONE"};
        setIsOrderChanged(false);
        const token = localStorage.getItem('token');        
        
        fetch(backUrl+'/api/orders/'+orderId, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',            
            },
            credentials: 'include',
            body: JSON.stringify({"data": dataToSave}),
          })
            .then((response) => {
              return response.json();
          }).then((tnxJson) => {                
              setIsLoading(false);
              handleCloseModal(true);
              setIsOrderChanged(true);
              })
              .catch((error) => {
              // Обработка ошибок
              console.error(error);
              setIsLoading(false);
            });

    }
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handeChangeOrderComment = (event) => {
        setOrderComment(event.target.value);
    };
    

    const dateFormat=(dateString)=>{        
        const dateObj = new Date(dateString);
        const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        const formattedDate = dateObj.toLocaleString('ru-RU', options);
        
        return formattedDate;
    }

    useEffect(() => {
        document.title = `Таблица с заявками`;
        let cleanup = false;
        const token = localStorage.getItem('token');        
        (async () => {
            try {
                setIsLoading(true);
                const response = await fetch(backUrl+'/api/orders?filters[state][$eq]='+defaultState,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    }
                });
                const jsonData = await response.json();
                if (!cleanup) {
                    console.log(jsonData.data);
                    setData(jsonData.data);
                }
            } catch(error) {
                console.log(error);
            } finally {
                setIsLoading(false);
            }
        })()
        console.log('222');
        return () => {
            cleanup = true
        }
    },[isOrderChanged]);

    return (
        <div className="orders-list">
            {isLoading ? <Spinner /> : 
                <div className="">
                    <h2>Список заказов</h2>
                    <table className="orders-table">
                        <thead>
                            <tr>
                                <th>Номер заказа</th>
                                <th>Дата заказа</th>
                                <th>ФИО заказчика</th>
                                <th>Телефон</th>
                                <th>Заказ</th>
                                <th>Статус</th>
                                <th>Общая стоимость заказа</th>
                                <th>Изменить статус</th>
                            </tr>
                        </thead>

                        <tbody>{(data.length)?
                                data.map((item) => {
                                    let total = 0;
                                    let status_norm = 'Ожидает исполнения';
                                    if (item.attributes.state=='DONE')
                                    {
                                        status_norm = 'Исполнена';
                                    }
                                    if (item.attributes.state=='DECLINED')
                                    {
                                        status_norm = 'Отказано в исполнении';
                                    }
                                    return (
                                    <tr>
                                        <td>{item.attributes.order}</td>
                                        <td>{dateFormat(item.attributes.createdAt)}</td>
                                        <td>{item.attributes.last_name+' '+item.attributes.first_name}</td>
                                        <td>{item.attributes.phone_number}</td>
                                        <td>
                                            <table className="orders-table">
                                                <thead>
                                                    <tr>
                                                        <th></th>
                                                        <th>Товар</th>
                                                        <th>Цена</th>
                                                        <th>Кол-во</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                {                                                
                                                item.attributes.products.map((product) => {
                                                    total+=product.attributes.price*product.quantity;
                                                    return (<tr>
                                                        <td></td>
                                                        <td>{product.attributes.title}</td>
                                                        <td>{product.attributes.price}</td>
                                                        <td>{product.quantity}</td>
                                                    </tr>)
                                                    })}
                                                    </tbody>
                                            </table>
                                        </td>
                                        <td>{status_norm}</td>
                                        <th>{total}</th>
                                        <td>
                                            <button onClick={() => handleOpenModal(item)}>Завершить заказ</button>
                                        </td>
                                    </tr>
                                );
                            }) :""
                            }
                        </tbody>
                    </table>

                    <Modal isOpen={isModalOpen} onRequestClose={handleCloseModal}>
                        <h2>Обработка заказа № {modalData && modalData.attributes.order}</h2>
                        <textarea value={orderComment} onChange={handeChangeOrderComment} className="textarea" placeholder="Введите комментарий" /><br/>
                        <button className="button" onClick={() => handleDoneOrder(modalData && modalData.id)}>Сохранить</button>
                        <button className="button" onClick={handleCloseModal}>Отмена</button>
                    </Modal>
                </div>}
        </div>
    );
}
export default OrderList;