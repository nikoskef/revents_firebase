import React from "react";
import { connect } from "react-redux";
import { Form, Segment, Button, Label, Divider } from "semantic-ui-react";
import { withFirestore } from "react-redux-firebase";
import { Field, reduxForm } from "redux-form";
import { combineValidators, isRequired } from "revalidate";
import TextInput from "../../../app/common/form/TextInput";
import { registerUser } from "../authActions";
import SocialLogin from "../SocialLogin/SocialLogin";

const validate = combineValidators({
  displayName: isRequired("displayName"),
  email: isRequired("email"),
  password: isRequired("password")
});

const RegisterForm = ({ handleSubmit, registerUser, error, invalid, submitting }) => {
  return (
    <div>
      <Form size="large" onSubmit={handleSubmit(registerUser)}>
        <Segment>
          <Field
            autoComplete="name"
            name="displayName"
            type="text"
            component={TextInput}
            placeholder="Known As"
          />
          <Field
            autoComplete="username"
            name="email"
            type="text"
            component={TextInput}
            placeholder="Email"
          />
          <Field
            autoComplete="current-password"
            name="password"
            type="password"
            component={TextInput}
            placeholder="Password"
          />
          {error && (
            <Label basic color="red">
              {error}
            </Label>
          )}
          <Button disabled={invalid || submitting} fluid size="large" color="teal">
            Register
          </Button>
          <Divider horizontal>Or</Divider>
          <SocialLogin />
        </Segment>
      </Form>
    </div>
  );
};

const actions = {
  registerUser
};

export default withFirestore(
  connect(
    null,
    actions
  )(reduxForm({ form: "registerForm", validate })(RegisterForm))
);
