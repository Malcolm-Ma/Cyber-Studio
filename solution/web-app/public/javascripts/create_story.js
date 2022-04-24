const title = document.getElementById('title');
const author = document.getElementById('author');
const photo_path = document.getElementById('formFile');
const content = document.getElementById('content');
const submit_btn = document.getElementById('submit')

let url = 'http://localhost:3100/upload_image'

function offlineCreateStory() {
  storeStory({ title: title, author: author, photo: photo_path, content: content })
    .then(res =>
      console.log('Successfully story a new story in database.')
    )
    .catch(err =>
      console.log('Fail to store this new story')
    )
}


const convertBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.readAsDataURL(file)

    fileReader.onload = () => {
      resolve(fileReader.result)
    }

    fileReader.onerror = () => {
      reject(error)
    }
  })
}

const uploadImage = async (event) => {
  const file = event.target.files[0]
  const base64 = await convertBase64(file)
  console.log(base64)
  var data = { imageBlob: base64 }
  const response = fetch(url, {
    method: 'POST',
    mode:"no-cors",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  return response
}

photo_path.addEventListener('change', async (event) => {
  uploadImage(event).then(result => {
    console.log(result)
  }).catch(err => {
    console.log(err.message)
  })
})

submit_btn.addEventListener('click', (e) => {
  e.preventDefault()
  let photo = photo_path.files[0]
  let reader = new FileReader()
  reader.readAsDataURL(photo)

  var story_title = title.value
  var story_author = author.value
  var story_content = content.value
  var photo_base64 = ''
  var data = ''
  photo_base64 = reader.result
  data = { title: story_title, content: story_content, author: story_author, photo: photo_base64 }

  console.log(data)
  // postData(data).then(response => {
  //   console.log(response.data)

  // }).catch(err => {
  //   console.log(err.message)
  // }
  // )
})

async function postData(data) {
  console.log(data)
  const response = await fetch(url + '/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  return response.json()
}


