const title = document.getElementById('title');
const author = document.getElementById('author');
const photo_path = document.getElementById('formFile');
const content = document.getElementById('content');
const submit_btn = document.getElementById('submit')

function offlineCreateStory() {
  storeStory({ title: title, author: author, photo: photo_path, content: content })
    .then(res =>
      console.log('Successfully story a new story in database.')
    )
    .catch(err =>
      console.log('Fail to store this new story')
    )
}



submit_btn.addEventListener('click', (e) => {
  e.preventDefault()
  let photo = photo_path.files[0]
  let reader = new FileReader()
  reader.readAsDataURL(photo)
  reader.onload = function () {
    console.log("photo_url:", reader.result)
  }

  var story_title = title.value
  var story_author = author.value
  var story_content = content.value

  var data = { title: story_title, content: story_content, author: story_author, photo: photo_url }

  // postData(data).then(response => {
  //   console.log(response.data)

  // }).catch(err => {
  //   console.log(err.message)
  // }
  // )
})

async function postData(data) {
  console.log(data)
  const response = await fetch(url + '/create_story', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },

    body: JSON.stringify(data)
  })

  return response.json()
}


