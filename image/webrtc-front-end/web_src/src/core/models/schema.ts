import * as Yup from "yup";

const pwdReg = "^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{8,16}$";
const accountReg = "^[a-zA-Z][a-zA-Z0-9_]{3,15}$";

export const registerSchema = Yup.object().shape({
  username: Yup.string()
    .required("Required")
    .matches((accountReg as unknown) as RegExp, "4 - 16 characters and start with letter!"),
  password: Yup.string()
    .required("Required")
    .matches((pwdReg as unknown) as RegExp, "8 - 16 characters including one letter and one number!"),
  cpwd: Yup.string()
    .required("Required")
    .oneOf([Yup.ref("password"), null], "Password not match!")
});
