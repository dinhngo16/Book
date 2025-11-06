import { useEffect, useState } from 'react';
import { FaReact } from 'react-icons/fa'
import { FiShoppingCart } from 'react-icons/fi';
import { VscSearchFuzzy } from 'react-icons/vsc';
import { Divider, Badge, Drawer, Avatar, Popover, Empty, Row, Col, Modal, Form, Input, FormProps, Upload, Tabs, Button, UploadProps, UploadFile, GetProp, notification, message } from 'antd';
import { Dropdown, Space } from 'antd';
import { useNavigate } from 'react-router';
import './app.header.scss';
import {  Link } from 'react-router-dom';
import { useCurrentApp } from "../context/app.context";
import { editPWAPI, editUserIFAPI, logOutAPI, uploadFile } from '@/services/api';
import { TabsProps } from 'antd/lib';
import { UploadOutlined } from '@ant-design/icons';
import { UploadRequestOption as RcCustomRequestOptions } from 'rc-upload/lib/interface';
import { v4 as uuidv4 } from 'uuid';
import { isMobile } from 'react-device-detect';
// import type { UploadProps, GetProp, UploadFile } from 'antd';


const AppHeader = (props: any) => {

    const [openDrawer, setOpenDrawer] = useState(false);
    const [openProfile, setOpenProfile] = useState(false);

    const { isAuthenticated, user, setUser, setIsAuthenticated } = useCurrentApp();

    const navigate = useNavigate();

    const handleLogout = async () => {
        const res = await logOutAPI();
        if (res.data) {
            setUser?.(null);
            setIsAuthenticated?.(false);
            localStorage.removeItem("access_token");
            localStorage.removeItem("carts");
            window.location.reload();
        }
    };

    const dl = useCurrentApp();

    const { carts } = useCurrentApp();
    const dlCart = localStorage.getItem("carts");
    const cartsLG = dlCart?JSON.parse(dlCart) : [];

    
    

    // console.log('cartsLG',dl);
    let items = [
        {
            label: <label
                style={{ cursor: 'pointer' }}
                onClick={() => {
                    setOpenProfile(true)
                }}
            >Quản lý tài khoản</label>,
            key: 'account',
        },
        {
            label: <Link to="/history">Lịch sử mua hàng</Link>,
            key: 'history',
        },
        {
            label: <label
                style={{ cursor: 'pointer' }}
                onClick={() => handleLogout()}
            >Đăng xuất</label>,
            key: 'logout',
        },

    ];
    if (user?.role === 'ADMIN') {
        items.unshift({
            label: <Link to='/admin'>Trang quản trị</Link>,
            key: 'admin',
        })
    }

    const urlAvatar = `${import.meta.env.VITE_BACKEND_URL}/images/avatar/${user?.avatar}`;

    const contentPopover = () => {
        return (
            <div className='pop-cart-body'>
                <div className='pop-cart-content'>
                    {(cartsLG||carts)?.map((book:any, index:number) => {
                        return (
                            <div className='book df' key={`book-${index}`}>
                                <Col md={6}>
                                    {/* <div className="anh1" style={{backgroundImage:`url("${import.meta.env.VITE_BACKEND_URL}/images/book/${book?.detail?.thumbnail}")`}}></div> */}
                                    <img style={{width:100}} src={`${import.meta.env.VITE_BACKEND_URL}/images/book/${book?.detail?.thumbnail}`} alt=''/>
                                </Col>
                                <Col md={18} className=''>
                                    <div>{book?.detail?.mainText}</div>
                                    <div className='price'>
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(book?.detail?.price ?? 0)}
                                    </div>
                                </Col>
                            </div>
                        )
                    })}
                </div>
                {(cartsLG||carts).length > 0 ?
                    <div className='pop-cart-footer df shineh' style={{justifyContent:"end", marginTop: 10}}>
                        <button style={{padding: "8px 25px",border:"none", borderRadius: 5, cursor: "pointer", backgroundColor: "rgb(238, 76, 55)", color: "white"}} onClick={() => navigate('/order')}>Xem giỏ hàng</button>
                    </div>
                    :
                    <Empty
                        description="Không có sản phẩm trong giỏ hàng"
                    />
                }
            </div>
        )
    };
    const UserUD: React.FC<{ open: boolean }> = ({ open }) => {
        const [form] = Form.useForm();
        const [tabL,setTabL] = useState("1");
        const [nameIMG,setNameIMG] = useState("");
        const [fileListUP,setFileListUP] = useState<UploadFile[]>([]);
        const items: TabsProps['items'] = [
                {
                key: '1',
                label: 'Thông tin cá nhân',
                children: <></>,
            },
            {
                key: '2',
                label: 'Đổi mật khẩu',
                children: <></>,
            },
        ];
        type FileTypes = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];
        const getBase64 = (file: FileTypes): Promise<string> =>
            new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = (error) => reject(error);
            }
        );
        useEffect(() => {
            form.setFieldsValue({
                fullName: user?.fullName,
                email: user?.email,
                phone: user?.phone,
            });
            setFileListUP([{
                uid: uuidv4(),
                name: user?.avatar||'',
                status: 'done',
                url: `${import.meta.env.VITE_BACKEND_URL}/images/avatar/${user?.avatar}`
            }])
        }, [user]);
         const handleChangeUp: UploadProps['onChange'] = ({ fileList: newFileList }) =>{
            setFileListUP(newFileList);
        };
        const handleUpload = async(options:RcCustomRequestOptions) => {
            const {onSuccess} = options;
            const file = options.file as UploadFile;
            const res = await uploadFile(file,"avatar");
            if(res && res.data){
                setNameIMG(res.data.fileUploaded);
                const upLoadedFile :any = {
                    uid: file.uid,
                    name: res.data.fileUploaded,
                    status:"done",
                    url: `${import.meta.env.VITE_BACKEND_URL}/images/avatar/${res.data.fileUploaded}`,
                };
                if(onSuccess){
                    setFileListUP([{...upLoadedFile}]);
                    onSuccess("ok")
                }
            }
        };
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
        const onFinish: FormProps<any>['onFinish'] = async (values) => {
            const userData = {
                _id: user?.id||"",
                phone: values.phone || "",
                fullName: values.fullName || 0,
                avatar: nameIMG || "",
            };
            const res = await editUserIFAPI(userData);
            if (res.data) {
                notification.success({
                    message:"Cập nhật thành công",
                    description: "Cập nhật thành công",
                });
                setOpenProfile(false);
                setUser({...user!,avatar:nameIMG,fullName:values?.fullName,phone:values?.phone})
            } else {
                notification.error({
                    message:"Lưu thất bại",
                    description: res.message && res.message,
                });
            }
        };
         const onFinishPW: FormProps<any>['onFinish'] = async (values) => {
            // const userPW = {email:values?.email,oldpw:values?.oldpw,newpw:values?.newpw};
            if(values.oldpass===values.newpass){
                notification.error({
                    message:"Thất bại",
                    description: "Vui lòng nhập mật khẩu cũ khác mật khẩu mới!",
                });
            }else{
                const res = await editPWAPI(values);
                if (res.data) {
                    notification.success({
                        message:"Cập nhật thành công",
                        description: "Cập nhật thành công",
                    });
                    setOpenProfile(false);
                    setUser({...user!,email:values?.email})
                } else {
                    notification.error({
                        message:"Lưu thất bại",
                        description: res.message && res.message,
                    });
                }
            }
        };
        return (
            <Modal
                title={
                    <div
                    style={{
                        display: 'inline-block',
                    }}
                    >
                        Quản lý tài khoản
                    </div>
                }
                open={open}
                onOk={() => form.submit()}
                onCancel={()=>{
                    form.resetFields();
                    setOpenProfile(false)
                }}
                destroyOnClose
                okText="Cập nhật"
                cancelText="Đóng"
            >
                <Row>
                    <Tabs defaultActiveKey="1" activeKey={tabL} items={items} onChange={(value) => {setTabL(value)}} />
                </Row>
                {
                    (tabL!=="1")?<Form form={form} className='df' layout="vertical" name="userForm" onFinish={onFinishPW}>
                        <Col span={24}>
                            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]}>
                                <Input  />
                            </Form.Item>
                            <Form.Item name="oldpass" label="Mật khẩu cũ" rules={[{ required: true, message: 'Vui lòng nhập Mật khẩu cũ!' }]}>
                                <Input.Password/>
                            </Form.Item>
                            <Form.Item name="newpass" label="Mật khẩu mới" rules={[{ required: true, message: 'Mật khẩu mới!' }]}>
                                <Input.Password/>
                            </Form.Item>
                        </Col>
                    </Form>:
                    <Form form={form} className='df' layout="vertical" name="userForm" onFinish={onFinish}>
                        <Col span={8}>
                            <Col span={24}>
                                <Form.Item name="avatar" label="Ảnh đại diện" 
                                    valuePropName='fileListUP'
                                    // getValueFromEvent={(e ) => normFileUP(e,'thumbnail')}
                                >
                                    <Upload
                                        listType="picture-circle"
                                        fileList={fileListUP}
                                        onChange={handleChangeUp}
                                        customRequest = {(file ) => handleUpload(file)}
                                        beforeUpload={beforeUpload}
                                        showUploadList = {
                                            {showRemoveIcon:false}
                                        }
                                        maxCount={1}
                                        multiple={false}
                                    >
                                        <Button type="primary" icon={<UploadOutlined />}>
                                            Upload
                                        </Button>
                                    </Upload>
                                </Form.Item>
                            </Col>
                        </Col>
                        <Col span={16}>
                            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]}>
                                <Input disabled />
                            </Form.Item>
                            <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}>
                                <Input  />
                            </Form.Item>
                            <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập SĐT!' }]}>
                                <Input />
                            </Form.Item>
                        </Col>
                    </Form>
                }
            </Modal>
        );
    };
    return (
        <>
            <UserUD
                open={openProfile}
            />
            <div className='header-container'>
                <header className="page-header df aic jcsb">
                    <div className="page-header__top df aic jcsb">
                        <div className="page-header__toggle" onClick={() => {
                            setOpenDrawer(true)
                        }}>☰</div>
                        <div className='page-header__logo'>
                            <span className='logo'>
                                <span onClick={() => navigate('/')}> <FaReact className='rotate icon-react' />SenseCander</span>
                                <VscSearchFuzzy className='icon-search' />
                            </span>
                            <input
                                className="input-search" type={'text'}
                                placeholder="Bạn tìm gì hôm nay"
                                value={props.searchTerm}
                                onChange={(e) => props.setSearchTerm(e.target.value)}
                            />
                        </div>

                    </div>
                    <nav className="page-header__bottom">
                        <ul id="navigation" className="navigation">
                            <li className="navigation__item">
                                <Popover
                                    className="popover-carts"
                                    placement={isMobile?"topLeft":"topRight"}
                                    rootClassName="popover-carts"
                                    title={"Thông tin giỏ hàng"}
                                    content={contentPopover}
                                    arrow={true}>
                                    <Badge
                                        count={(cartsLG||carts)?.length ?? 0}
                                        // count={0}
                                        size={"small"}
                                        showZero
                                    >
                                        <FiShoppingCart className='icon-cart' />
                                    </Badge>
                                </Popover>
                            </li>
                            <li className="navigation__item mobile"><Divider type='vertical' /></li>
                            <li className="navigation__item mobile">
                                {!isAuthenticated ?
                                    <span onClick={() => navigate('/login')}> Tài Khoản</span>
                                    :
                                    <Dropdown menu={{ items }} trigger={['click']}>
                                        <Space >
                                            <Avatar src={urlAvatar} />
                                            {user?.fullName}
                                        </Space>
                                    </Dropdown>
                                }
                            </li>
                        </ul>
                    </nav>
                </header>
            </div>
            <Drawer
                title="Menu chức năng"
                placement="left"
                onClose={() => setOpenDrawer(false)}
                open={openDrawer}
            >
                <p>Quản lý tài khoản</p>
                <Divider />

                <p onClick={() => handleLogout()}>Đăng xuất</p>
                <Divider />
            </Drawer>

        </>
    )
};

export default AppHeader;
