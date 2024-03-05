console.log(`Welcome to my Music Player...! \nThis Project is made by SK IMTIAJ UDDIN`)


                                /* Global variables and containers section */

let albums = {};                // All album's list
let songList = [];              // Songs container
let currentSong = new Audio();  // current song global variable
let currentFolder;              // Current Album
let curLi, songCard;            // Current song li
let vol_value = 1;              // global volume variable

/* -------------------------------------------------------------------------------------------------------------- */

                                        /* Utility functions section */

// Function to convert seconds to 00:00 format
const convertSecondsToMinutes = (seconds) => {
    // Ensure the input is a valid number
    if (isNaN(seconds) || seconds < 0) {
        return '00:00';
    }

    // Calculate minutes and seconds
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    // Format the result as "mm:ss"
    const formattedTime = `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;

    return formattedTime;
}


// Utility function to get Song Index by song-name
const searchIndex = (element) => {
    for (let index = 0; index < songList.length; index++) {
        if (element === songList[index][0]) {
            return index;
        }
    }
    return -1;
}


// Utility function to get current song index
const findCurrSongIndex = () => {
    let curIndex = -1;
    for (let index = 0; index < songList.length; index++) {
        if (currentSong.src === songList[index][1]) {
            curIndex = index;
            break;
        }
    }
    return curIndex;
}

/* ------------------------------------------------------------------------------------------------------------- */

                            /* Async functions to fetch albums, songs, and play music */

// Fetch albums function
async function fetchAlbums() {
    let folders = await fetch("/songs/");       // Fetch the items from Actual folder
    let response = await folders.text();

    let div = document.createElement("div");
    div.innerHTML = response;

    let array = Array.from(div.getElementsByTagName("a"));  // get all the <a> tags of the folder
    let cardContainer = document.querySelector(".card-container");

    let cnt = 0;
    for (let index = 0; index < array.length; index++) {
        const element = array[index];
        if (element.href.includes("/songs/")) {
            albums[element.title] = element.href;           // Fill the global Albums Container

            // Populate the album cards
            cardContainer.innerHTML = cardContainer.innerHTML + `
                <div id="albumCard${cnt++}" class="cards">
                    <div class="green-play">
                        <img class="green-play-img" src="/images/green-play-button.svg" alt="green-play-button">
                    </div>
                    <img src="/songs/${element.title}/cover.png" alt="cover">
                    <h1>${element.title}</h1>
                </div>`
        }
    }
}

// Fetch songs function
async function fetchSongs(folder) {
    currentFolder = folder;

    let dom = await fetch(`/songs/${folder}/`);      // Fetch Songs from Album [Folder]
    let response = await dom.text();

    let newdiv = document.createElement("div");
    newdiv.innerHTML = response;

    songList = [];                                  // First clear the songList then push new songs
    let a_tags = newdiv.getElementsByTagName("a");  // Get all the <a> tags
    for (let index = 0; index < a_tags.length; index++) {
        const element = a_tags[index];

        if (element.href.endsWith(".mp3")) {        // Fill songs array with the song names and links
            songList.push([element.title, element.href]);
        }
    }

    let songUL = document.querySelector(".playlist").getElementsByTagName("ul")[0]; // Target playlist ul
    songUL.innerHTML = "";

    let cnt = 0;
    for (const titile_link of songList) {
        // title_link = ["Example audio.mp3", "/songs/album/Example-audio.mp3"]
        songUL.innerHTML = songUL.innerHTML + `<li id="songCard${cnt++}">
                <div class="music-info">
                    <img class="playlist-icon" src="/images/playlist-icon.svg" alt="playlist-icon">
                    <div class="song-name">${titile_link[0]}</div>
                </div>
                <img class="playlist-play-button" src="/images/playlist-play-button.svg" alt="play-button">
                </li>`;
    }
    playbtn.src = "images/play-button.svg"
    await playMusic(songList[0], true);         // When songs are fetched set the first song in playbar

    // Attach Event Listener to each Li tags  [icon - songName - playButton]
    let li_tags = document.querySelector(".playlist").getElementsByClassName("music-info");
    Array.from(li_tags).forEach((element) => {
        element.addEventListener('click', async () => {
            let track = element.querySelector(".song-name").innerHTML;
            let index = searchIndex(track);
            await playMusic(songList[index]);
        })
    })


    // Attach Event listeners to each play-button of playlist
    Array.from(document.getElementsByClassName("playlist-play-button")).forEach((element) => {
        element.addEventListener("click", async () => {
            // If a song is already playing, pause it
            if (element.src.includes("/images/pause-button.svg")) {
                currentSong.pause();
                playbtn.src = "/images/play-button.svg";
                curLi.src = "/images/playlist-play-button.svg";
            }
            else {
                let track = element.parentNode.getElementsByClassName("song-name")[0].innerHTML;
                let index = searchIndex(track);

                // If someone clicks for the first-time 
                if (currentSong.src != songList[index][1]) {
                    await playMusic(songList[index]);
                }
                else {      // The song is paused, play it
                    currentSong.play();
                    playbtn.src = "/images/pause-button.svg";
                    curLi.src = "/images/pause-button.svg";
                }
            }
        })
    })
}


// Play Music function
async function playMusic(titile_link, paused = false) {
    if (curLi != undefined) {               // When site is loaded or a new album is loaded
        curLi.src = "/images/playlist-play-button.svg";
    }
    if (songCard != undefined) {
        songCard.style.backgroundColor = "#292828";
    }

    if (currentSong.src === titile_link[1]) {
        if (currentSong.paused) {       // If the current song is paused, play it
            currentSong.play();
            playbtn.src = "/images/pause-button.svg";
            curLi.src = "/images/pause-button.svg";
        }
        else {                          // If the current song is playing, pause it
            currentSong.pause();
            playbtn.src = "/images/play-button.svg";
            curLi.src = "/images/playlist-play-button.svg";
        }
        songCard.style.backgroundColor = "#a3562a";
    } else {
        currentSong.src = titile_link[1];       // Update global currentSong with current src

        let index = findCurrSongIndex();
        songCard = document.getElementById(`songCard${index}`);
        curLi = songCard.getElementsByClassName("playlist-play-button")[0];
        songCard.style.backgroundColor = "#a3562a";

        if (!paused) {                          // Play the song if true
            currentSong.play();
            playbtn.src = "/images/pause-button.svg";
            curLi.src = "/images/pause-button.svg";
        }
        document.querySelector('.track-name').innerHTML = titile_link[0];   // Update the playbar with song-title
    }
}


/* --------------------------------------------------------------------------------------------------------------- */

                    /* Main Function to control the flow of fetching and loading albums and songs */

async function main() {
    await fetchAlbums();                            // Fetching albums from folder
    await fetchSongs(Object.keys(albums)[0]);       // Fetching songs from first album

    
    // After loading albums and songs update currentSong duration
    currentSong.addEventListener("loadeddata", () => {
        document.querySelector(".duration").innerHTML = `${convertSecondsToMinutes(currentSong.currentTime)} / ${convertSecondsToMinutes(currentSong.duration)}`;
    });

    // Attach Event listener to update seekbar
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".duration").innerHTML = `${convertSecondsToMinutes(currentSong.currentTime)} / ${convertSecondsToMinutes(currentSong.duration)}`;
        document.querySelector(".seekbar-circle").style.left = ((currentSong.currentTime) / (currentSong.duration)) * 100 + "%";
    })

    // Attach Event Lintener to play button
    playbtn.addEventListener("click", () => {
        if (currentSong.paused) {       // If the current song is paused, play it
            currentSong.play();
            playbtn.src = "/images/pause-button.svg";
            curLi.src = "/images/pause-button.svg";
        }
        else {                          // If the current song is playing, pause it
            currentSong.pause();
            playbtn.src = "/images/play-button.svg";
            curLi.src = "/images/playlist-play-button.svg";
        }
    })

    // Attach Event Listener to prev button
    prevbtn.addEventListener("click", () => {
        let curIndex = findCurrSongIndex();
        if (curIndex > 0) {
            playMusic(songList[curIndex - 1]);
        } else {
            playMusic(songList[songList.length - 1]);
        }
    })

    // Attach Event Listener to next button
    nextbtn.addEventListener("click", () => {
        let curIndex = findCurrSongIndex();
        if (curIndex + 1 < songList.length) {
            playMusic(songList[curIndex + 1]);
        } else {
            playMusic(songList[0]);
        }
    })

    // Update the seekbar when someone clicks at a position in seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let width = e.target.getBoundingClientRect().width;         // It will give the width of the seekbar
        let cur_pos = (e.offsetX / width) * 100;                    // OffsetX returs the X co-ordinate
        document.querySelector(".seekbar-circle").style.left = cur_pos + "%";
        currentSong.currentTime = (currentSong.duration * cur_pos) / 100;
    })

    // Show the menu bar when someone clicks at the Hamburger (tablet / mobile)
    document.querySelector(".menu").addEventListener("click", () => {
        document.querySelector(".left-panel").style.left = 0;
    })

    // Close the menu when someone clicks at the Cross (table / mobile)
    document.querySelector(".close-button").addEventListener("click", () => {
        document.querySelector(".left-panel").style.left = "-100%";
    })

    // Attach Event Listener on Green Play Button
    Array.from(document.getElementsByClassName("green-play")).forEach((element)=>{
        element.addEventListener("click", async ()=>{
            let albumKey = element.parentNode.getElementsByTagName("h1")[0].innerHTML;
            await fetchSongs(albumKey);
            await playMusic(songList[0], false);        // Play the first song of the album
        })
    })

    // Add Event Listeners to Cards(Albums)
    Array.from(document.getElementsByClassName("cards")).forEach((element) => {
        element.addEventListener("click", async (item) => {       // Item refers to each <div> Cards </div>
            let albumKey = item.currentTarget.innerHTML.split("<h1>")[1].split("</h1>")[0];
            if(currentFolder !== albumKey){
                await fetchSongs(albumKey);
            }
        })
    })

    // Change the volume range using 'change' Event
    volRange.addEventListener("change", (e) => {
        vol_value = (e.target.value / 100);
        currentSong.volume = vol_value;
    })

    // Add Event Listener to Volume / Mute button
    volume.addEventListener("click", () => {
        // If active, mute it
        if (volume.src.includes("volume.svg")) {
            volume.src = volume.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            volRange.value = 0;
        }
        else {      // If muted, restore it to previous volume
            volume.src = volume.src.replace("mute.svg", "volume.svg");
            currentSong.volume = vol_value;
            volRange.value = vol_value*100;
        }
    })

    // Add Event Listener to footer section
    document.querySelector(".footer").addEventListener("click", () => {
        about.style.zIndex = "2";
        about.style.width = "100vw";
        about.style.height = "100vh";
    })

    // Close the about sction
    infoClose.addEventListener("click", () => {
        about.style.zIndex = "-1";
    })

    // Autoplay songs, when a song ends play the next song
    currentSong.addEventListener("ended", () => {
        let curIndex = findCurrSongIndex();
        if (curIndex + 1 < songList.length) {
            playMusic(songList[curIndex + 1]);
        } else {
            playMusic(songList[0]);
        }
    })

}

main()