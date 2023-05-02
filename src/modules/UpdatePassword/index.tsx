import { myRequest } from '@utils/request';
import { Form, Input, Button, notification } from 'antd';
import { useState } from 'react';

const ChangePasswordForm = () => {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<Error>();

  const onFinish = async (values) => {
    // Here, you can handle the logic for submitting the form and updating the user's password
    // You can make an API request to the server and show a notification to the user when the update is successful
    setLoading(true);
    setErr(null);
    try {
      await myRequest('/api/resetpassword', {
        method: 'post',
        body: JSON.stringify(values),
      });
      notification.success({
        message: 'Password updated',
        description: 'Your password has been updated successfully.',
      });
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (error) {
      setErr(error);
    }
    setLoading(false);
  };

  const dom = (
    <Form name="change_password" onFinish={onFinish} className="my-8">
      <Form.Item
        name="password"
        rules={[
          {
            required: true,
            message: 'Please input your new password!',
          },
        ]}
      >
        <Input.Password placeholder="New Password" />
      </Form.Item>

      <Form.Item
        name="confirm_password"
        dependencies={['password']}
        rules={[
          {
            required: true,
            message: 'Please confirm your new password!',
          },
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

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          className="block w-full"
          loading={loading}
          style={{ background: 'var(--theme-purple-antd)' }}
        >
          Update Password
        </Button>
      </Form.Item>
      {err && <div className="text-red-600 text-center">{String(err)}</div>}
    </Form>
  );

  return (
    <div className="mt-8 sm:mt-12 mx-auto max-w-lg">
      <div>
        <span className="text-3xl text-gradient font-[800]">ChatGPT</span>
      </div>
      {dom}
    </div>
  );
};

export default ChangePasswordForm;
