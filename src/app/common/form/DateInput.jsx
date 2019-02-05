import React from "react";
import { Form, Label } from "semantic-ui-react";
import { isValid } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DateInput = ({
  input: { value, onChange, ...restInput },
  width,
  placeholder,
  meta: { touched, error },
  ...rest
}) => {
  return (
    <Form.Field error={touched && !!error} width={width}>
      <DatePicker
        {...rest}
        {...restInput}
        placeholderText={placeholder}
        selected={value && isValid(new Date(value)) ? new Date(value) : null}
        onChange={onChange}
      />
      {touched && error && (
        <Label basic color="red">
          {error}
        </Label>
      )}
    </Form.Field>
  );
};

export default DateInput;
