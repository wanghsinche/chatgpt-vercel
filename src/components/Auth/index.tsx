import { Button, Form, Input } from 'antd';
import { FC, useState } from 'react';

export interface IAuthProps {
  showLinks?: boolean;
}
type TUIType = 'signUp' | 'signIn' | 'forgetPassword';
const Auth: FC<IAuthProps> = ({ showLinks = true }) => {
  const [uiType, setUIType] = useState<TUIType>('signIn');

  const onFinish = (values) => {
    console.log('Received values of form: ', values);
  };

  return (
    <Form
      name={uiType ? 'signup' : 'login'}
      initialValues={{ remember: true }}
      onFinish={onFinish}
      className="my-8"
    >
      <Form.Item
        name="email"
        rules={[
          { required: true, message: 'Please input your email!' },
          { type: 'email', message: 'Please input a valid email!' },
        ]}
      >
        <Input placeholder="Email" />
      </Form.Item>

      {uiType !== 'forgetPassword' && (
        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password placeholder="Password" />
        </Form.Item>
      )}

      {uiType === 'signUp' && (
        <Form.Item
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Please confirm your password!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error('The two passwords that you entered do not match!')
                );
              },
            }),
          ]}
        >
          <Input.Password placeholder="Confirm Password" />
        </Form.Item>
      )}

      <Button
        type="primary"
        htmlType="submit"
        className="block w-full"
        style={{ background: 'var(--theme-purple-antd)' }}
      >
        {uiType === 'signUp' && 'Sign up'}
        {uiType === 'signIn' && 'Sign in'}
        {uiType === 'forgetPassword' && 'Send the link'}
      </Button>

      {showLinks && (
        <div className="flex justify-between">
          <Button
            type="link"
            onClick={() => {
              if (uiType === 'signIn') {
                setUIType('signUp');
                return;
              }
              setUIType('signIn');
            }}
          >
            {uiType !== 'signIn'
              ? 'Back to Sign in'
              : "Haven't an account? Sign up"}
          </Button>

          {uiType === 'signIn' && (
            <Button
              type="link"
              onClick={() => {
                setUIType('forgetPassword');
              }}
            >
              Forget password?
            </Button>
          )}
        </div>
      )}
      {/* <div className='text-red-600 flex justify-center'>error</div> */}
    </Form>
  );
};

export default Auth;
