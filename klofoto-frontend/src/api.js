import { v4 as uuidv4 } from 'uuid';

const ENDPOINT = 'https://p821k8wid6.execute-api.ap-southeast-1.amazonaws.com/dev/presignedurls';

function getUrl(folder, file) {
  return ENDPOINT + "?folder=" + encodeURIComponent(folder) + "&file=" + encodeURIComponent(file)
}

export function uploadImage(file) {
  const fileName = uuidv4();
  const folderName = "test";
  fetch(getUrl(folderName, fileName))
  .then(response => response.json())
  .then(data => console.log(data))
}
