import { v4 as uuidv4 } from "uuid";

const UPLOAD_ENDPOINT =
  "https://vzanfo84jd.execute-api.ap-southeast-1.amazonaws.com/dev/get_pre_signed_url";
const DOWNLOAD_ENDPOINT =
  "https://terraform-20200418031709616800000001.s3-ap-southeast-1.amazonaws.com/";

export function getUploadUrl(folder, fileName, options) {
  const { email, phone, style, iterations } = options;
  const params = {
    folder: folder,
    file: fileName,
    ...(email ? { email: email } : {}),
    ...(phone ? { telephone: phone } : {}),
    ...(style ? { style: style } : {}),
    ...(iterations ? { iter: iterations } : {}),
  };
  const paramString = new URLSearchParams(params).toString();
  return UPLOAD_ENDPOINT + "?" + paramString;
}

export function getDownloadUrl(folder, file) {
  return (
    DOWNLOAD_ENDPOINT +
    encodeURIComponent(folder) +
    "/" +
    encodeURIComponent(file)
  );
}

function getFileExt(filename) {
  if (filename.indexOf(".") > -1) {
    return "." + filename.split(".").pop();
  } else {
    return "";
  }
}

export function uploadImage(file, options) {
  const fileName = uuidv4() + getFileExt(file.name);
  const folderName = "toProcess";
  return fetch(getUploadUrl(folderName, fileName, options))
    .then((response) => response.json())
    .then((data) => {
      const {
        // message,
        input: { url },
      } = data;
      return fetch(url, {
        method: "PUT",
        body: file,
      });
    })
    .then((response) => console.log(response.status))
    .then(() => {
      const result = {
        id: fileName,
        before: getDownloadUrl("toProcess", fileName),
        after: getDownloadUrl("processed", fileName),
      };
      console.log(JSON.stringify(result, null, 4));
      return result;
    });
}
