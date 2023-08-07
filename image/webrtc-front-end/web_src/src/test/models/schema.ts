import * as Yup from "yup";

export interface TestStartForm {
  sessionName: string;
  testVersion: string;
  androidVersion: string;
  shareDataPVC?: string;
  shareDataMonopolize: string;
  count: number;
  configs?: string[];
  testParameters?: string;
  fps?: string;
  resolution?: string;
}

export const initialTestRequestValues: TestStartForm = {
  sessionName: "",
  testVersion: "",
  androidVersion: "",
  shareDataMonopolize: "",
  shareDataPVC: "",
  count: 1
};

export const testRequestSchema = Yup.object().shape({
  sessionName: Yup.string().required("Required"),
  testVersion: Yup.string().required("Required"),
  androidVersion: Yup.string().required("Required"),
  count: Yup.number().required("Required")
});
