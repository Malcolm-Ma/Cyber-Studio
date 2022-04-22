title = document.getElementById('title');
author = document.getElementById('author');
photo_path = document.getElementById('formFile');
content = document.getElementById('content');

function offlineCreateStory(){
    storeStory({title:title, author:author, photo:photo_path, content:content})
        .then( res =>
            console.log('Successfully story a new story in database.')
        )
        .catch( err =>
            console.log('Fail to store this new story')
        )
}