/*
 * @Author: Jipu Li
 * @Date: 2022-05-02 22:40:44
 * @Last Modified by: Jipu Li
 * @Last Modified time: 2022-05-18 16:55:42
 */

const title = document.getElementById('title')
const author = document.getElementById('author')
const photo_path = document.getElementById('formFile')
const content = document.getElementById('content')
const submit_btn = document.getElementById('submit')
const story_form = document.getElementById('story_form')

// function offlineCreateStory() {
//   storeStory({ title: title, author: author, photo: photo_path, content: content })
//     .then(res =>
//       console.log('Successfully story a new story in database.')
//     )
//     .catch(err =>
//       console.log('Fail to store this new story')
//     )
// }

window.onload = () => globalInit()

/**
 * it can convert image file to base64 data
 * @param {*} file image file
 * @returns
 */
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

/**
 * upload image by base64
 */
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

/**
 * when click upload img button
 * it will send base 64 image file to server , and return a img url to web-app
 */
photo_path.addEventListener('change', (event) => {
  uploadImage(event).then(result => {
    console.log("result ", result)
    if (result.status == 413) {
      alert("image size is too large, please upload it again")
      photo_path.value = ''
    }
  })
})


/**
 * it will upload story info to server
 */
submit_btn.addEventListener('click', async (event) => {
  event.preventDefault()
  const title = story_form.title.value
  const author = story_form.author.value
  const content = story_form.content.value
  try {
    const response = await fetch('/create_story', {
      method: 'POST',
      body: JSON.stringify({ title, author, content }),
      headers: { 'Content-Type': 'application/json' }
    })
    const data = await response.json()

    if (data.err) {
      location.reload()
    }

    if (data.story_id) {
      // console.log('data_story: ', data);
      // await storeStoryToDB({
      //   story_id: data.story_id,
      //   title: data.title,
      //   content: data.content,
      //   author: data.author,
      //   photo: data.photo,
      //   ifUpdate: true
      // });
      location.assign('/')
    }

  } catch (err) {
    console.error(err)
  }
})

/**
 * post data to server
 * @param data
 * @returns response json data
 */
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


