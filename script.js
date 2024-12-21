let currentsong = new Audio();
let play = document.querySelector("#play"); // Ensure this element exists
let songs = [];
let currFolder;

function convertToTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60); // Corrected calculation
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0'); // Fixed variable name

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getsongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/songs/${folder}`);
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
    // show all songs in paylist
    let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songul.innerHTML = "";
    for (const song of songs) {
        let a = song.split(".mp3")[0].replaceAll("%20", " ");
        songul.innerHTML = songul.innerHTML + `<li><img src="music.svg" alt="" class="invert">
                         <div class="info">
                             <div>${a}</div>
                             <div>Singer</div>
                         </div>
                         <div class="playnow">
                             <span>Play Now</span>
                             <img src="play.svg" alt="" class="invert">
                         </div></li>`;
    }

    // var audio = new Audio(songs[2]);
    // audio.play();
    // attach event listener to all songs 
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML);
        });
    });
}

const playMusic = (track) => {
    // let audio = new Audio("songs/" + track+".mp3");
    currentsong.src = `songs/${currFolder}/` + track + ".mp3";
    currentsong.play();

    play.src = "pause.svg";
    document.querySelector(".songinfo").innerHTML = track;
    document.querySelector(".songtime").innerHTML = "00:00";
}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:3000/songs`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0];
            console.log(folder);
            
            // get the metadata of the folder
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder=${folder} class="card">
                    <div class="play">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
                            color="#000000" fill="none">
                            <path
                                d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                                stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="#000" />
                        </svg>
                    </div>
                    <img src="/songs/${folder}/cover.jpeg" alt="">
                    <h2>${response.title}</h2>
                    <p>${response.description}</p>
                </div>`
        }
    }

    // Load the playlist whenever a card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async (item) => {
            await getsongs(`${item.currentTarget.dataset.folder}`);
        });
    });

}

async function main() {

    // display all the albums on the page
    displayAlbums();

    // attach an event listener to play,next and previous
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "pause.svg";
        } else {
            currentsong.pause();
            play.src = "play.svg";
        }
    })

    // listen for time update

    currentsong.addEventListener("timeupdate", () => {
        if(currentsong.currentTime == currentsong.duration){
            play.src = "play.svg";
        }
        document.querySelector(".songtime").innerHTML = `
        ${convertToTime(currentsong.currentTime)}
        :${convertToTime(currentsong.duration)}`;
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    });

    // evenet for seek bar

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percentage = e.offsetX / document.querySelector(".seekbar").clientWidth;
        currentsong.currentTime = currentsong.duration * percentage;
    })

    // add an event listener to previous button

    document.querySelector("#previous").addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split(`/${currFolder}/`)[1]);
        index--;
        if (index < 0) {
            index = songs.length - 1;
        }

        let tempsong = songs[index].replaceAll("%20", " ");
        let previoussong = "";
        for (let i = 0; i < tempsong.length - 4; i++) {
            previoussong = previoussong + tempsong[i];
        }
        playMusic(previoussong);
    });

        // add an event listener to next button

        document.querySelector("#next").addEventListener("click", () => {
            currentsong.pause();
            let index = songs.indexOf(currentsong.src.split(`/${currFolder}/`)[1]);
            index++;
            if (index > songs.length - 1) {
                index = 0;
            }
            let tempsong = songs[index].replaceAll("%20", " ");
            let nextsong = "";
            for (let i = 0; i < tempsong.length - 4; i++) {
                nextsong = nextsong + tempsong[i];
            }
            playMusic(nextsong);
        })
    // add event listener to volumeup button

    document.querySelector("#volumeup").addEventListener("click", () => {
        if (currentsong.volume == 1.3877787807814457e-16) {
            document.querySelector("#volumedown").src = "volumedown.svg";
        }
        if (currentsong.volume != 1)
            currentsong.volume = currentsong.volume + 0.1;

    })

    // add event listener to volumedown button

    document.querySelector("#volumedown").addEventListener("click", () => {
        if (currentsong.volume > 0.1) {
            currentsong.volume = currentsong.volume - 0.1;
        }
        if (currentsong.volume == 1.3877787807814457e-16) {
            document.querySelector("#volumedown").src = "mute.svg";
        }
    })

}
main();