import * as Yup from "yup";

export const androidRequestSchema = Yup.object().shape({
  version: Yup.string().required("Required"),
  count: Yup.number().required("Required")
});
