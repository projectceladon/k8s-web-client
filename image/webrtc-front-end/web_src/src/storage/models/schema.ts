import * as Yup from "yup";

export const createVolumeSchema = Yup.object().shape({
  name: Yup.string().required("Required"),
  size: Yup.string().required("Required")
});
