import { myRequest } from '@utils/request';
import { Button, Form, Input } from 'antd';
import { FC, useState } from 'react';

export interface IAuthProps {
  showLinks?: boolean;
}
type TUIType = 'signUp' | 'signIn' | 'forgetPassword';
const Auth: FC<IAuthProps> = ({ showLinks = true }) => {
  const [uiType, setUIType] = useState<TUIType>('signIn');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<Error>();
  const [msg, setMsg] = useState('');
  const onFinish = async (values: Record<string, string>) => {
    setLoading(true);
    // console.log('Received values of form: ', values);
    try {
      if (uiType === 'signIn') {
        const data = await myRequest('/api/signin', {
          method: 'post',
          body: JSON.stringify(values),
        });
        console.log(data);
        // location.reload();
      }
      if (uiType === 'signUp') {
        const data = await myRequest('/api/signup', {
          method: 'post',
          body: JSON.stringify(values),
        });
        setMsg(data.msg);
      }
      if (uiType === 'forgetPassword') {
        const data = await myRequest('/api/forgetpassword', {
          method: 'post',
          body: JSON.stringify(values),
        });
        setMsg(data.msg);
      }
    } catch (e) {
      setErr(e);
    }
    setLoading(false);
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
        loading={loading}
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
              setMsg('');
              setErr(null);
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
      {err && <div className="text-red-600 flex">{String(err)}</div>}
      {msg && <div className="text-black-600 flex ">{String(msg)}</div>}
    </Form>
  );
};

export default Auth;
