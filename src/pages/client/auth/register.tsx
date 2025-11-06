import React from 'react';
import './register.scss';
import type { FormProps } from 'antd';
import { Button, Form, Input, message } from 'antd';
import {  registerAPI } from '@/services/api';
import {useNavigate} from 'react-router-dom';


const RegisterPage: React.FC = () => {
  const navigate = useNavigate(); 
  type FieldType = {
    fullName?: string;
    password?: string;
    email?: string;
    phone?: string;
  };
  
  const onFinish: FormProps<FieldType>['onFinish'] = async(values) => {
    var {email,fullName,password,phone} = values;
    console.log('Success:', values);
    // const res = await loginAPI("user@gmail.com","123456");
    const res = await registerAPI(fullName||"",email||"",password||"",phone||"")
    if(res.data){
      message.success("Đăng ký thành công");
      navigate("/login")
    }else{
      message.error("Đăng ký thất bại");
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
      <div className="tiêuĐề">Đăng ký ngay</div>

      <Form.Item<FieldType>
        label="Họ và tên"
        name="fullName"
        rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item<FieldType>
        label="Số điện thoại"
        name="phone"
        rules={[{ required: true, message: 'Vui lòng nhập SĐT!' }]}
      >
        <Input />
      </Form.Item>

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
          Đăng ký
        </Button>
      </Form.Item>
      <div className="footerForm">
        Đã có tài khoản? <a href="/login">Đăng nhập</a>
      </div>
    </Form>
  )
};

export default RegisterPage;