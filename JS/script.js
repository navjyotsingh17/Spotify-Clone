let currentSong = new Audio();

let songs;

let currentFolder;

// function to get all songs from te folder
async function getSongs(folder) {
  currentFolder = folder;
  // let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
  let a = await fetch(`http://192.168.0.145:5500/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }

    
  }

  // to load songs in playlist whenever a card is clicked
  let songList = document
    .querySelector(".songsList")
    .getElementsByTagName("ul")[0];
  songList.innerHTML = "";
  for (const song of songs) {
    songList.innerHTML =
      songList.innerHTML +
      `<li> 
    <img class="invert" src="icons/music.svg" alt="">
    <div class="info">
      <div>${song.replaceAll("%20", " ")} </div>
      <div>Bunny</div>
    </div>
    <div class="playNow">
      <span>Play Now</span>
    </div>
    <img class="invert" src="icons/play.svg" alt="">
    </li>`;
  }

  //event listener to play music by clicking on any song in the playlist
  Array.from(
    document.querySelector(".songsList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      //console.log(e.querySelector(".info").firstElementChild.innerHTML);
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });

  return songs;
}

// function to pause currently playing song and play the selected song
const playMusic = (track, pause = false) => {
  // let audio = new Audio("/songs/" + track);

  currentSong.src = `/${currentFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "/icons/pause.svg";
  }
  document.querySelector(".songInfo").innerHTML = decodeURI(track);
  document.querySelector(".songTime").innerHTML = "00 : 00 / 00 : 00";
};

// function to convert seconds to minutes
function secondsToMinutes(seconds) {
  // Ensure seconds is a positive number
  seconds = Math.max(0, seconds);

  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  // Calculate minutes and remaining seconds
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  // Format minutes and remaining seconds as "00:00"
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  // Return the formatted string
  return `${formattedMinutes}:${formattedSeconds}`;
}

async function displayAlbums() {
  let a = await fetch(`http://192.168.0.145:5500/songs/`);
  // let a = await fetch(`http://127.0.0.1:3000/songs/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  let array = Array.from(anchors);

  for (let index = 0; index < array.length; index++) {
    const e = array[index];

      if (e.href.includes("/songs/")) {
        let folder = e.href.split("/").slice(-1)[0];
        // console.log(folder)
        // fetch all meta data
        // let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
        let a = await fetch(`http://192.168.0.145:5500/songs/${folder}/info.json`);
        let response = await a.json();
        // console.log(response)
        cardContainer.innerHTML =
          cardContainer.innerHTML +
          `<div data-folder="${folder}" class="card">
        <div class="play">
        <img src="icons/play_icon.svg" alt="play_icon" />
        </div>
        <img src="/songs/${folder}/cover.jpg" alt="" />
        <h2>${response.title}</h2>
        <p>${response.description}</p>
        </div>`;
      }
  }


  //event listener to load the songs according to albums when user clicks on the albums card
Array.from(document.getElementsByClassName("card")).forEach((e) => {
 // console.log(e);
 e.addEventListener("click", async (item) => {
   // console.log(item, item.currentTarget.dataset.folder);
   songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
  playMusic(songs[0]);
 });
});
}

// main function
async function main() {
  await getSongs("songs/ncs");
  playMusic(songs[0], true);
  // console.log(songs);

  //display albums on the page
  displayAlbums();

  // event listener to play or pause the song
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "/icons/pause.svg";
    } else {
      currentSong.pause();
      play.src = "icons/play.svg";
    }
  });

  // event listener to move the seek bar according to song time
  currentSong.addEventListener("timeupdate", () => {
    //console.log(currentSong.currentTime, currentSong.duration);
    document.querySelector(".songTime").innerHTML = `${secondsToMinutes(
      currentSong.currentTime
    )} / ${secondsToMinutes(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // event listener to change song when user clicks anywhere over the seek bar
  document.querySelector(".seekBar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  //event listener to bring the playlist outside in mobile when hamburger icon is clicked
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  // event listener to close the playlist in mobile
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  //event listener to play the next or previous songs when user clicks on next or previous buttons in playbar
  previous.addEventListener("click", () => {
    //console.log("previous clicked")
    //console.log(currentSong)

    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
      // previous.style.display = "none"
    }
  });

  next.addEventListener("click", () => {
    currentSong.pause();
    //console.log("next clicked")
    //console.log(currentSong)

    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
      // nex.style.display = "none"
    }
  });

  //event listener to change the volume of the song when user slides the volume slider
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      // //console.log(e,e.target,typeof(e.target.value))
      currentSong.volume = parseInt(e.target.value) / 100;
    });

  //event listener to show the songs according to albums when user clicks on the albums card
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    // console.log(e);
    e.addEventListener("click", async (item) => {
      // console.log(item, item.currentTarget.dataset.folder);
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
    });
  });

  //add event listener to mute the track
  document.querySelector(".volume>img").addEventListener("click",(e)=>{
    // console.log("song muted")
    if(e.target.src.includes("volume.svg")){
      e.target.src = e.target.src.replace("volume.svg", "mute.svg");
      currentSong.volume = 0;
      document.querySelector(".range").getElementsByTagName("input")[0].value=0
    }
    else{
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentSong.volume = .10;
      document.querySelector(".range").getElementsByTagName("input")[0].value=10
    }
  })
}

main();
