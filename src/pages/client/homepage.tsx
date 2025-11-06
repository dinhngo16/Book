import { FilterOutlined,RedoOutlined } from "@ant-design/icons";
import { Row, Col, Form, Checkbox, InputNumber, Button, Tabs, Pagination, Spin, FormProps } from "antd";
import './homepage.scss';
import { TabsProps } from "antd/lib";
import { useState, useEffect } from "react";
import { dataSL, getBookAPI } from "@/services/api";
import { Navigate, useNavigate, useOutletContext } from "react-router-dom";

const HomePage = () => {
	const [form] = Form.useForm();
	const [checkedList, setCheckedList] = useState([{label:"",value:""}]);
	const [dataBook, setDataBook] = useState<any>([]);
	const [dataBookA, setDataBookA] = useState<any>([]);
	const [loading, setLoading] = useState(false);
	const [tabL, setTabL] = useState("sort=-sold");
	const [categoryS, setCategoryS] = useState("");
	const [priceS, setPriceS] = useState([0,100000000]);
	const [searchTerm] = useOutletContext() as any;
	
	type FieldType = {
		category?: string[];
		range?: {from?: number; to?: number};
	};
	
	const onChange = (key: string) => {
 		 console.log(key);
	};
	const formatter = new Intl.NumberFormat('vi-VN', {
		style: 'currency',
		currency: 'VND',
	});
	const handlePageChange = (page:number, pageSize:number) => {
		setLoading(true);
		setPageH({page:page,PageSize:pageSize});
		// Gọi API hoặc cập nhật dữ liệu hiển thị dựa trên trang và kích thước trang mới
	}

	useEffect(() =>{
		const getCategory = async () => {
			const res = await dataSL();
			const resBA = await getBookAPI("");
			if(res && res.data){
				const op = res.data.map(á=>{
					return {label:á,value:á}
				});
				setCheckedList(op);
				setDataBookA(resBA?.data || []);
			}
		};
		getCategory()
	},[]);
	const [pageH, setPageH] = useState({page:1,PageSize:dataBookA.length||8});
	useEffect(() =>{
		const getDataBook = async () => {
			setLoading(true);
			var query = `current=${pageH.page}&pageSize=${pageH.PageSize}`;
			if(tabL){
				query += `&${tabL}`;
			};
			if(categoryS){
				query += `&category=${categoryS}`;
			};
			if(priceS){
				query += `&price>${priceS[0]}&price<${priceS[1]}`;
			};
			if(searchTerm){
				query += `&mainText=/${searchTerm}/i`
			};
			const resB = await getBookAPI(query);
			if(resB && resB.data){
				setLoading(false);
				setDataBook(resB?.data?.result);
			}
		};
		getDataBook()
	},[pageH,tabL,categoryS,priceS,searchTerm]);

	const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
		setCategoryS(values.category?.join(",")||"");
		setPriceS([values.range?.from||0,values.range?.to||100000000]);
	};
	const navigator = useNavigate()
	const items: TabsProps['items'] = [
		{
			key: 'sort=-sold',
			label: 'Phổ biến',
			children: <></>,
		},
		{
			key: 'sort=-upDateAt',
			label: 'Hàng mới',
			children: <></>,
		},
		{
			key: 'sort=price',
			label: 'Từ thấp đến cao',
			children: <></>,
		},
		{
			key: 'sort=-price',
			label: 'Từ cao đến thấp',
			children: <></>,
		},
	];
	return (
		<div className="app-header" style={{maxWidth:1440, margin:" 0 auto"}}>
			<Row gutter={[20,20]}>
				<Col md={4} xs={0} className="bóng" style={{padding:"10px"}}>
					<div className="df jcsb aic">
						<span><FilterOutlined />Bộ lọc tìm kiếm</span>
						<span style={{cursor:"pointer"}} onClick={()=>{
							form.resetFields();
							setTabL("sort=-sold");
							setPageH({page:1,PageSize:8});
							setCategoryS("");
							setPriceS([0,100000000]);
						}}><RedoOutlined/></span>
					</div>
					<Form
						form = {form}
						onFinish={onFinish}
					>
						<Form.Item
							name="category"
							label="Danh mục sản phẩm"
							labelCol={{span:24}}
						>
							<Checkbox.Group style={{ width: '100%' }} onChange={()=>{}}>
								<Row>
									{checkedList.map((item)=>
										<Col span={24} key={item.value} style={{paddingBottom:"5px"}}>
											<Checkbox value={item.value}>{item.label}</Checkbox>
										</Col>
									)}
								</Row>
							</Checkbox.Group>
						</Form.Item>
						<Form.Item
							label="Khoảng giá"
							labelCol={{span:24}}
						>
							<div className="df jcsb">
								<Form.Item name={["range","from"]}>
									<InputNumber 
										name="from"
										placeholder="đ"
										// min={0}
										className="ôIP"
										formatter={(value) => 
											`${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')  // Hiển thị dấu chấm
										}
										parser={(value) => 
											value?.replace(/\./g, '') || ''  // Loại bỏ dấu chấm khi nhập lại
										}
									/>
								</Form.Item>
								<span>-</span>
								<Form.Item name={["range","to"]}>
									<InputNumber 
										name="to"
										placeholder="đ"
										// min={0}
										className="ôIP"
										formatter={(value) => 
											`${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')  // Hiển thị dấu chấm
										}
										parser={(value) => 
											value?.replace(/\./g, '') || ''  // Loại bỏ dấu chấm khi nhập lại
										}
									/>
								</Form.Item>
							</div>
							<div>
								<Button
									onClick={() => form.submit()}
									className="w1"
									type="primary"
								>Áp dụng</Button>
							</div>
						</Form.Item>
					</Form>
				</Col>
				<Col md={20} xs={24} className="bóng" style={{padding:"0 10px"}}>
					<Row>
						<Tabs defaultActiveKey="1" activeKey={tabL} items={items} onChange={(value) => {setTabL(value)}} />
					</Row>
					<Spin spinning={loading} delay={500} tip="Đang tải dữ liệu...">
						<Row>
							{(dataBook||[]).map((item:any,index:any)=>
								<Col key={'book'+index} md={6} xs={12} >
									<div className="wapper pa10">
										<div className="bóng pa5" style={{color:"black", borderRadius: "5px"}}>
											<div className="thumbnail df jcsc">
												<div className="anh1" style={{backgroundImage:`url("${import.meta.env.VITE_BACKEND_URL}/images/book/${item.thumbnail}")`}}></div>
												{/* <img style={{width:"80%"}} src={"http://localhost:8080/images/book/"+ item.thumbnail} alt="" /> */}
											</div>
											<div onClick={()=>{navigator("/book/"+item._id)}}  className="text pa5 wbox1" style={{cursor:"pointer",minHeight:40,paddingTop:10}}>{item.mainText}</div>
											<div className="price pa5">
												<div className="current-price" >Giá: {formatter.format(item?.price)} </div>
											</div>
											<div className="rate pa5">
												<div className="category">Thể loại: {item?.category}</div>
											</div>
											<div className="rate pa5 df jcsb">
												<div className="category">Đã bán: {item?.sold||2}</div>
												<div style={{paddingTop:"15px"}}>⭐⭐⭐⭐⭐</div >
											</div>
											<div className="add-to-cart pa5">
												<Button onClick={()=>{navigator("/book/"+item._id)}} type="primary" className="w1">Xem chi tiết</Button>
											</div>
										</div>
									</div>
								</Col>
							)}
						</Row>
					</Spin>
					<Row>
						<Pagination 
							current={pageH?.page} //Số trang hiện tại đang được hiển thị
							pageSize={8}//{pageH?.PageSize||8} //Số lượng mục tối đa trên mỗi trang (Limit)
							total={dataBookA.length} //Tổng số mục dữ liệu có sẵn (không phải tổng số trang).
							// showSizeChanger={true} //Cho phép người dùng thay đổi pageSize (Limit).
							onChange={(page, pageSize)=>{handlePageChange(page, 8)}}
							className="pa10 df jcsc aic w1" 
							style={{padding: "30px 0"}}
						/>
					</Row>
				</Col>
			</Row>
		</div>
	)
};

export default HomePage;