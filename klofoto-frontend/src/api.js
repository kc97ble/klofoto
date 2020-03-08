import { v4 as uuidv4 } from 'uuid';

const UPLOAD_ENDPOINT = 'https://p821k8wid6.execute-api.ap-southeast-1.amazonaws.com/dev/presignedurls';
const DOWNLOAD_ENDPOINT = 'https://cs5224bucket-dev.s3-ap-southeast-1.amazonaws.com/'

export function getUploadUrl(folder, file) {
  return UPLOAD_ENDPOINT + "?folder=" + encodeURIComponent(folder) + "&file=" + encodeURIComponent(file)
}

export function getDownloadUrl(folder, file) {
  return DOWNLOAD_ENDPOINT + encodeURIComponent(folder) + "/" + encodeURIComponent(file)
}

function getFileExt(filename) {
  if (filename.indexOf(".") > -1) {
    return "." + filename.split(".").pop();
  } else {
    return "";
  }
}

export function uploadImage(file) {
  const fileName = uuidv4() + getFileExt(file.name);
  const folderName = "before";
  return fetch(getUploadUrl(folderName, fileName))
  .then(response => response.json())
  .then(data => {
    const { message, input: { url } } = data;
    return fetch(url, {
      method: 'PUT',
      body: file
    });
  })
  .then(response => console.log(response.status))
  .then(() => {
    const result = {
      "id": fileName,
      "before": getDownloadUrl("before", fileName),
      "after": getDownloadUrl("after", fileName)
    }
    console.log(JSON.stringify(result, null, 4));
    return result;
  })
}
