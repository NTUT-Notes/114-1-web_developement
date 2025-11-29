function switchFrame(frameFolder) {
    var frame = document.getElementById("frame");
    
    frame.src = "./" + frameFolder + "/index.html"

    var title = document.getElementById("title");
    title.innerText = frameFolder + " Course";
}

function resizeIFrame(frame) {
    // Set minimal height for the frame
    frame.style.height = 0;
    frame.style.height = (frame.contentWindow.document.documentElement.scrollHeight + 10) + 'px';
}

window.onload = () => {
    switchFrame("2025-10-29")
}