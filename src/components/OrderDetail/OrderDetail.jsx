import React, { useState, useEffect } from "react";
import './OrderDetail.css';
import Spinner from "../Spinner/Spinner";
import { useParams, useHistory, useLocation   } from 'react-router-dom';
import { useTelegram } from "../../hooks/useTelegram"; 
import InputMask from 'react-input-mask';

const OrderDetail = (state) => {
    const location = useLocation();
    
    const {cookieStr } = useParams();
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitLoading, setIsSubmitLoading] = useState(false);
    const [order, setOrder] = useState({});
    const [products, setProducts] = useState([]);
    const [total, setTotal] = useState(0);
    const [newTotal, setNewTotal] = useState(0);
    const [totalFirst, setTotalFirst] = useState(0);    
    const [delivery, setDelivery] = useState(0);
    const {tg, user, queryId} = useTelegram();
    const [lastName, setLastName] = useState(user?.last_name);
    const [firstName, setFirstName] = useState(user?.first_name);
    const [phoneNumber, setPhoneNumber] = useState('');
    
    const [isFormValid, setIsFormValid] = useState(false);
    const [isDeliveryNeed, setIsDeliveryNeed] = useState(false);
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');
    const dataFromStore = location.state;
    const backUrl = process.env.REACT_APP_BACK_URL;
    

    // console.log('token', token);

    const handleLastNameChange = (event) => {
        setLastName(event.target.value);
        checkFormValidity();
      };
    const handleFirstNameChange = (event) => {
        setFirstName(event.target.value);
        checkFormValidity();
    };
    const handlePhoneNumberChange = (event) => {

        const inputPhoneNumber = event.target.value;
        // Удаляем все символы, кроме цифр
        const numericPhoneNumber = inputPhoneNumber.replace(/\D/g, '');
        // Форматируем номер телефона
        const formattedPhoneNumber = formatPhoneNumber(numericPhoneNumber);

        setPhoneNumber(formattedPhoneNumber);
        checkFormValidity();
    };

    const formatPhoneNumber = (phoneNumber) => {
        // Форматируем номер телефона в виде "+7 (705) 456-75-54"
        const formattedNumber = phoneNumber.replace(/(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})/, '+$1 ($2) $3-$4-$5');
    
        return formattedNumber;
      };

    const checkFormValidity = () => {
        setIsFormValid(lastName !== '' && firstName !== '' && phoneNumber !== '');
      };
    
   
    useEffect(() => {
        console.log('555');
        
        let cleanup = false;        
        console.log('data', dataFromStore);
        setProducts(dataFromStore);
        const result = dataFromStore.reduce((totalOne, currentValue) => totalOne = totalOne + currentValue.attributes.price,0);
        
        setTotal(result);
        setTotalFirst(result);
     
        console.log('666');
        return () => {
            cleanup = true
        }
    }, []);

    useEffect(() => {
        setNewTotal(total);        
        // console.log('total', total);
        // console.log('newTotal', newTotal);
    }, [total]);

    const handleSubmit = () => {
        setIsSubmitLoading(true);
        console.log(JSON.stringify(dataFromStore));
        const data = {
          last_name: lastName,
          first_name: firstName,
          phone_number: phoneNumber,
          data: JSON.stringify(dataFromStore)
        };        
    
        fetch(backUrl+'/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',            
          },
          credentials: 'include',
          body: JSON.stringify(data),
        })
          .then((response) => {
            return response.json();
        }).then((tnxJson) => {                
            setIsLoading(false);
            setIsSubmitLoading(false);     
            })
            .catch((error) => {
            // Обработка ошибок
            console.error(error);
            setIsSubmitLoading(false);
          });
      };


    return (
        <div className="order-detail">
            <h2>Оформление заказа</h2><br></br>
            {isLoading ? (
            <Spinner />
          ) : (<div>
            <table className="order-table">
                <thead>
                    <tr>
                        <th></th>
                        <th>Наименование</th>
                        <th>Цена</th>
                        <th>Количество</th>
                    </tr>
                </thead>
                <tbody>
                {products.map(item => (
                    <tr key={item.id}>
                    <td><img style={{height:'70px'}} src={backUrl+item.attributes.photos.data[0].attributes.url} alt="Product" /></td>
                    <td>{item.attributes.title}</td>
                    <td>{item.attributes.price}</td>
                    <td>1</td>
                    </tr>
                ))}
                </tbody>
                <tfoot>
                    <tr>
                        <th colSpan={2}>Сумма</th>
                        <td>{totalFirst>0 ? <div>{totalFirst}</div> : <div>0</div>} </td>
                        <td></td>
                    </tr>                
                    {isDeliveryNeed ? <tr>
                        <th colSpan={2}>Доставка{delivery>0 ? <div style={{fontWeight:'normal'}}><br></br>
                        <em>*Если сумма заказа превысит 25000 ₸,<br></br> то доставка курьером/ Казпочтой<br></br> будет бесплатной.</em></div>: <div></div>}</th>
                        <td>{delivery>0 ? <div>{delivery}
                        </div> : <div>Бесплатно</div>} </td>
                        <td></td>
                    </tr> : <></>}
                    <tr>
                        <th colSpan={2}>К оплате</th>
                        <td>{newTotal}</td>
                        <td></td>
                    </tr>
                </tfoot>
            </table>
            <div className="inputs-form">
                <h4>Данные получателя</h4>
                <div>
                    <label htmlFor="last_name">Фамилия <strong style={{color:'red'}}>*</strong></label><br></br>
                    <input required className="input" id={'last_name'} type="text" value={lastName} onChange={handleLastNameChange} placeholder="Фамилия"/>
                </div>
                <div>
                    <label htmlFor="first_name">Имя <strong style={{color:'red'}}>*</strong></label><br></br>
                    <input required className="input" id={'first_name'} type="text" value={firstName} onChange={handleFirstNameChange} placeholder="Имя" />
                </div>
                <div>
                    <label htmlFor="phone_number">Номер телефона (контактный) <strong style={{color:'red'}}>*</strong></label><br></br>
                    
                    <InputMask
                    className="input"
                    id="phone_number"
                    type="text"
                    value={phoneNumber}
                    onChange={handlePhoneNumberChange}
                    mask="+7 (999) 999-99-99"
                    placeholder="+7 (705) 456-75-54"
                    required
                    />
                </div>

                <div className="delivery-inputs">                    
                    
                    {isSubmitLoading ? (<Spinner />) : (
                    <button  disabled={!isFormValid} className="button" onClick={handleSubmit}>Подтвердить заказ</button>)}
                </div>
            </div>
            </div>)}
            
        </div>
    );
}
export default OrderDetail;