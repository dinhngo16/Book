import { bulkCreatUserAPI, deleteUserAPI, editUserAPI, getOrderAPI, getUserAPI } from '@/services/api';
import { ExportOutlined, ImportOutlined, InboxOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Button, notification, Space, Tag, Drawer, DescriptionsProps, Descriptions, Avatar, FormProps, Form, Input, message, Modal, InputNumber, Table} from 'antd';
import { useEffect, useRef } from 'react';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { dateRangeValidate } from '@/services/helper';
import { useState } from 'react';
import { Badge } from 'antd';
import { Upload } from 'antd';
import { CSVLink } from 'react-csv';
import { Popconfirm } from 'antd';
import type { PopconfirmProps } from 'antd';




const TableOrder = () => {
    const [open, setOpen] = useState<boolean>(false);
    const [info, setInfo] = useState<iOrderTable>();
    const [isopenF, setopenF] = useState<boolean>(false);
    const [csvData, setCsvData] = useState<string[]>([]);
    
    //hiển thị drawer
    const showLoading = (entity:any) => {
        setOpen(true);
        setInfo(entity);
    };
    const cancel: PopconfirmProps['onCancel'] = (e) => {
        console.log(e);
        message.error('Click on No');
    };
    const columns: ProColumns<iOrderTable>[] = [
        {
            dataIndex: 'index',
            title: 'STT',
            valueType: 'indexBorder',
            width: 48,
        },
        {
            title: 'ID',
            dataIndex: '_id',
            hideInSearch: true,
            render: (dom, entity, index, action, schema) => {
                return <Tag onClick={() => showLoading(entity)} color='blue'>{entity._id}</Tag>
            }
    
        },
        {
            title: 'Full Name',
            dataIndex: 'name',
        },
        {
            title: 'SĐT',
            dataIndex: 'phone',
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            hideInSearch: true,
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalPrice',
            hideInSearch: true,
            render: (_, record) => {
                return `${record?.totalPrice||0}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')+" đ"
            }
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            valueType: 'dateTime',
            sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
            defaultSortOrder: 'descend', 
            hideInSearch: true,
        },
        {
            title: 'Created At',
            dataIndex: 'createdAtRange',
            valueType: 'dateRange',
            hideInTable: true,
        },
    ]; 
    // khai báo định dạng
    type TSearch = {
        name?: string;
        phone?: number;
        createdAtRange?: string;
    }
    const actionRef = useRef<ActionType>();
    const cU = (new Date(""+(info?.createdAt))).toLocaleString("vi-VN"); 

    //dữ liệu user hiển thị drawer
    // const items: DescriptionsProps['items'] = [
    //     {
    //         key: '1',
    //         label: 'ID',
    //         children: <>{info?._id}</>
    //     },
    //     {
    //         key: '2',
    //         label: 'Họ và tên',
    //         children: <>{info?.fullName}</>,
    //     },
    //     {
    //         key: '3',
    //         label: 'Email',
    //         children: 'YES',
    //     },
    //     {
    //         key: '4',
    //         label: 'Số điện thoai',
    //         children: <>{info?.phone}</>,
    //     },
    //     {
    //         key: '5',
    //         label: 'Role',
    //         children: <Badge status="processing" text={info?.role} />,
    //     },
    //     {
    //         key: '5',
    //         label: 'Avatar',
    //         children: <Avatar size={40} src={urlAvatar} />,
    //     },
    //     {
    //         key: '6',
    //         label: "Created At",
    //         children: <>{cU}</>,
    //     },
    //     {
    //         key: '7',
    //         label: 'updated At',
    //         children:  <>{uU}</>,
    //     },
    // ];
   
    console.log("info",info,cU,isopenF );
    return (
        <>
            {/* <Drawer
                closable
                destroyOnClose
                title={<b>User Info</b>}
                placement="right"
                open={open}
                size='large'
                onClose={() => setOpen(false)}
            >
                <Descriptions title={info?.fullName} layout="horizontal" column={2} bordered items={items} />
            </Drawer> */}
            <ProTable<iOrderTable, TSearch>
                columns={columns}
                actionRef={actionRef}
                cardBordered
                request={async (params, sort, filter) => {
                    console.log(params, sort, filter);
                    let query = "";
                    if (params) {
                        query += `current=${params.current}&pageSize=${params.pageSize}`;
                        if(!!params.name){
                            query += `&fullName=/${params.name}/i`;
                        }
                        if(!!params.phone){
                            query += `&phone=/${params.phone}/i`;
                        }
                        const creatDateRange = dateRangeValidate(params.createdAtRange);
                        if(creatDateRange){
                            query += `&createdAt>=${creatDateRange[0]}&createdAt<=${creatDateRange[1]}`;
                        }
                    }
                    //default
                    query += `&sort= -createdAt`;
                    const res = await getOrderAPI(query);
                    const rows = (res?.data?.result ?? []) as unknown as iOrderTable[];
                    console.log("1111111111",res);
                    return {
                        data: rows,
                        "page": 1,
                        "success": true,
                        "total": res?.data?.meta?.total || 0,
                    }

                }}
                editable={{
                    type: 'multiple',
                }}
                rowKey="_id"
                pagination={{
                    // pageSize: 5,
                    // total: res?.data?.meta?.total || 0,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    onChange: (page) => console.log(page),
                }}
                dateFormatter="string"
                headerTitle="Table Order"
            />
        </>
    );
};

export default TableOrder;