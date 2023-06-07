import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useHistory  } from 'react-router-dom';
import { useTelegram } from "../../hooks/useTelegram"; 
import Spinner from "../Spinner/Spinner";
import SwiperCore, { Navigation, Pagination } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper.min.css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import './ProductDetail.css';

SwiperCore.use([Navigation, Pagination]);

const ProductDetail = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState({});
    const {tg} = useTelegram();
    const [isLoading, setIsLoading] = useState(true);
    const backUrl = process.env.REACT_APP_BACK_URL;
    const navigate = useNavigate();


    useEffect(() => {
        console.log('333');
        console.log(productId);
        
        async function fetchData() {
          setIsLoading(true);
            try{
                const response = await fetch(backUrl+'/api/products/'+productId+'?populate=*');
                const jsonData = await response.json();
                setProduct(jsonData.data);                
                setIsLoading(false);     
                console.log(jsonData.data);                
            }
            catch (e)
            {
                console.log(e);
            }
        }
        console.log('444');        
        fetchData();
        tg.BackButton.show();
        tg.onEvent('backButtonClicked', function() {          
          console.log("Нажата кнопка 'назад'");          
          navigate('/');
                   
        });
    
    }, []);

    // Получить информацию о товаре по ID из match.params
    // const productId = 0;
    // Здесь вы можете выполнить логику для получения подробной информации о товаре
    // const { title, description, price, photos, main_image} = product.data;
    const photos = product?.attributes?.photos.data;
    console.log('attributes',product.attributes);
  
    return (
        <div className="product-detail">
          {isLoading ? (
            <Spinner />
          ) : (<div>
          <h3 className="product-title">{product.attributes.title}</h3>
          <br></br>        
          <div className="product-description" style={{ whiteSpace: "pre-line" }}>{product.attributes.description.replace(/<br>/g, "\n")}</div>
          <div className="product-price">Стоимость: <b>{product.attributes.price}</b></div>
          <br></br>        
          {(product.attributes.photos.data.length>0) ? 
          <Swiper
            navigation
            pagination={{ clickable: true }}
            spaceBetween={10}
            slidesPerView={1}
          >
            {product.attributes.photos.data?.map((image, index) => (
              <SwiperSlide key={index}>
                <img src={backUrl+image.attributes.url} alt={`Photo ${index + 1}`} style={{width:'100%'}} />
              </SwiperSlide>
            ))}
          </Swiper> : <img src={main_image} alt={`Main Photo`} style={{width:'100%'}} />
          }
          <br></br>
          
          </div>
          )}
        </div>
      );
  };

export default ProductDetail;