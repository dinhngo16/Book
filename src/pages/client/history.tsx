import { getHistory } from "@/services/api";
import { Badge, Popover, Table } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


const History = () => {
    const [dataHistory,setDataHistory] = useState<string[]>([]);
    const navigator = useNavigate();
    useEffect(() =>{
        const getDataHistory = async () => {
            const res = await getHistory();
            if(res&&res.data){
                setDataHistory(res?.data)
            }
        };
        getDataHistory()
    },[]);
    const dataSource = dataHistory.map((item:any,index)=>{
        const contentHistory = () => {
            return (
                <div className="pa10">
                    <Table dataSource={(item.detail||[]).map((item1:any,index1:number)=>{
                        return {
                            key: index1+1,
                            bookName: item1.bookName,
                            quantity:item1.quantity,
                        }
                    })} columns={[
                        {
                            title: 'STT',
                            dataIndex: 'key',
                            key: 'key',
                        },
                        {
                            title: 'Tên sách',
                            dataIndex: 'bookName',
                            key: 'bookName',
                        },
                        {
                            title: 'Số lượng',
                            dataIndex: 'quantity',
                            key: 'quantity',
                        },
                    ]} />
                </div>
            )
        };
        return {
            key: index+1,
            createdAt: (new Date(""+(item?.createdAt))).toLocaleString("vi-VN"),
            quantity: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item?.totalPrice),
            tt: <div className="df aic " ><div className="pa5" style={{backgroundColor:"#59de26",borderRadius:5,color:"#fff"}}>Thành công</div> </div>,
            "preview": <Popover
                        className="popover-carts"
                        placement="topRight"
                        rootClassName="popover-carts"
                        title={"Chi tiết đơn hàng"}
                        content={contentHistory}
                        arrow={true}>
                        <Badge
                        >
                            <div className="cpi shineh" style={{color:"#1d00ff",textDecoration:"underline"}}>Xem đơn</div>
                        </Badge>
                    </Popover>
        }
    });

    const columns = [
         {
            title: 'STT',
            dataIndex: 'key',
            key: 'key',
        },
        {
            title: 'Thời gian mua hàng',
            dataIndex: 'createdAt',
            key: 'createdAt',
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'quantity',
            key: 'quantity',
        },
        {
            title: 'Tình trạng',
            dataIndex: 'tt',
            key: 'tt',
        },
        {
            title: 'Chi tiết đơn hàng',
            dataIndex: 'preview',
            key: 'preview',
        }
    ];

    return (
        <div className="aboutBook" style={{textAlign:"center"}} >
            <div className='df aic' style={{paddingBottom:15}}>
				<div className='cpi shineh' onClick={()=>navigator("/")} style={{color:"Highlight",padding:10}}>Trang chủ </div>
				&gt;
				<div style={{color:"Highlight",padding:10}}>Lịch sử mua hàng</div>
			</div>
            <Table dataSource={dataSource} columns={columns} />
        </div>
    )
};
export default History 