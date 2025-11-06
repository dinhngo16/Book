import { creatBook, dataSL, deleteBookAPI, editBookAPI, getBookAPI, uploadFile } from '@/services/api';
import { ExportOutlined, PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { Button, notification, Space, Tag, Drawer, DescriptionsProps, Descriptions, Select, FormProps, Form, Input, message, Modal, InputNumber, Table, Row, Col } from 'antd';
import { useEffect, useRef } from 'react';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { dateRangeValidate } from '@/services/helper';
import { useState } from 'react';
import { Badge } from 'antd';
import { Upload } from 'antd';
import type { UploadProps, GetProp, UploadFile } from 'antd';
import { Image } from 'antd';
import { CSVLink } from 'react-csv';
import { Popconfirm } from 'antd';
import type { PopconfirmProps } from 'antd';
import './book.scss'
import { v4 as uuidv4 } from 'uuid';
import { UploadRequestOption as RcCustomRequestOptions } from 'rc-upload/lib/interface';



const ManageBookPage = () => {
    const [open, setOpen] = useState<boolean>(false);
    const [info, setInfo] = useState<iBookTable>();
    const [isopenF, setopenF] = useState<boolean>(false);
    const [isopenU, setopenU] = useState<boolean>(false);
    const [csvData, setCsvData] = useState<iBookTable[]>([]);
    const [dataID, setDataID] = useState<iBookTable>();
    
    //hiển thị drawer
    const showLoading = (entity:any) => {
        setOpen(true);
        setInfo(entity);
    };
    const deleteBook = async (id:string) => {
        const res = await deleteBookAPI(id);
        if(res.data){ 
            notification.success({
                message:"Xóa thành công",
                description: "Xóa sách thành công",
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
    const columns: ProColumns<iBookTable>[] = [
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
            title: 'Tên sách',
            dataIndex: 'mainText',
        },
        {
            title: 'Thể loại',
            dataIndex: 'category',
        },
        {
            title: 'Tên tác giả',
            dataIndex: 'author',
        },
        {
            title: 'Giá tiền',
            dataIndex: 'price',
            render: (_, record) => {
                return `${record?.price||0}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')+" đ"
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
                        title="Xóa sách"
                        placement="topRight"
                        description="Bạn có chắc chắn muốn xóa sách này?"
                        onConfirm={() => {
                            deleteBook(record._id);
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
        mainText?: string;
        author?: string;
        createdAtRange?: string;
    }
    const actionRef = useRef<ActionType>();
    const cU = (new Date(""+(info?.createdAt))).toLocaleString("vi-VN"); //quy đổi theo định dạng vi-VN
    const uU = (new Date(""+(info?.updatedAt))).toLocaleString("vi-VN");
    // const urlAvatar = `${import.meta.env.VITE_BACKEND_URL}/images/avatar/${info?.avatar}`;

    //dữ liệu book hiển thị drawer
    const items: DescriptionsProps['items'] = [
        {
            key: '1',
            label: 'ID',
            children: <>{info?._id}</>
        },
        {
            key: '2',
            label: 'Tên sách',
            children: <>{info?.mainText}</>,
        },
        {
            key: '3',
            label: 'Tác giá',
            children:  <>{info?.author}</>,
        },
        {
            key: '4',
            label: 'Giá tiền',
            children: <>{Number(info?.price).toLocaleString("vi-VN")} VNĐ</>,
        },
        {
            key: '5',
            label: 'Thể loại',
            span:2,
            children: <Badge status="processing" text={info?.category} />,
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
   
    //upfile 
    type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];
    const getBase64 = (file: FileType): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    useEffect(()=>{
        if(info){
            let slider1 : UploadFile[]= [], tmn: any={};
            (info?.slider||[]).map(á=>{
                slider1.push({
                    uid: uuidv4(),
                    name: á,
                    status: 'done',
                    url: `${import.meta.env.VITE_BACKEND_URL}/images/book/${á}`
                })
            });
            tmn = {
                uid: uuidv4(),
                name: info?.thumbnail,
                status: 'done',
                url: `${import.meta.env.VITE_BACKEND_URL}/images/book/${info?.thumbnail}`
            };
            setFileList([tmn,...slider1])
        }
    },[info]);
    console.log(fileList)
    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
        file.preview = await getBase64(file.originFileObj as FileType);
        }
        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
    };

    const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) =>{
        console.log("11111111111",newFileList);
        setFileList(newFileList);
    }

    const beforeUpload = (file: File) => {
        const isJpgOrPng =
        file.type === 'image/jpeg' || file.type === 'image/png';
        if (!isJpgOrPng) {
        message.error('Chỉ được upload file JPG hoặc PNG!');
        }

        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
        message.error('Kích thước ảnh phải nhỏ hơn 2MB!');
        }

        return isJpgOrPng && isLt2M; // true = cho phép upload, false = chặn upload
    };

  

     //Add book modal
    const AddBookModal: React.FC<{ open: boolean; onCancel: () => void; onSuccess: () => void }> = ({ open, onCancel, onSuccess }) => {
        type FieldType = {
            mainText?: string;
            author?: string;
            price?: number;
            quantity?: number;
            category?:string;
            slider?:string[];
            data?:string[];
            thumbnail?:string;
        };
        type UserUpload = 'thumbnail'|'slider';
        const [previewOpen, setPreviewOpen] = useState(false);
        const [previewImage, setPreviewImage] = useState('');
        const [fileListUP, setFileListUP] = useState<UploadFile[]>([]);
        const [fileListUPs, setFileListUPs] = useState<UploadFile[]>([]);
        const [form] = Form.useForm();

        const handleChangeUp: UploadProps['onChange'] = (info) =>{
             let newFileList = [...info.fileList];
            newFileList = newFileList.slice(-2);
            newFileList = newFileList.map((file) => {
            if (file.response) {
                file.url = file.response.url;
            }
            return file;
            });
            setFileListUP(newFileList);
        };
         const handleChangeUps: UploadProps['onChange'] = ({ fileList: newFileList }) =>{
            setFileListUPs(newFileList);
        };
        const handlePreview = async (file: UploadFile) => {
            if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as FileType);
            }
            setPreviewImage(file.url || (file.preview as string));
            setPreviewOpen(true);
        };
        const uploadButton = (
            <button style={{ border: 0, background: 'none' }} type="button">
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
            </button>
        );
        const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
            console.log("1111111111111",values,values.thumbnail);
            // const {author,category,price,mainText,sold,thumbnail,slider} = values;
            const bookData = {
                author: values.author || "",
                category: values.category || "",
                price: values.price || 0,
                mainText: values.mainText || "",
                quantity: values.quantity || 0,
                thumbnail: fileListUP?.[0]?.name??"",
                slider: fileListUPs?.map(item=>item.name)??[],
            };
            const res = await creatBook(bookData);
            console.log("11111111111",res);
            if (res.data) {
                notification.success({
                    message:"Thêm mới thành công",
                    description: "Thêm mới sách thành công",
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
        const [option,setOption] = useState<{}[]>([]);
        useEffect(() =>{
            const getDataSelect = async () => {
                const res = await dataSL();
                if(res && res.data){
                    const op = res.data.map(á=>{
                        return {label:á,value:á}
                    });
                    setOption(op)
                }
            };
            getDataSelect()
        },[]);
        const handleUpload = async(options:RcCustomRequestOptions, type: UserUpload) => {
            const {onSuccess} = options;
            const file = options.file as UploadFile;
            const res = await uploadFile(file,"book");
            console.log("111111111111111",res);
            if(res && res.data){
                const upLoadedFile :any = {
                    uid: file.uid,
                    name: res.data.fileUploaded,
                    status:"done",
                    url: `${import.meta.env.VITE_BACKEND_URL}/images/book/${res.data.fileUploaded}`,
                };
                if(type == "thumbnail"){
                    setFileListUP([{...upLoadedFile}])
                }else if(type == "slider"){
                    setFileListUPs((prev)=>[...prev,{...upLoadedFile}])
                }
                if(onSuccess){
                    onSuccess("ok")
                }
            }
        };
        const handleRemove = async(file:UploadFile, type: UserUpload) => {
            if(type == "thumbnail"){
                setFileListUP([])
            }else if(type == "slider"){
                const newSlider = fileListUPs.filter(x => x.uid!=file.uid)
                setFileListUPs(newSlider)
            }
        };
        const normFileUP = (e: any, type: UserUpload) => {
            console.log('Upload event:', e);

            // Khi người dùng xóa file, e có thể là mảng
            if (Array.isArray(e)) {
                return e;
            };
            if(type == "thumbnail"){
                return e?.file;
            }else if(type == "slider"){
                return e?.fileList;
            }
        };
        return (
            <Modal
                title={
                    <div
                    style={{
                        borderBottom: '2px solid #1677ff',
                        display: 'inline-block',
                        paddingBottom: '10px',
                        marginBottom:"15px"
                    }}
                    >
                        Thêm mới Book
                    </div>
                }
                open={open}
                onOk={() => form.submit()}
                onCancel={()=>{
                    form.resetFields();
                    setFileListUP([]);
                    setFileListUPs([]);
                    onCancel()
                }}
                destroyOnClose
                okText="Thêm mới"
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical" name="userForm" onFinish={onFinish}>
                    <Row gutter={15}>
                        <Col span={12}>
                            <Form.Item name="mainText" label="Tên sách" rules={[{ required: true, message: 'Vui lòng nhập tên sách!' }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="author" label="Tác giả" rules={[{ required: true, message: 'Vui lòng nhập tên tác giả!' }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="price" label="Giá tiền" rules={[{ required: true, message: 'Vui lòng nhập giá tiền!' }]}>
                                <InputNumber addonAfter="đ"
                                formatter={(value) => 
                                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')  // Hiển thị dấu chấm
                                }
                                parser={(value) => 
                                    value?.replace(/\./g, '') || ''  // Loại bỏ dấu chấm khi nhập lại
                                }  />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="category" label="Thể loại" rules={[{ required: true, message: 'Vui lòng nhập đúng!' }]}>
                                <Select
                                    showSearch
                                    options={option}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="quantity"  label="Số lượng" rules={[{ required: true, message: 'Vui lòng nhập đúng!' }]}>
                                <InputNumber min={1} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="thumbnail" label="Ảnh đại diện" 
                                valuePropName='fileListUP'
                                getValueFromEvent={(e ) => normFileUP(e,'thumbnail')}
                            >
                                <Upload
                                    listType="picture-card"
                                    fileList={fileListUP}
                                    onPreview={handlePreview}
                                    onChange={handleChangeUp}
                                    onRemove={(file ) => handleRemove(file,'thumbnail')}
                                    customRequest = {(file ) => handleUpload(file,'thumbnail')}
                                    beforeUpload={beforeUpload}
                                    maxCount={1}
                                    multiple={false}
                                >
                                    {uploadButton}
                                </Upload>
                            </Form.Item>
                        </Col>
                         <Col span={12}>
                            <Form.Item name="slider" label="Ảnh slider"
                                valuePropName='fileListUPs'
                                getValueFromEvent={(e ) => normFileUP(e,'slider')}
                            >
                                <Upload
                                    listType="picture-card"
                                    fileList={fileListUPs}
                                    onPreview={handlePreview}
                                    onChange={handleChangeUps}
                                    onRemove={(file ) => handleRemove(file,'slider')}
                                    customRequest = {(file ) => handleUpload(file,'slider')}
                                    beforeUpload={beforeUpload}
                                    multiple
                                >
                                    {uploadButton}
                                </Upload>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        );
    };

    //update book
    const UpdateBookModal: React.FC<{ dataID: any,open: boolean; onCancel: () => void; onSuccess: () => void }> = ({ open, onCancel, onSuccess, dataID }) => {
        type FieldType = {
            mainText?: string;
            author?: string;
            price?: number;
            quantity?: number;
            category?:string;
            slider?:string[];
            data?:string[];
            thumbnail?:string;
        };
        type UserUpload = 'thumbnail'|'slider';
        const [fileListUP, setFileListUP] = useState<UploadFile[]>([]);
        const [fileListUPs, setFileListUPs] = useState<UploadFile[]>([]);
        const [form] = Form.useForm();
        useEffect(() => {
            console.log("11111111",dataID);
            let arrSliderNew : UploadFile[]= [], tmn: any={};
            (dataID?.slider||[]).map((á:any)=>{
                arrSliderNew.push({
                    uid: uuidv4(),
                    name: á,
                    status: 'done',
                    url: `${import.meta.env.VITE_BACKEND_URL}/images/book/${á}`
                })
            });
            tmn = {
                uid: uuidv4(),
                name: dataID?.thumbnail,
                status: 'done',
                url: `${import.meta.env.VITE_BACKEND_URL}/images/book/${dataID?.thumbnail}`
            };
            setFileListUPs([...arrSliderNew]);
            setFileListUP([tmn])
            form.setFieldsValue({
                mainText: dataID?.mainText,
                author: dataID?.author,
                price: dataID?.price,
                quantity: dataID?.quantity,
                category:dataID?.category,
                // slider:arrSliderNew,
                data:dataID?.data,
                // thumbnail:dataID?.thumbnail
            });
        }, [dataID]);
        const handleChangeUp: UploadProps['onChange'] = (info) =>{
             let newFileList = [...info.fileList];
            newFileList = newFileList.slice(-2);
            newFileList = newFileList.map((file) => {
            if (file.response) {
                file.url = file.response.url;
            }
            return file;
            });
            setFileListUP(newFileList);
        };
         const handleChangeUps: UploadProps['onChange'] = ({ fileList: newFileList }) =>{
            setFileListUPs(newFileList);
        };
        const handlePreview = async (file: UploadFile) => {
            if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as FileType);
            }
            setPreviewImage(file.url || (file.preview as string));
            setPreviewOpen(true);
        };
        const uploadButton = (
            <button style={{ border: 0, background: 'none' }} type="button">
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
            </button>
        );
        const onFinish: FormProps<FieldType>['onFinish'] = async (values) => {
            const bookData = {
                author: values.author || "",
                category: values.category || "",
                price: values.price || 0,
                mainText: values.mainText || "",
                quantity: values.quantity || 0,
                thumbnail: fileListUP?.[0]?.name??"",
                slider: fileListUPs?.map(item=>item.name)??[],
            };
            console.log("1111111111111",values,values.thumbnail,bookData);
            const res = await editBookAPI(dataID._id,bookData);
            console.log("11111111111",res);
            if (res.data) {
                notification.success({
                    message:"Lưu thành công",
                    description: "Lưu sách thành công",
                });
                form.resetFields();
                onSuccess();
                onCancel();
            } else {
                notification.error({
                    message:"Lưu thất bại",
                    description: res.message && res.message,
                });
            }
        };
        const [option,setOption] = useState<{}[]>([]);
        useEffect(() =>{
            const getDataSelect = async () => {
                const res = await dataSL();
                if(res && res.data){
                    const op = res.data.map(á=>{
                        return {label:á,value:á}
                    });
                    setOption(op)
                }
            };
            getDataSelect()
        },[]);
        const handleUpload = async(options:RcCustomRequestOptions, type: UserUpload) => {
            const {onSuccess} = options;
            const file = options.file as UploadFile;
            const res = await uploadFile(file,"book");
            console.log("111111111111111",res);
            if(res && res.data){
                const upLoadedFile :any = {
                    uid: file.uid,
                    name: res.data.fileUploaded,
                    status:"done",
                    url: `${import.meta.env.VITE_BACKEND_URL}/images/book/${res.data.fileUploaded}`,
                };
                if(type == "thumbnail"){
                    setFileListUP([{...upLoadedFile}])
                }else if(type == "slider"){
                    setFileListUPs((prev)=>[...prev,{...upLoadedFile}])
                }
                if(onSuccess){
                    onSuccess("ok")
                }
            }
        };
        const handleRemove = async(file:UploadFile, type: UserUpload) => {
            if(type == "thumbnail"){
                setFileListUP([])
            }else if(type == "slider"){
                const newSlider = fileListUPs.filter(x => x.uid!=file.uid)
                setFileListUPs(newSlider)
            }
        };
        const normFileUP = (e: any, type: UserUpload) => {
            console.log('Upload event:', e);

            // Khi người dùng xóa file, e có thể là mảng
            if (Array.isArray(e)) {
                return e;
            };
            if(type == "thumbnail"){
                return e?.file;
            }else if(type == "slider"){
                return e?.fileList;
            }
        };
        return (
            <Modal
                title={
                    <div
                    style={{
                        borderBottom: '2px solid #1677ff',
                        display: 'inline-block',
                        paddingBottom: '10px',
                        marginBottom:"15px"
                    }}
                    >
                        Chỉnh sửa sách - {dataID?.mainText}
                    </div>
                }
                open={open}
                onOk={() => form.submit()}
                onCancel={()=>{
                    form.resetFields();
                    setFileListUP([]);
                    setFileListUPs([]);
                    onCancel()
                }}
                destroyOnClose
                okText="Lưu chỉnh sửa"
                cancelText="Hủy"
            >
                <Form form={form} layout="vertical" name="userForm" onFinish={onFinish}>
                    <Row gutter={15}>
                        <Col span={12}>
                            <Form.Item name="mainText" label="Tên sách" rules={[{ required: true, message: 'Vui lòng nhập tên sách!' }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="author" label="Tác giả" rules={[{ required: true, message: 'Vui lòng nhập tên tác giả!' }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="price" label="Giá tiền" rules={[{ required: true, message: 'Vui lòng nhập giá tiền!' }]}>
                                <InputNumber addonAfter="đ"
                                formatter={(value) => 
                                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')  // Hiển thị dấu chấm
                                }
                                parser={(value) => 
                                    value?.replace(/\./g, '') || ''  // Loại bỏ dấu chấm khi nhập lại
                                }  />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="category" label="Thể loại" rules={[{ required: true, message: 'Vui lòng nhập đúng!' }]}>
                                <Select
                                    showSearch
                                    options={option}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="quantity"  label="Số lượng" rules={[{ required: true, message: 'Vui lòng nhập đúng!' }]}>
                                <InputNumber min={1} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="thumbnail" label="Ảnh đại diện" 
                                valuePropName='fileListUP'
                                getValueFromEvent={(e ) => normFileUP(e,'thumbnail')}
                            >
                                <Upload
                                    listType="picture-card"
                                    fileList={fileListUP}
                                    onPreview={handlePreview}
                                    onChange={handleChangeUp}
                                    onRemove={(file ) => handleRemove(file,'thumbnail')}
                                    customRequest = {(file ) => handleUpload(file,'thumbnail')}
                                    beforeUpload={beforeUpload}
                                    maxCount={1}
                                    multiple={false}
                                >
                                    {uploadButton}
                                </Upload>
                            </Form.Item>
                        </Col>
                         <Col span={12}>
                            <Form.Item name="slider" label="Ảnh slider"
                                valuePropName='fileListUPs'
                                getValueFromEvent={(e ) => normFileUP(e,'slider')}
                            >
                                <Upload
                                    listType="picture-card"
                                    fileList={fileListUPs}
                                    onPreview={handlePreview}
                                    onChange={handleChangeUps}
                                    onRemove={(file ) => handleRemove(file,'slider')}
                                    customRequest = {(file ) => handleUpload(file,'slider')}
                                    beforeUpload={beforeUpload}
                                    multiple
                                >
                                    {uploadButton}
                                </Upload>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        );
    };

    console.log("info",info,cU,isopenF );
    return (
        <>
            <AddBookModal
                open={isopenF}
                onCancel={() => setopenF(false)}
                onSuccess={() => actionRef.current?.reload()}
            />
            <UpdateBookModal 
                open={isopenU}
                onCancel={() => setopenU(false)}
                onSuccess={() => actionRef.current?.reload()}
                dataID={dataID}
            />
            <Drawer
                closable
                destroyOnClose
                title={<b>Thông tin sách</b>}
                placement="right"
                open={open}
                size='large'
                onClose={() => setOpen(false)}
            >
                <Descriptions title={info?.mainText+": "+ Number(info?.price).toLocaleString("vi-VN")+" đ"} layout="horizontal" column={2} bordered items={items} />
                <div className='rv_ab'>Album</div>
                <Upload
                    action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
                    listType="picture-card"
                    fileList={fileList}
                    onPreview={handlePreview}
                    onChange={handleChange}
                    showUploadList = {
                        {showRemoveIcon:false}
                    }
                >
                    {/* {fileList.length >= 8 ? null : uploadButton} */}
                </Upload>
                {previewImage && (
                    <Image
                    wrapperStyle={{ display: 'none' }}
                    preview={{
                        visible: previewOpen,
                        onVisibleChange: (visible) => setPreviewOpen(visible),
                        afterOpenChange: (visible) => !visible && setPreviewImage(''),
                    }}
                    src={previewImage}
                    />
                )}
            </Drawer>
            <ProTable<iBookTable, TSearch>
                columns={columns}
                actionRef={actionRef}
                cardBordered
                request={async (params, sort, filter) => {
                    console.log(params, sort, filter);
                    let query = "";
                    if (params) {
                        query += `current=${params.current}&pageSize=${params.pageSize}`;
                        if(params.mainText){
                            query += `&mainText=/${params.mainText}/i`;
                        }
                        if(params.author){
                            query += `&a=author=/${params.author}/i`;
                        }
                        const creatDateRange = dateRangeValidate(params.createdAtRange);
                        if(creatDateRange){
                            query += `&createdAt>=${creatDateRange[0]}&createdAt<=${creatDateRange[1]}`;
                        }
                    }
                    //default
                    // query += `&sort= -createdAt`;
                    const res = await getBookAPI(query);
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
                        Add Book
                    </Button>,
                    <Button
                        key="button"
                        icon={<ExportOutlined />}
                        onClick={() => {
                        }}
                        type="primary"
                    >
                        <CSVLink data={csvData} filename='dataBook'>Export</CSVLink>
                    </Button>
                ]}
            />
        </>
    );
};

export default ManageBookPage;
