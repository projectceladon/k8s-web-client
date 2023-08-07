import React from "react";
import { Route, Routes } from "react-router";
import { Android } from "./android/pages/android";
import { NotFound } from "./core/pages/not-found";
import { Register } from "./core/pages/register";
import { Storage } from "./storage/pages/storage";
import { NewTestRequest } from "./test/pages/new-test-request";
import { Test } from "./test/pages/test";
import { TestDetailPage } from "./test/pages/test-detail";
import { PrivateRoute } from "./core/components/priavte-route";
import { RootLogin } from "./core/components/root-login";
import { Success } from "./core/pages/success";
import { AndroidImage } from "./core/pages/android-image";
import { TestLogs } from "./test/pages/test-logs";
import { TestLogsDetail } from "./test/pages/test-logs-detail";
import { AndroidDetailPage } from "./android/pages/android-detail";
import { PushImage } from "./android/pages/push-image";
import { ManageImages } from "./android/pages/manage-images";

export function App(): React.ReactElement {
  return (
    <Routes>
      <Route path="/" element={<RootLogin />} />
      <Route path="register" element={<Register />} />
      <Route path="test/running" element={<PrivateRoute><Test /></PrivateRoute>} />
      <Route path="test/history" element={<PrivateRoute><Test /></PrivateRoute>} />
      <Route path="test/add" element={<PrivateRoute><NewTestRequest /></PrivateRoute>} />
      <Route path="test/detail/:sessionId" element={<PrivateRoute><TestDetailPage /></PrivateRoute>} />
      <Route path="test/logs/:testReqId" element={<PrivateRoute><TestLogs /></PrivateRoute>} />
      <Route path="test/logs/:testReqId/:path" element={<PrivateRoute><TestLogsDetail /></PrivateRoute>} />
      <Route path="image" element={<PrivateRoute><AndroidImage /></PrivateRoute>} />
      <Route path="android" element={<PrivateRoute><Android /></PrivateRoute>} />
      <Route path="android/detail/:sessionId" element={<PrivateRoute><AndroidDetailPage /></PrivateRoute>} />
      <Route path="android/manage-images" element={<PrivateRoute><ManageImages /></PrivateRoute>} />
      <Route path="android/push-image/:tag" element={<PrivateRoute><PushImage /></PrivateRoute>} />
      <Route path="storage" element={<PrivateRoute><Storage /></PrivateRoute>} />
      <Route path="success" element={<Success />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
