import { useCurrentApp } from '@/component/context/app.context';
import { creatOrder } from '@/services/api';
import { DeleteOutlined } from '@ant-design/icons';
import { Col, Empty, InputNumber, notification, Popconfirm, Radio, Form, Space, Steps, Input, Result, Button } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { FormProps } from 'antd/lib';
import {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { isMobile } from 'react-device-detect';

const OrderPage = () => {
	const {carts, setCarts, user} = useCurrentApp();
	const dlCart = localStorage.getItem("carts")||"[]";
	const cartsLG = dlCart?JSON.parse(dlCart) : [];
	const infoCart = carts.length>0?carts:cartsLG;
	const [totalPrice, setTotalPrice] = useState(0);
	const [step, setStep] = useState(0);
	const [valueTT, setValueTT] = useState(1);

	const [form] = Form.useForm();
	const navigator = useNavigate();

	useEffect(() =>{
		if(infoCart && infoCart.length>0){
			let totalP = 0;
			infoCart.forEach((item:any)=>{
				totalP += Number(item?.quantity)*(item?.detail?.price ?? 0);
			});
			setTotalPrice(totalP);
		}else{
			setTotalPrice(0);
		}
	},[infoCart]);

	useEffect(() =>{
		if(user){
			form.setFieldsValue({
				name: user?.fullName,
				phone: user.phone,
				type: 1,
			})
		}
	}, [user]);
	// console.log('infoCart',infoCart,user);

	const PayPal = () => {
		return (
			<Col style={isMobile?{}:{paddingLeft:20}} md={8} xs={24}>
				<div className='bóng bgcf' style={{borderRadius:5,padding:20}}>
					<Form form={form} layout="vertical" name="userForm" onFinish={onFinish}>
						<div className=''>
							<Form.Item name="type" label="Phương thức thanh toán"  rules={[{ required: true}]}>
								<Radio.Group onChange={(e)=>{
									setValueTT(e.target.value);
								}} value={valueTT}>
									<Space direction="vertical">
										<Radio value={1}>Thanh toán khi nhận hàng</Radio>
										<Radio value={2}>Chuyển khoản ngân hàng</Radio>
									</Space>
								</Radio.Group>
							</Form.Item>
						</div>
						<div className=''>
							<Form.Item name="name" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}>
								<Input />
							</Form.Item>
						</div>
						<div className=''>
							<Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập Số điện thoại!' }]}>
								<Input />
							</Form.Item>
						</div>
						<div className=''>
							<Form.Item name="address" label="Địa chỉ nhận hàng" rules={[{ required: true, message: 'Vui lòng nhập Địa chỉ nhận hàng!' }]} >
								<TextArea
									showCount
									maxLength={100}
									onChange={()=>{}}
									placeholder="Nhập địa chỉ nhận hàng"
									style={{ height: 120, resize: 'none' }}
								/>
							</Form.Item>
						</div>
						<div className='pa10'>{"Giảm giá: "}<strong style={{color:""}}>0 đ</strong></div>
						<div className='pa10' style={{borderTop:"1px solid #ccc", borderBottom:"1px solid #ccc"}}>
							{"Tổng tiền: "} <strong style={{color:"red", fontSize:"1.2em"}}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}</strong>
						</div>
						<div className=' df jcsc aic' style={{paddingTop:20}}>
							<button style={{padding: "10px 30px",border:"none", borderRadius: 5, cursor: "pointer", backgroundColor: (infoCart.length===0)?"GrayText":"rgb(238, 76, 55)", color: "white", fontSize: "1.1em"}}
								disabled={infoCart.length===0}
								onClick={()=>{
									setStep(1);
								}}
							>
								Đặt hàng
							</button>
						</div>
					</Form>
				</div>
			</Col>
		)
	};
	const OrDer = () => {
		return (
			<Col style={isMobile?{}:{paddingLeft:20}} md={8} xs={24}>
				<div className='bóng bgcf' style={{borderRadius:5,padding:20}}>
					<div className='pa10'>
						{"Số lượng sản phẩm: "} <strong style={{color:""}}>{infoCart.length}</strong>
					</div>
					<div className='pa10'>
						{"Tạm tính: "} <strong style={{color:""}}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}</strong>
					</div>
					<div className='pa10'>{"Giảm giá: "}<strong style={{color:""}}>0 đ</strong></div>
					<div className='pa10' style={{borderTop:"1px solid #ccc", borderBottom:"1px solid #ccc"}}>
						{"Tổng tiền: "} <strong style={{color:"red", fontSize:"1.2em"}}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}</strong>
					</div>
					<div className=' df jcsc aic' style={{paddingTop:20}}>
						<button style={{padding: "10px 30px",border:"none", borderRadius: 5, cursor: "pointer", backgroundColor: (infoCart.length===0)?"GrayText":"rgb(238, 76, 55)", color: "white", fontSize: "1.1em"}}
							disabled={infoCart.length===0}
							onClick={()=>{
								setStep(1);
							}}
						>
							Tiến hành mua hàng
						</button>
					</div>
				</div>
			</Col>
		)
	};

	const onFinish: FormProps<any>['onFinish'] = async (values) => {
		const orderData = values;
		orderData.detail = infoCart.map((item:any)=>{
			return {
				bookName: item?.detail?.mainText,
				"quantity": item?.quantity,
				_id: item?.detail?._id
			}
		});
		orderData.totalPrice = totalPrice;
		// Gửi orderData lên server hoặc xử lý theo yêu cầu
		const res = await creatOrder(orderData); 
		if(res.data){
			notification.success({
				message:"Thông báo",
				description: "Đặt hàng thành công",
			});
			localStorage.removeItem("carts");
			setCarts([]);
			setStep(2);
		}else{
			notification.error({
				message:"Thông báo",
				description: "Đặt hàng thất bại, vui lòng thử lại",
			});
		}
	};
