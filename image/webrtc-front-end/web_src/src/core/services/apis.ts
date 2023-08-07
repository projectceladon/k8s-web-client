// Is https or http
const protocol = document.location.protocol;
const socketProtocol = protocol === "https:" ? "wss:" : "ws:";

// Coordinator host
export const coordinatorHost = `${protocol}//${process.env.REACT_APP_HOST_ENV}/coordinator`;

// Base host
export const baseHost = `${protocol}//${process.env.REACT_APP_HOST_ENV}/backend`;

// Backend for websocket
export const websocketHost = `${socketProtocol}//${process.env.REACT_APP_HOST_ENV}/backend`;

// User apis
export const USER_REGISTER = `${baseHost}/register`;
export const USER_LOGIN = `${baseHost}/login`;
export const CHECK_USERNAME = `${baseHost}/check`;

// P2P
export const P2P_STATUS = `${coordinatorHost}/android/instances/p2p_status`;

// Pod
export const POD = `${coordinatorHost}/android/requests/get`;

// Terminals
export const SHELL = `${websocketHost}/shell`;
export const STREAMER_LOG = `${websocketHost}/streamerlog`;
export const ANDROID_LOG = `${websocketHost}/androidlog`;
export const LOG_CAT = `${websocketHost}/logcat`;
export const SOCKET_CLOSE = `${baseHost}/close`;

// File
export const FILE_UPLOAD = `${baseHost}/upload`;
export const FILE_INSTALL = `${baseHost}/install`;

// ADB Forward
export const ADB_FORWARD = `${baseHost}/android/adb/forward`;
export const ADB_UNFORWARD = `${baseHost}/android/adb/unforward`;
export const GET_ADB_FORWARD_STATUS = `${baseHost}/android/adb/forward/status`;

// Android
export const ANDROID_LIST = `${coordinatorHost}/android/images/list`;
export const ANDROID_REQUEST_LIST = `${baseHost}/requests/list`;
export const ANDROID_REQUEST_START = `${baseHost}/android/start`;
export const ANDROID_REQUEST_DELETE = `${baseHost}/requests/delete`;
export const ANDROID_DETAIL = `${baseHost}/android/detail`;
export const UPDATE_INFO = `${baseHost}/update/info`;
export const PRE_UPDATE = `${baseHost}/pre/update`;

// Storage
export const VOLUME_LIST = `${coordinatorHost}/android/volume/list`;
export const ADD_VOLUME = `${coordinatorHost}/android/volume/add`;
export const DELETE_VOLUME = `${coordinatorHost}/android/volume/delete`;
export const CHECK_VOLUME_AVAILABLE = `${coordinatorHost}/android/volume/umounted`;

// Test
export const TEST_LIST = `${coordinatorHost}/test/images/list`;
export const TEST_SUMMARY_LIST = `${baseHost}/test/summary`;
export const TEST_START = `${baseHost}/test/start`;
export const TEST_DETAIL_LIST = `${baseHost}/test/detail`;
export const STOP_TEST = `${baseHost}/test/stop/session`;
export const LOGS_FILES = `${baseHost}/logfile`;
export const LOGS_WATCHER = `${websocketHost}/logwatcher`;
export const WS = `${websocketHost}/ws`;
