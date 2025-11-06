import React, { useState } from 'react';
import { logOutAPI } from '@/services/api';
import {
    AppstoreOutlined,
    ExceptionOutlined,
    HeartTwoTone,
    TeamOutlined,
    UserOutlined,
    DollarCircleOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
} from '@ant-design/icons';
import { Layout, Menu, Dropdown, Space, Avatar } from 'antd';
import { Outlet } from "react-router-dom";
import { Link } from 'react-router-dom';
import { useCurrentApp } from '../context/app.context';
import type { MenuProps } from 'antd';
import { Button, Result } from 'antd';
type MenuItem = Required<MenuProps>['items'][number];

const { Content, Footer, Sider } = Layout;
// const [hrefNow,setHrefNow] = useState("/admin");

const LayoutAdmin = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [activeMenu, setActiveMenu] = useState('/admin');
    const { user ,setUser, setIsAuthenticated, isAuthenticated} = useCurrentApp();


    const handleLogout = async () => {
        const res = await logOutAPI();
        if (res.data) {
            setUser?.(null);
            setIsAuthenticated?.(false);
            localStorage.removeItem("access_token");
            window.location.reload();
        }
    }

    const items: MenuItem[] = [
        {
            label: <Link to='/admin'>Dashboard</Link>,
            key: '/admin',
            icon: <AppstoreOutlined />
        },
        {
            label: <span>Manage Users</span>,
            key: 'user',
            icon: <UserOutlined />,
            children: [
                {
                    label: <Link to='/admin/user'>CRUD</Link>,
                    key: '/admin/user',
                    icon: <TeamOutlined />,
                },
            ]
        },
        {
            label: <Link to='/admin/book'>Manage Books</Link>,
            key: '/admin/book',
            icon: <ExceptionOutlined />
        },
        {
            label: <Link to='/admin/order'>Manage Orders</Link>,
            key: '/admin/order',
            icon: <DollarCircleOutlined />
        },

    ];

    const itemsDropdown = [
        {
            label: <label
                style={{ cursor: 'pointer' }}
                onClick={() => alert("me")}
            >Quản lý tài khoản</label>,
            key: 'account',
        },
        {
            label: <Link to={'/'}>Trang chủ</Link>,
            key: 'home',
        },
        {
            label: <label
                style={{ cursor: 'pointer' }}
                onClick={() => handleLogout()}
            >Đăng xuất</label>,
            key: 'logout',
        },

    ];

    const urlAvatar = `${import.meta.env.VITE_BACKEND_URL}/images/avatar/${user?.avatar}`;
    
    const role = user?.role;
    if (!isAuthenticated || !user){
        return (
            <Result
                status="404"
                title="Bạn chưa đăng nhập"
                subTitle="Vui lòng đăng nhập để tiếp tục."
                extra={<Button type="primary"><Link to='/'>Trang chủ</Link></Button>}
            />
        )
    }
    if (role === 'USER'){
        return (
            <Result
                status="403"
                title="Bạn không có quyền truy cập"
                subTitle="Bạn không có quyền truy cập vào trang này."
                extra={<Button type="primary"><Link to='/'>Trang chủ</Link></Button>}
            />
        )
    }

    return (
        <>
            <Layout
                style={{ minHeight: '100vh' }}
                className="layout-admin"
            >
                <Sider
                    theme='light'
                    collapsible
                    collapsed={collapsed}
                    onCollapse={(value) => setCollapsed(value)}>
                    <div style={{ height: 32, margin: 16, textAlign: 'center' }}>
                        Admin
                    </div>
                    <Menu
                        defaultSelectedKeys={[location.pathname||activeMenu]}
                        mode="inline"
                        items={items}
                        onClick={(e) => {
                            setActiveMenu(e.key);
                        }}
                    />
                </Sider>
                <Layout>
                    <div className='admin-header' style={{
                        height: "50px",
                        borderBottom: "1px solid #ebebeb",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0 15px",

                    }}>
                        <span>
                            {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                                className: 'trigger',
                                onClick: () => setCollapsed(!collapsed),
                            })}
                        </span>
                        <Dropdown menu={{ items: itemsDropdown }} trigger={['click']}>
                            <Space style={{ cursor: "pointer" }}>
                                <Avatar src={urlAvatar} />
                                {user?.fullName}
                            </Space>
                        </Dropdown>
                    </div>
                    <Content style={{ padding: '15px' }}>
                        <Outlet />
                    </Content>
                    <Footer style={{ padding: 0, textAlign: "center" }}>
                        DEMO &copy; 2025 <HeartTwoTone />
                    </Footer>
                </Layout>
            </Layout>

        </>
    );
};

export default LayoutAdmin;