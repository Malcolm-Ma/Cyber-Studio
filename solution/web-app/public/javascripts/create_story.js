/*
 * @Author: Jipu Li 
 * @Date: 2022-05-02 22:40:44 
 * @Last Modified by: Jipu Li
 * @Last Modified time: 2022-05-02 22:41:06
 */

const title = document.getElementById('title')
const author = document.getElementById('author')
const photo_path = document.getElementById('formFile')
const content = document.getElementById('content')
const submit_btn = document.getElementById('submit')
const story_form = document.getElementById('story_form')

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
  return response
}

photo_path.addEventListener('change', (event) => {
  uploadImage(event).then(result => {
    console.log("result ", result)
    if (result.status == 413) {
      alert("image size is too large, please upload it again")
      photo_path.value = ''
    }
  })
})

submit_btn.addEventListener('click', async (event) => {
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
      location.reload()
    }

    if (data.story) {
      location.assign('/')
    }

  } catch (err) {
    console.log(err.message)
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


