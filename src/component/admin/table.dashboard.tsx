import { Card, Col, Statistic } from 'antd';
import { FileProtectOutlined, LikeOutlined, TeamOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { getDBAPI, getOrderAPI } from '@/services/api';
import { StatisticProps } from 'antd/lib';
import CountUp from 'react-countup';
import { FiShoppingCart } from 'react-icons/fi';
import { Bar, Line } from 'react-chartjs-2';
import 'chart.js/auto';
import { ChartOptions } from 'chart.js/auto';

const TableDashboard = () => {
    const [dataDB,setDataDB] = useState<any>();
    const [dataHis,setDataHis] = useState<any>();
    useEffect(()=>{
        const getDataDB = async () => {
            const resB = await getDBAPI();
            console.log('arrBook', resB);
            if(resB && resB.data){
                setDataDB(resB.data);
            }
        };
        const getDataHist = async () => {
            const resO = await getOrderAPI(`&sort= -createdAt`);
            console.log('arrBook', resO);
            if(resO && resO.data){
                setDataHis(resO.data);
            }
        };
        getDataHist();
        getDataDB()
    },[]);
    const formatter: StatisticProps['formatter'] = (value) => (
        <CountUp end={value as number} separator="," />
    );
    const dataC = dataHis?.result.flatMap((á:any)=>{
        return (á.detail||[]).map((ú:any)=>{
            return ú
        })
    });
    const dataTK = (dataC||[]).reduce((acc:any, currentItem:any) => {
        const id = currentItem._id;
        if (acc[id]) {
            // Nếu đã tồn tại, cộng dồn số lượng
            acc[id].quantity += currentItem.quantity;
        } else {
            // Nếu chưa tồn tại, thêm mới với dữ liệu hiện tại
            acc[id] = { ...currentItem };
        }
        return acc;
    },{});
    const data = {
        // Nhãn (Labels) hiển thị trên trục X (các danh mục)
        labels: (Object.values(dataTK)).map((á:any)=>{
            return á.bookName
        }),
        datasets: [
        {
            label: 'Số lượng đơn đặt hàng (đơn)', // Tiêu đề của cột
            data: (Object.values(dataTK)).map((á:any)=>{
                return á.quantity
            }),
            backgroundColor: [
            'rgba(255, 99, 132, 0.5)', 
            'rgba(54, 162, 235, 0.5)', 
            'rgba(255, 206, 86, 0.5)', 
            'rgba(75, 192, 192, 0.5)', 
            ],
            borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            ],
            borderWidth: 1,
        },
        ],
    };

    const options:ChartOptions<'bar'> = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Biểu đồ Số lượng đơn được đặt',
            },
        }
    };
    return (
        <>
            <div className='df jcsb'>
                <Card className='w1' style={{margin:10}} title="Đơn hàng đã đặt">
                    <Statistic formatter={formatter} title="Đơn hàng" value={dataDB?.countOrder} prefix={<FiShoppingCart />} />
                </Card>
                <Card className='w1' style={{margin:10}} title="Số lượng sách còn lại" bordered={false}>
                    <Statistic formatter={formatter} title="Quyển" value={dataDB?.countBook} prefix={<FileProtectOutlined />} />
                </Card>
                <Card className='w1' style={{margin:10}} title="Số lượng tài khoản" bordered={false}>
                    <Statistic formatter={formatter} title="Tài khoản" value={dataDB?.countUser} prefix={<TeamOutlined />} />
                </Card>
            </div>
            <div>
                <Col span={12}>
                    <Bar data={data} options={options} />
                </Col>
            </div>
        </>
    );
};

export default TableDashboard;