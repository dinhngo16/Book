import { bulkCreatUserAPI, deleteUserAPI, editUserAPI, getUserAPI } from '@/services/api';
import { ExportOutlined, ImportOutlined, InboxOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Button, notification, Space, Tag, Drawer, DescriptionsProps, Descriptions, Avatar, FormProps, Form, Input, message, Modal, InputNumber, Table} from 'antd';
import { useEffect, useRef } from 'react';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { dateRangeValidate } from '@/services/helper';
import { useState } from 'react';
import { Badge } from 'antd';
import { addUserAPI } from '@/services/api';
import { Upload } from 'antd';
const { Dragger } = Upload;
import type { UploadProps } from 'antd';
import * as Exceljs from 'exceljs';
import { CSVLink } from 'react-csv';
import { Popconfirm } from 'antd';
import type { PopconfirmProps } from 'antd';

//Add user modal
const AddUserModal: React.FC<{ open: boolean; onCancel: () => void; onSuccess: () => void }> = ({ open, onCancel, onSuccess }) => {
    type FieldType = {
        fullName?: string;
        password?: string;
        email?: string;
        phone?: string;
    };

    const [form] = Form.useForm();

    const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
        const { email, fullName, password, phone } = values;
        const res = await addUserAPI(fullName || "", email || "", password || "", phone || "");
        if (res.data) {
            notification.success({
                message:"Thêm mới thành công",
                description: "Thêm mới người dùng thành công",
            });
            form.resetFields();
            onSuccess();
            onCancel();
        } else {
            notification.error({
                message:"Thêm mới thất bại",
                description: res.message && res.message,
            });
        }
    };

    return (
        <Modal
            title="Thêm mới người dùng"
            open={open}
            onOk={() => form.submit()}
            onCancel={onCancel}
            destroyOnClose
            okText="Thêm mới"
            cancelText="Hủy"
        >
            <Form form={form} layout="vertical" name="userForm" onFinish={onFinish}>
                <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập SĐT!' }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
                    <Input.Password />
                </Form.Item>
            </Form>
        </Modal>
    );
};

//Update user modal
const UpdateUserModal: React.FC<{ dataID:any, open: boolean; onCancel: () => void; onSuccess: () => void }> = ({ open, onCancel, onSuccess ,dataID}) => {
    type FieldType = {
        fullName?: string;
        password?: string;
        email?: string;
        phone?: string;
    };
    const [form] = Form.useForm();
    useEffect(() => {
        form.setFieldsValue({
            fullName: dataID?.fullName,
            email: dataID?.email,
            phone: dataID?.phone,
        });
    }, [dataID]);

    const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
        const { fullName, phone } = values;
        // console.log("dataID",dataID,values);
        const res = await editUserAPI(dataID?._id, fullName || "",  phone || "");
        if (res.data) {
            notification.success({
                message:"Cập nhật thành công",
                description: "Cập nhật người dùng thành công",
            });
            form.resetFields();
            onSuccess();
            onCancel();
        } else {
            notification.error({
                message:"Cập nhật thất bại",
                description: res.message && res.message,
            });
        }
    };
    console.log("dataID",dataID);
    return (
        <Modal
            title="Cập nhât người dùng"
            open={open}
            onOk={() => form.submit()}
            onCancel={onCancel}
            destroyOnClose
            okText="Câp nhật"
            cancelText="Hủy"
        >
            <Form form={form} layout="vertical" name="userForm" onFinish={onFinish}>
                <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]}>
                    <Input disabled />
                </Form.Item>
                <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}>
                    <Input  />
                </Form.Item>
                <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập SĐT!' }]}>
                    <Input />
                </Form.Item>
            </Form>
        </Modal>
    );
};


