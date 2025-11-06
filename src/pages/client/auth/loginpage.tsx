import React from 'react';
import './register.scss';
import type { FormProps } from 'antd';
import { message, Button, Form, Input, notification } from 'antd';
import {  loginAPI } from '@/services/api';
import {useNavigate} from 'react-router-dom';
import { useCurrentApp } from '@/component/context/app.context';


const LoginPage: React.FC = () => {
  const navigate = useNavigate(); 
  // const {message, notification} = App.useApp();
  type FieldType = {
    fullName?: string;
    password?: string;
    email?: string;
    phone?: string;
  };
  const {setIsAuthenticated,setUser} = useCurrentApp();
  const onFinish: FormProps<FieldType>['onFinish'] = async(values) => {
    var {email,password} = values;
    const res = await loginAPI(email||"",password||"")
    if(res.data){
      const token = res.data.access_token;
      if (token) {
        setIsAuthenticated?.(true);
        setUser?.(res.data.user);
        localStorage.setItem("access_token", token); // Lưu vào Local Storage
      }
      message.success("Đăng nhập thành công");
      navigate("/")
    }else{
      console.log("11111111111111",res);
      notification.error({
        message:"Đăng nhập thất bại",
        description: res.message && res.message,
      });
    }
  };
  
  const onFinishFailed: FormProps<FieldType>['onFinishFailed'] = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };
  return (
    <Form
      name="register"
      layout="vertical"
      className="formChung"
      style={{ maxWidth: 600 }}
      initialValues={{ remember: true }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
    >
      <div className="tiêuĐề">Đăng nhập</div>
      
      <Form.Item<FieldType>
        label="Email"
        name="email"
        rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item<FieldType>
        label="Mật khẩu"
        name="password"
        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item >
        <Button type="primary" htmlType="submit" block>
          Đăng nhập
        </Button>
      </Form.Item>

      <div className="footerForm">
        Đăng ký tài khoản? <a href="/register">Đăng ký</a>
      </div>
    </Form>
    
  )
};
export default LoginPage;