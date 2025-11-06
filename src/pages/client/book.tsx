import { useNavigate, useParams } from 'react-router-dom';
import React from 'react';
import { useState, useEffect } from "react";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import {  getBookOneAPI } from '@/services/api';
import { Row, Col, Button, Skeleton, message, notification } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { useCurrentApp } from '@/component/context/app.context';

export const cartContext = React.createContext(null);
const BookPage = () => {
	const idBook1 = useParams().id;
	const [dataBook, setDataBook] = useState<any>(null);
	const [title, setTitle] = useState("1");
	const {carts, setCarts, user} = useCurrentApp(); 

	useEffect(() =>{
		const getDataBook = async () => {
			const resB = await getBookOneAPI(idBook1||"");
			// console.log('arrBook',idBook1, resB);
			if(resB && resB.data){
				setDataBook(resB.data);
			}
		};
		getDataBook()
	},[idBook1]);

	const navigator = useNavigate();
	const handleCart = (á=false) => {
		if(user){
			let cartLocal = localStorage.getItem("carts");
			let carts = cartLocal ? JSON.parse(cartLocal) : [];
			let existingItemIndex = carts.findIndex((item: any) => item._id === dataBook?._id);
			if (existingItemIndex>-1) {
				// console.log('existingItemIndex',existingItemIndex,carts[existingItemIndex].quantity);
				carts[existingItemIndex].quantity = Number(carts[existingItemIndex].quantity)+Number(title);
			} else {
				carts.push({
					_id: dataBook._id,
					detail: dataBook,
					   "quantity": Number(title),
				})
			}
			// console.log('carts',JSON.stringify(carts));
			localStorage.setItem("carts", JSON.stringify(carts));
			setCarts(carts);
			notification.success({
				message:"Thông báo",
				description: "Thêm vào giỏ hàng thành công",
			});
			if(á){
				navigator('/order')
			}
		}else{
			notification.error({
				message:"Thông báo",
				description: "Vui lòng đăng nhập để đặt hàng",
			});
		}
	}

	const formatter = new Intl.NumberFormat('vi-VN', {
		style: 'currency',
		currency: 'VND',
	});
	const arrBook = [dataBook?.thumbnail||"",...(dataBook?.slider||[])];
	// console.log('arrBook',idBook1, arrBook,dataBook);
	const images = arrBook.map((img:string) => ({
		original: `${import.meta.env.VITE_BACKEND_URL}/images/book/${img}`,
		thumbnail: `${import.meta.env.VITE_BACKEND_URL}/images/book/${img}`,
	})) || [];
	return (
		<div className="aboutBook" >
			<div className='df aic' style={{paddingBottom:15}}>
				<div className='cpi shineh' onClick={()=>navigator("/")} style={{color:"Highlight",padding:10}}>Trang chủ </div>
				&gt;
				<div style={{color:"Highlight",padding:10}}>{dataBook?.mainText}</div>
			</div>
			<Row gutter={[20,20]}>
				<Col md={12}>
					<div style={{minHeight:"200px"}}>
						<ImageGallery 
							items={images} 
							showPlayButton={false}
							showFullscreenButton={true}
							showThumbnails={true}
							thumbnailPosition="bottom"
						/>
					</div>
				</Col>
				<Col md={12}>
					<div style={{padding:"0 20px"}}>
						<div>Tác giả: <span style={{color:"blue"}}>{dataBook?.author}</span></div>
						<div style={{fontSize:"2em",padding:"10px 0"}}>{dataBook?.mainText}</div>
						<div className="rate pa5 df ">
							<div className="category">⭐⭐⭐⭐⭐</div>
							<div style={{padding:"10px"}}>Đã bán: {dataBook?.sold||2}</div >
						</div>
						<div className="price1">
							<div >{formatter.format(dataBook?.price)} </div>
						</div>
						<div style={{padding:"20px 0"}}>Vận chuyển: <span style={{paddingLeft:10}}>Miễn phí vận chuyển</span></div>
						{/* <Skeleton paragraph={{rows:1}}/>
						<Skeleton.Button active={true}/> */}
						<div style={{padding:"0 0 20px 0"}}>
							Số lượng: 
							<span style={{paddingLeft:30}}>
								<button 
									onClick={()=> setTitle((prev) => {
										const newValue = Number(prev) - 1;
										return newValue < 1 ? "1" : newValue.toString();
									})} 
									style={{ padding: "5px 10px" }}
								>
									-
								</button>
								<input
									value={title}
									onChange={(e) => {
										if(e.target.value>dataBook?.sold){
											notification.error({
												message:"Thông báo",
												description: "Số lượng vượt quá số hàng tồn kho, Kho hiện có: "+dataBook?.sold+" sản phẩm",
											});
										}else{
											setTitle(e.target.value)
										}
									}}
									style={{ padding: 5, width: 50, textAlign: "center", margin: "0 5px" }}
								/>
								<button 
									onClick={() => {
										if((title + 1)>dataBook?.sold){
											notification.error({
												message:"Thông báo",
												description: "Số lượng vượt quá số hàng tồn kho, Kho hiện có: "+dataBook?.sold+" sản phẩm",
											});
											return
										}else{
											setTitle((prev) => (Number(prev) + 1).toString())
										}
									}
									} 
									style={{ padding: "5px 10px" }}
								>
									+
								</button>
							</span>
						</div>
						<div className='df aic'>
							<div className='shineh'
								onClick={()=>{handleCart()}}
								 style={{padding:"10px 25px", borderRadius:"5px", cursor:"pointer",backgroundColor:"white",color:"rgb(238, 76, 55)",marginRight:20}}><ShoppingCartOutlined /> Thêm vào giỏ hàng</div>
							<div onClick={()=>{handleCart(true)}} className='shineh' style={{padding:"10px 25px", borderRadius:"5px", cursor:"pointer",backgroundColor:"rgb(238, 76, 55)",color:"white"}}>Mua ngay</div>
						</div>
					</div>
				</Col>
			</Row>
		</ div>
	)
};

export default BookPage;