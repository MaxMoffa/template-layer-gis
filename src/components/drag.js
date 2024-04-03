export default function drag(node, options={}) {

    let _disableMovement = false, _isSnapping = false, oldY = null;

    const PARENT_HEIGHT = node.parentElement.clientHeight;
    const NODE_HEIGHT = node.clientHeight;

    const PARENT_WIDTH = node.parentElement.clientWidth;
    const NODE_WIDTH = node.clientWidth;

    const o = {
        disableVertical: false,
        disableHorizontal: true,
        maxHeight: NODE_HEIGHT,
        maxWidth: NODE_WIDTH,
        minHeight: (PARENT_HEIGHT - node.offsetTop),
        minWidth: (PARENT_WIDTH - node.offsetLeft),
        snapTime: 300,
        dragger: ".dragger-element",
        clickToOpen: true,
        onRelease: null,
        directionSnap: true,
        ...options
    };

    if(!o.hasOwnProperty("snap"))
        o.snap = [o.minHeight, o.maxHeight/2, o.maxHeight];

    let nodeDragger = node.querySelector(o.dragger) || node;

    let x, y, downX, downY;
    let offsetBottom = (PARENT_HEIGHT - (node.offsetTop));
    let isOpen = false;

    const snap = e => {
        _disableMovement = true;
        node.style.transition = `${o.snapTime}ms ease all`;
        let _offsetTop = PARENT_HEIGHT - (node.offsetTop);
        y = e.clientY || e.changedTouches[0].clientY;
        let i = null, d = null;
        for(const s of o.snap){
            if(d === null){
                d = Math.abs(s-offsetBottom);
                i = s;
            }else if(Math.abs(s-offsetBottom) < d) {
                d = Math.abs(s-offsetBottom);
                i = s;
            }
        }

        let m = -(i-_offsetTop);
        isOpen = i === o.maxHeight;
        //node.style.transform = `translateY(${m}px)`; 
        node.style.top = (PARENT_HEIGHT - i) + "px";
        setTimeout(() => {
            offsetBottom = i;
            node.style.transition = "none";
            _disableMovement = false;
        }, o.snapTime);
    }

    const directionSnap = e => {
        _disableMovement = true;
        node.style.transition = `${o.snapTime}ms ease all`;
        let _offsetTop = PARENT_HEIGHT - (node.offsetTop);
        y = e.clientY || e.changedTouches[0].clientY;
        let i = null, d = null;
        
        for(const s of o.snap){
            if(d === null){
                d = Math.abs(s-offsetBottom);
                i = s;
            }else if(oldY > y && (PARENT_HEIGHT - y)  < s) {
                d = Math.abs(s-offsetBottom);
                i = s;
                break;
            }
        }

        let m = -(i-_offsetTop);
        isOpen = i === o.maxHeight;
        node.style.top = (PARENT_HEIGHT - i) + "px";
        setTimeout(() => {
            offsetBottom = i;
            node.style.transition = "none";
            _disableMovement = false;
        }, o.snapTime);
    }

    const mouseup = e => {

        document.removeEventListener("mousemove", mousemove);
        document.removeEventListener("touchmove", mousemove);
        document.removeEventListener("mouseup", mouseup);
        document.removeEventListener("touchend", mouseup);

        x = e.clientX || e.changedTouches[0].clientX;
        y = e.clientY || e.changedTouches[0].clientY;

        if(!_isSnapping)
            defineMovement(e);

    };

    const mousedown = e => {
        e = e || window.event;

        if(e.target !== nodeDragger)
            return

        e.preventDefault();

        x = downX = e.clientX || e.changedTouches[0].clientX;
        y = downY = e.clientY || e.changedTouches[0].clientY;


        oldY = y;

        document.addEventListener("mouseup", mouseup, false);
        document.addEventListener("mousemove", mousemove, false);
        document.addEventListener("touchend", mouseup, false);
        document.addEventListener("touchmove", mousemove, false);
    };

    const mousemove = e => {

        if(_disableMovement || _isSnapping)
            return;
        e = e || window.event;
        e.preventDefault();

        let newX = x - (e.clientX || e.changedTouches[0].clientX);
        let newY = y - (e.clientY || e.changedTouches[0].clientY);

        x = e.clientX || e.changedTouches[0].clientX;
        y = e.clientY || e.changedTouches[0].clientY;

        let _offsetBottom = (PARENT_HEIGHT - (node.offsetTop - newY));
        let _offsetRight = (PARENT_WIDTH - (node.offsetLeft - newX + NODE_WIDTH));

        let _offsetLeft = PARENT_WIDTH - (node.offsetLeft - newX);

        let maxIsBottomOk = o.maxHeight !== null && _offsetBottom <= o.maxHeight;
        let minIsBottomOk = o.maxHeight !== null && _offsetBottom >= o.minHeight;

        let maxIsRightOk = o.maxWidth !== null && _offsetLeft < o.maxWidth;
        let minIsRightOk = o.maxWidth !== null && _offsetRight > -(NODE_WIDTH - o.minWidth);

        let isBottomOk = maxIsBottomOk && minIsBottomOk;
        let isRightOk = maxIsRightOk && minIsRightOk;

        let pos = (node.offsetTop - newY);
        if(!maxIsBottomOk){
            _offsetBottom = o.maxHeight;
            pos = PARENT_HEIGHT - o.maxHeight;
        }else if(!minIsBottomOk){
            _offsetBottom = o.minHeight;
            pos = PARENT_HEIGHT - o.minHeight;
        }

        if(_disableMovement || _isSnapping)
            return;

        if(!o.disableVertical){
            offsetBottom = _offsetBottom;
            node.style.top = pos + "px";
        }
        if(!o.disableHorizontal && isRightOk)
            node.style.left = (node.offsetLeft - newX) + "px";

    };

    const click = e => {
        if(!o.clickToOpen)
            return;
        _disableMovement = true;
        node.style.transition = `${o.snapTime}ms ease all`;
        let _offsetTop = PARENT_HEIGHT - (node.offsetTop);
        let i = null, d = null;
        for(const s of o.snap){
            if(d === null){
                d = Math.abs(s-offsetBottom);
                i = s;
            }else if(Math.abs(s-offsetBottom) > d) {
                d = Math.abs(s-offsetBottom);
                i = s;
            }
        }

        let m = -(i-_offsetTop);
        isOpen = i === o.maxHeight;
        //node.style.transform = `translateY(${m}px)`; 
        node.style.top = (PARENT_HEIGHT - i) + "px";
        setTimeout(() => {
            offsetBottom = i;
            node.style.transition = "none";
            _disableMovement = false;
        }, o.snapTime);
    };

    const defineMovement = async (e) => {
        _isSnapping = true;

        if(o.snap && Array.isArray(o.snap) && o.snap.length > 0){
            if(x === downX && y === downY)
                click();
            else {
                if(o.directionSnap)
                    directionSnap(e);
                else
                    snap(e);
            }
                
        }

        node.dispatchEvent(new CustomEvent("change", {
            detail: {
                isOpen
            }
        }));

        if(o.onRelease && typeof(o.onRelease) === "function")
            o.onRelease(node, isOpen);

        _isSnapping = false;

    };

    nodeDragger.addEventListener("mousedown", mousedown, false);
    nodeDragger.addEventListener("touchstart", mousedown, false);

    return {
        destroy() {
            document.removeEventListener("mouseup", mouseup);
            nodeDragger.removeEventListener("mousedown", mousedown);
            document.removeEventListener("mousemove", mousemove);
            nodeDragger.removeEventListener("touchstart", mousedown);
            document.removeEventListener("touchmove", mousemove);
            document.removeEventListener("touchend", mouseup);
        }
    }

}