const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");

let deleteBtnArr = document.querySelectorAll(".deleteBtn");

const handleDeleteClick = async (event) => {
  const {
    target: { parentElement },
  } = event;
  await fetch(`/api/videos/comment/${parentElement.dataset.id}`, {
    method: "DELETE",
  });
  parentElement.remove();
};

const addComment = (text, id) => {
  const videoComments = document.querySelector(".video__comments ul");
  const newComment = document.createElement("li");
  const icon = document.createElement("i");
  const span = document.createElement("span");
  const spanDel = document.createElement("span");
  icon.className = "fa-solid fa-comment";
  span.innerText = ` ${text}`;
  spanDel.innerText = "❌";
  spanDel.className = "deleteBtn";
  newComment.className = "video__comment";
  newComment.dataset.id = id;
  newComment.appendChild(icon);
  newComment.appendChild(span);
  newComment.appendChild(spanDel);
  videoComments.prepend(newComment);
  newComment
    .querySelector(".deleteBtn")
    .addEventListener("click", handleDeleteClick);
};

const handleSubmit = async (event) => {
  event.preventDefault();
  const textarea = form.querySelector("textarea");
  const text = textarea.value;
  const videoId = videoContainer.dataset.id;
  if (text === "") return;
  const response = await fetch(`/api/videos/${videoId}/comment`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  textarea.value = null;
  const { newCommentID } = await response.json();
  if (response.status === 201) {
    addComment(text, newCommentID);
  }
};

form.addEventListener("submit", handleSubmit);

if (deleteBtnArr) {
  deleteBtnArr.forEach((deleteBtn) => {
    deleteBtn.addEventListener("click", handleDeleteClick);
  });
}