//Import user table
const ImportUserModal: React.FC<{ open: boolean; onCancel: () => void; onSuccess: () => void }> = ({ open, onCancel, onSuccess }) => {
    interface IDataImport {
        fullName: string;
        email: string;
        phone: string;
    };
    const [dataImport, setDataImport] = useState<IDataImport[]>([]); // State to hold imported data
    const props: UploadProps = {
        name: 'file',
        multiple: !1,
        maxCount: 1,
        accept: '.xlsx',
        customRequest: ({file, onSuccess}) => {
            onSuccess && onSuccess("ok");
        },
        async onChange(info) {
            const { status } = info.file;
            if (status !== 'uploading') {
            
            }
            if (status === 'done') {
                message.success(`${info.file.name} thành công.`);
                if(info.fileList && info.fileList.length > 0) {
                    const file = info.fileList[0].originFileObj;
                    //load file buffer
                    const workbook = new Exceljs.Workbook();
                    if(file){
                        const arrBuffer = await file.arrayBuffer();
                        await workbook.xlsx.load(arrBuffer);
                    }
                    //chuyển sang dạng JON
                    let jsonData: IDataImport[] = [];
                    workbook.worksheets.forEach(function(sheet) {
                        // read first row as data keys
                        let firstRow = sheet.getRow(1);
                        if (!firstRow.cellCount) return;
                        let keys = firstRow.values as any;
                        sheet.eachRow((row, rowNumber) => {
                            if (rowNumber == 1) return;
                            let values = row.values as any;
                            let obj = {} as any;
                            for (let i = 1; i < keys.length; i ++) {
                                obj[keys[i]] = values[i];
                            }
                            jsonData.push(obj);
                        })

                    });
                    jsonData = jsonData.map((item,index) => {
                        return {...item, id: index+1}
                    })
                    setDataImport(jsonData);
                    console.log("jsonData",jsonData);
                }
            } else if (status === 'error') {
                message.error(`${info.file.name} thất bại.`);
            }
        },
        onDrop(e) {
            console.log('Dropped files', e.dataTransfer.files);
        },
    };
    //xử lý import
    const handleImport = async () => {
        if(dataImport.length === 0){
            message.error("Chưa có dữ liệu để import");
            return;
        }else{
            const dataSubmit = dataImport.map(item => ({
                fullName: item.fullName,
                email: item.email,
                phone: item.phone,
                password: import.meta.env.VITE_USER_CREATE_DEFAULT_PASSWORD
            }));
            console.log("dataSubmit",dataSubmit);
            const res = await bulkCreatUserAPI(dataSubmit);
            if(res.data){
                notification.success({
                    message: "Import thành công",
                    description: `Import thành công ${res.data.countSuccess} user. ${res.data.countError} user import thất bại.`,
                });
            }
        }
    }
    return (
        <Modal
            title="Import user từ file Excel"
            open={open}
            onOk={() => {handleImport()}}
            onCancel={() => {
                setDataImport([]);
                onCancel();
            }}
            destroyOnClose = {true}
            okText="Import"
            okButtonProps={{ disabled: dataImport.length === 0 }}
            cancelText="Hủy"
        >
             <Dragger {...props}>
                <p className="ant-upload-drag-icon">
                <InboxOutlined />
                </p>
                <p className="ant-upload-text">Click or drag file to this area to upload</p>
                <p className="ant-upload-hint">
                Support for a single or bulk upload. Strictly prohibited from uploading company data or other
                banned files.
                </p>
            </Dragger>
            <div style={{paddingTop:20}}>
                <Table 
                    rowKey= {"id"}
                    title= {()=><b>Thông tin import</b>}
                    dataSource={dataImport}
                    columns={[
                        {title: 'Họ và tên',dataIndex: 'fullName',},
                        {title: 'Email',dataIndex: 'email'},
                        {title: 'SĐT', dataIndex: 'phone'},
                    ]}
                />
            </div>
        </Modal>
    );
};

