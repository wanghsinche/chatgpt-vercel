import { Form, Input, Button, notification } from 'antd';
import { useState } from 'react';

const ChangePasswordForm = () => {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<Error>();

  const onFinish = (values) => {
    console.log('Received values of form:', values);
    // Here, you can handle the logic for submitting the form and updating the user's password
    // You can make an API request to the server and show a notification to the user when the update is successful
    notification.success({
      message: 'Password updated',
      description: 'Your password has been updated successfully.',
    });
  };

  const dom = (
    <Form name="change_password" onFinish={onFinish} className="my-8">
      <Form.Item
        name="current_password"
        rules={[
          {
            required: true,
            message: 'Please input your current password!',
          },
        ]}
      >
        <Input.Password placeholder="Current Password" />
      </Form.Item>

      <Form.Item
        name="new_password"
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
        dependencies={['new_password']}
        rules={[
          {
            required: true,
            message: 'Please confirm your new password!',
          },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('new_password') === value) {
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
