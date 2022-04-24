const title = document.getElementById('title');
const author = document.getElementById('author');
const photo_path = document.getElementById('formFile');
const content = document.getElementById('content');
const submit_btn = document.getElementById('submit')
const story_form = document.getElementById('story_form')

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

    fileReader.onerror = (error) => {
      reject(error)
    }
  })
}

const uploadImage = async (event) => {
  const file = event.target.files[0]
  const base64 = await convertBase64(file)
  var data = { imageBlob: base64 }
  console.log(data)
  const response = await fetch('http://localhost:3000/upload_image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  return response.json()
}

photo_path.addEventListener('change', async (event) => {
  uploadImage(event).then(result => {
    console.log(result)
  }).catch(err => {
    console.log("err", err.message)
  })
})

story_form.addEventListener('submit', async (event) => {
  event.preventDefault()
  const title = story_form.title.value
  const author = story_form.author.value
  const content = story_form.content.value
  try {
    const response = await fetch('/create', {
      method: 'POST',
      body: JSON.stringify({ title, author, content }),
      headers: { 'Content-Type': 'application/json' }
    })
    const data = await response.json()

    if (data.err) {
      alert(data.err)
      location.reload()
    }

    if (data.story) {
      location.assign('/')
    }

  } catch (err) {
    alert(err.message)
  }
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