const TableUser = () => {
    const [open, setOpen] = useState<boolean>(false);
    const [openI, setOpenI] = useState<boolean>(false);
    const [info, setInfo] = useState<iUserTable>();
    const [isopenF, setopenF] = useState<boolean>(false);
    const [isopenU, setopenU] = useState<boolean>(false);
    const [csvData, setCsvData] = useState<iUserTable[]>([]);
    const [dataID, setDataID] = useState<iUserTable>();
    
    //hiển thị drawer
    const showLoading = (entity:any) => {
        setOpen(true);
        setInfo(entity);
    };
    const deleteUser = async (id:string) => {
        const res = await deleteUserAPI(id);
        if(res.data){ 
            notification.success({
                message:"Xóa thành công",
                description: "Xóa người dùng thành công",
            });
            actionRef.current?.reload();
        } else {
            notification.error({
                message:"Xóa thất bại",
                description: res.message && res.message,
            }); 
          }
    }

    const cancel: PopconfirmProps['onCancel'] = (e) => {
        console.log(e);
        message.error('Click on No');
    };
    const columns: ProColumns<iUserTable>[] = [
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
            dataIndex: 'fullName',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            copyable: true,
            ellipsis: true,
        },
        {
            title: 'SĐT',
            dataIndex: 'phone',
            hideInSearch: true,
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
        {
            title: 'Action',
            hideInSearch: true,
            dataIndex: 'action', // dataIndex phải là string, không được để là icon hoặc JSX
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => {
                            setopenU(true);
                            setDataID(record);
                        }}
                    />
                    <Popconfirm
                        title="Xóa người dùng"
                        placement="topRight"
                        description="Bạn có chắc chắn muốn xóa người dùng này?"
                        onConfirm={() => {
                            deleteUser(record._id);
                        }}
                        onCancel={cancel}
                        okText="Đồng ý"
                        cancelText="Hủy"
                    >
                        <Button
                            type="link"
                            icon={<DeleteOutlined />}
                            danger
                        />
                    </Popconfirm>
                </Space>
            ),
            width: 80,
        },
    ]; 
    // khai báo định dạng
    type TSearch = {
        fullName?: string;
        email?: string;
        phone?: string;
        createdAtRange?: string;
    }
    const actionRef = useRef<ActionType>();
    const cU = (new Date(""+(info?.createdAt))).toLocaleString("vi-VN"); //quy đổi theo định dạng vi-VN
    const uU = (new Date(""+(info?.updatedAt))).toLocaleString("vi-VN");
    const urlAvatar = `${import.meta.env.VITE_BACKEND_URL}/images/avatar/${info?.avatar}`;

    //dữ liệu user hiển thị drawer
    const items: DescriptionsProps['items'] = [
        {
            key: '1',
            label: 'ID',
            children: <>{info?._id}</>
        },
        {
            key: '2',
            label: 'Họ và tên',
            children: <>{info?.fullName}</>,
        },
        {
            key: '3',
            label: 'Email',
            children: 'YES',
        },
        {
            key: '4',
            label: 'Số điện thoai',
            children: <>{info?.phone}</>,
        },
        {
            key: '5',
            label: 'Role',
            children: <Badge status="processing" text={info?.role} />,
        },
        {
            key: '5',
            label: 'Avatar',
            children: <Avatar size={40} src={urlAvatar} />,
        },
        {
            key: '6',
            label: "Created At",
            children: <>{cU}</>,
        },
        {
            key: '7',
            label: 'updated At',
            children:  <>{uU}</>,
        },
    ];
   
    console.log("info",info,cU,isopenF );
    return (
        <>
            <AddUserModal
                open={isopenF}
                onCancel={() => setopenF(false)}
                onSuccess={() => actionRef.current?.reload()}
            />
            <UpdateUserModal 
                open={isopenU}
                onCancel={() => setopenU(false)}
                onSuccess={() => actionRef.current?.reload()}
                dataID={dataID}
            />
            <ImportUserModal 
                open={openI}
                onCancel={() => setOpenI(false)}
                onSuccess={() => actionRef.current?.reload()}
            />
            <Drawer
                closable
                destroyOnClose
                title={<b>User Info</b>}
                placement="right"
                open={open}
                size='large'
                onClose={() => setOpen(false)}
            >
                <Descriptions title={info?.fullName} layout="horizontal" column={2} bordered items={items} />
            </Drawer>
            <ProTable<iUserTable, TSearch>
                columns={columns}
                actionRef={actionRef}
                cardBordered
                request={async (params, sort, filter) => {
                    console.log(params, sort, filter);
                    let query = "";
                    if (params) {
                        query += `current=${params.current}&pageSize=${params.pageSize}`;
                        if(params.fullName){
                            query += `&fullName=/${params.fullName}/i`;
                        }
                        if(params.email){
                            query += `&email=/${params.email}/i`;
                        }
                        const creatDateRange = dateRangeValidate(params.createdAtRange);
                        if(creatDateRange){
                            query += `&createdAt>=${creatDateRange[0]}&createdAt<=${creatDateRange[1]}`;
                        }
                    }
                    //default
                    query += `&sort= -createdAt`;
                    const res = await getUserAPI(query);
                    setCsvData(res?.data?.result ?? []);
                    return {
                        data: res?.data?.result ,
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
                headerTitle="Table user"
                toolBarRender={() => [
                    <Button
                        key="button"
                        icon={<PlusOutlined />}
                        onClick={() => setopenF(true)}
                        type="primary"
                    >
                        Add new
                    </Button>,
                    <Button
                        key="button"
                        icon={<ImportOutlined />}
                        onClick={() => setOpenI(true)}
                        type="primary"
                    >
                        Import
                    </Button>,
                    <Button
                        key="button"
                        icon={<ExportOutlined />}
                        onClick={() => {
                        }}
                        type="primary"
                    >
                        <CSVLink data={csvData} filename='dataUser'>Export</CSVLink>
                    </Button>
                ]}
            />
        </>
    );
};

export default TableUser;