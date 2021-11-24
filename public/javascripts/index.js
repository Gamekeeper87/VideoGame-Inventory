document.addEventListener('DOMContentLoaded', () => {
  // Add Anime
  const addAnime = document.querySelector('#add-anime')
  addAnime.addEventListener('click', () => {
    window.open('/add/anime', '_self')
  })

  // Add Genre
  const addGenre = document.querySelector('#add-genre')
  addGenre.addEventListener('click', () => {
    window.open('/add/genre', '_self')
  })

  // Update Anime
  const updateDeleteBtns = document.querySelectorAll('#update-delete-btns')

  updateDeleteBtns.forEach((button) => {
    const name =
      button.parentElement.parentElement.children[0].children[0].textContent

    button.children[0].addEventListener('click', () => {
      window.open(`/update/${name}`, '_self')
    })

    button.children[1].addEventListener('click', () => {
      window.open(`/delete/${name}`, '_self')
    })
  })

  const nodes = document.querySelectorAll('.content-container')
  nodes.forEach((node) => {
    const name = node.children[0].textContent

    node.addEventListener('click', () => {
      window.open(`/genres/view/${name}`, '_self')
    })
  })
})
