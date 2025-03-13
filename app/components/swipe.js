export default function swipedetect(el, callback) {
    let touchsurface = el,
      swipedir,
      startX,
      startY,
      distX,
      distY,
      threshold = 50, // required min distance traveled to be considered swipe
      restraint = 100, // maximum distance allowed at the same time in perpendicular direction
      allowedTime = 300, // maximum time allowed to travel that distance
      elapsedTime,
      startTime;
  
    touchsurface.addEventListener(
      "touchstart",
      function (e) {
        let touchobj = e.changedTouches[0];
        swipedir = "none";
        startX = touchobj.pageX;
        startY = touchobj.pageY;
        startTime = new Date().getTime();
        e.preventDefault();
      },
      false
    );
  
    touchsurface.addEventListener(
      "touchmove",
      function (e) {
        e.preventDefault();
      },
      false
    );
  
    touchsurface.addEventListener(
      "touchend",
      function (e) {
        let touchobj = e.changedTouches[0];
        distX = touchobj.pageX - startX;
        distY = touchobj.pageY - startY;
        elapsedTime = new Date().getTime() - startTime;
        if (elapsedTime <= allowedTime) {
          if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint) {
            swipedir = distX < 0 ? "left" : "right";
          } else if (Math.abs(distY) >= threshold && Math.abs(distX) <= restraint) {
            swipedir = distY < 0 ? "up" : "down";
          }
        }
        callback(e, swipedir);
        e.preventDefault();
      },
      false
    );
  }
  