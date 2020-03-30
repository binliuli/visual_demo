const Node_Env = process.env.VUE_APP_CURRENTMODE;
console.log(Node_Env)
let webapi = "";
let tool_api = ""
switch (Node_Env) {
    case 'testing':
        console.log("test")
        break;
    case "preview":
        console.log("preview")
        break
    case "product":
        console.log("product")
        break
    default:
        console.log("dev~~~")
        webapi = 'http://192.168.1.241:8383'
        tool_api = "http://192.168.1.174:8083"
}
const GLOBALCONFIG = {
    webapi: webapi,
    tool_api: tool_api
}
export default GLOBALCONFIG;