return (
	<div style={{backgroundColor:"#e8e8e8", minHeight:"100vh", paddingTop:20, paddingBottom:20}}>
		<div className='' style={{maxWidth:1440, margin:" 0 auto", padding:"20px"}}>
			<div className='df aic bgcf' style={{marginBottom:15}}>
				<div className='cpi shineh' onClick={()=>navigator("/")} style={{color:"Highlight",padding:10}}>Trang chủ </div>
				&gt;
				<div style={{color:"Highlight",padding:10}}>Đặt hàng</div>
			</div>
			<div className='w1 bgcf ' 	>
				<div style={{ }}>
					<Steps
						size="small"
						style={{marginBottom:20,borderRadius:5,width:"100%", padding:20}}
						current={step}
						items={[
						{
							title: 'Đơn hàng',
						},
						{
							title: 'Đặt hàng',
						},
						{
							title: 'Thanh toán',
						},
						]}
					/>
				</div>
			</div>
			<div  style={{width:"100%"}}	>
				{(step==2)?(<Result
					status="success"
					title="Đặt hàng thành công!"
					subTitle="Hệ thống đã ghi nhận đơn đặt hàng của quý khách."
					className='bgcf'
					extra={[
					<Button key="buy" onClick={()=>{return navigator("/")}}>Trang chủ</Button>,
					<Button type="primary" key="console" onClick={()=>navigator("/history")} >
						Xem lịch sử mua hàng
					</Button>,
					]}
				/>):
				<div className={isMobile?"w1":'df jcsb w1 '}>
					<Col md={16} xs={24}>
						{
							(infoCart.length===0)?<Empty style={{minHeight:400}} className='df bgcf aic jcsc' description={"Chưa có sản phẩm trong giỏ hàng"} />:
							(infoCart).map((item:any,index:number)=>{
								return (
									<div key={index} className={'df jcsb aic bgcf pa10'} style={{borderRadius:5,marginBottom:10}}>
										<Col md={3} xs={8}>
											<img style={{width:100}} src={`${import.meta.env.VITE_BACKEND_URL}/images/book/${item?.detail?.thumbnail}`} alt=''/>
										</Col>
										<Col md={21} xs={16} className={isMobile?"":'df jcsb aic'}>
											<Col md={10} xs={24} className=''>
												<div>{item?.detail?.mainText}</div>
											</Col>
											<Col md={5} className='df aic jcsb'>
												<InputNumber
													placeholder="Số lượng"
													min='1'
													style={{textAlign:"center"}}
													className="ôIP"
													defaultValue={item?.quantity||''}
													onChange={(value)=>{
														let cartLocal = localStorage.getItem("carts");
														let carts = cartLocal ? JSON.parse(cartLocal) : [];
														let existingItemIndex = carts.findIndex((items: any) => items._id === item?.detail?._id);
														if (existingItemIndex>-1) {
															carts[existingItemIndex].quantity = Number(value);
														} 
														// console.log('value',existingItemIndex);
														localStorage.setItem("carts", JSON.stringify(carts));
														setCarts(carts);
													}}
												>
												</InputNumber>
												<div>x</div>
												<div className='price'>
													{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item?.detail?.price ?? 0)}
												</div>
											</Col>
											<Col md={5} className='' style={isMobile?{padding:'10px 0 0 0'}:{paddingLeft:20}}>
												<span style={{padding:"0 10px"}}>{"="}</span>
												<span style={{color:"red", fontWeight:"bold"}}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(item?.quantity)*(item?.detail?.price ?? 0))}</span>
											</Col>
											<Col md={1} className={isMobile?"df jcfe":'df aic jcsc cpi'}>
												<Popconfirm
													title="Xóa khỏi giỏ hàng"
													placement="bottom"
													description="Bạn có chắc chắn muốn xóa sách khỏi giỏ hàng?"
													onConfirm={() => {
														delete infoCart[index];
														const infoLocal = infoCart.filter((itm:any)=>itm!=null);
														localStorage.setItem("carts", JSON.stringify(infoLocal));
														setCarts(infoLocal);
														notification.success({
															message:"Thông báo",
															description: "Xóa khỏi giỏ hàng thành công",
														});
													}}
													okText="Đồng ý"
													cancelText="Hủy"
												>
													<DeleteOutlined/>
												</Popconfirm>
											</Col>
										</Col>
									</div>
								)
							})
						}
					</Col>
					{(step===0)?<OrDer />:<PayPal />}
				</div>}
			</div>
		</div>
	</div>
)
}
export default OrderPage;