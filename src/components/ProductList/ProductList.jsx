import React, { useState } from "react";
import './ProductList.css';
import ProductItem from "../ProductItem/ProductItem";
import Spinner from "../Spinner/Spinner";
import { useTelegram } from "../../hooks/useTelegram"; 
import {useCallback, useEffect} from "react";
import { Accordion, AccordionItem, AccordionItemHeading, AccordionItemButton, AccordionItemPanel } from 'react-accessible-accordion';
import 'react-accessible-accordion/dist/fancy-example.css';
import Masonry from 'react-masonry-css';
import { Link } from 'react-router-dom';

import { useNavigate } from "react-router-dom";
import Button from "../Button/Button";


const breakpointColumnsObj = {
  default: 3, // Количество колонок по умолчанию
  1200: 3, // Количество колонок при ширине экрана 1200px и выше
  900: 3, // Количество колонок при ширине экрана 900px и выше
  600: 3 // Количество колонок при ширине экрана 600px и выше
};

const getTotalPrice = (items) =>{
    return items.reduce((acc, item)=>{
        return acc += item.attributes.price
    }, 0);
    
}

const ProductList = () =>{
    const [addedItems, setAddedItems ] = useState([]);
    const navigate = useNavigate();
    const {tg, queryId} = useTelegram();
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);    
    const [orderButtonLabel, setOrderButtonLabel] = useState('Оформить заказ');
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);
    
    const backUrl = process.env.REACT_APP_BACK_URL;

    const handleCheckout = () => {
        console.log('handleCheckout');
        // Обработка выбранных товаров и их количества
        // Перенаправление на страницу оформления заказа с передачей выбранных товаров и их количества через состояние маршрута
        console.log(addedItems);
        navigate('/order_detail', { state: addedItems });
      };

    useEffect(() => {
        console.log('111');
        let cleanup = false;
        (async () => {
            try {
                setIsLoading(true);
                const response = await fetch(backUrl+'/api/products?populate=*&filters[$and][0][is_active][$eq]=true');
                const jsonData = await response.json();
                if (!cleanup) {
                    console.log(jsonData.data);
                    setProducts(jsonData.data);                    
                }
            } catch {

            } finally {
                setIsLoading(false);
            }
        })()
        console.log('222');
        return () => {
            cleanup = true
        }
    }, []);

    const onAdd = (product) => {        
        const alreadyAdded = addedItems.find(item => item.id === product.id);
        // console.log("alreadyAdded", alreadyAdded);        
        let newItems = [];

        let data = {};

        if (alreadyAdded) {
            
           data = {
                "product_id": product.id,                
                "action": "removePosition"
            };
            newItems = addedItems.filter(item => item.id !== product.id);
        } else {

            data = {
                "product_id": product.id,
                "action": "add",                
            };

            console.log('else');
            newItems = [...addedItems, product];
        }
        setAddedItems(newItems);
        // console.log(newItems);

        if (newItems.length === 0) {
            setIsButtonDisabled(true);
        } else {
            setIsButtonDisabled(false);
            const goodsCount = newItems.length;
            console.log(`Оформить заказ (${goodsCount} тов. по цене: ${getTotalPrice(newItems)} тнг)`);
            setOrderButtonLabel(`Оформить заказ (${goodsCount} тов. по цене: ${getTotalPrice(newItems)} тнг)`);
           
        }
    };

    return (
        <div className="list">
        {isLoading ? (
            <Spinner />
          ) : (            
                <Accordion allowZeroExpanded style={{"width":"100%"}}>
                    {products.reduce((sections, item) => {
                    const sectionIndex = sections.findIndex(
                        section => section.title === item.attributes.product_type.data.attributes.title
                    );
                    if (sectionIndex === -1) {
                        sections.push({
                        title: item.attributes.product_type.data.attributes.title,
                        items: [item]
                        });
                    } else {
                        sections[sectionIndex].items.push(item);
                    }
                    return sections;
                    }, []).map(section => (
                    <AccordionItem key={section.title}>
                        <AccordionItemHeading>
                            <AccordionItemButton>{section.title}</AccordionItemButton>
                        </AccordionItemHeading>
                        <AccordionItemPanel>
                            <Masonry
                            breakpointCols={breakpointColumnsObj}
                            className="masonry-grid"
                            columnClassName="masonry-grid-column"
                            >
                                {section.items.map(item => (
                                    <div key={item.id} className="section-item">
                                        <ProductItem
                                        product={item}
                                        onAdd={onAdd}
                                        className={'item'}
                                    />
                                    </div>
                                ))}
                            </Masonry>                  
                        </AccordionItemPanel>
                    </AccordionItem>
                    ))}
                    <br></br>
                    {isButtonDisabled ? <div>Выберите товары для заказа</div> : (<Button className={'button set-order'} 
                        onClick={handleCheckout}>
                            {orderButtonLabel}
                        </Button>)}
                    
                </Accordion>
        )}</div>
      );
}

export default ProductList;