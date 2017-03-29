(function () {
    window.PatternUnlock = PatternUnlock
    /**
     * 
     * 
     * @param {any} opt 
     */
    function PatternUnlock(opt) {
        this.type = 'type'
        this.pointGroup = [] //所有触控点
        this.linkGroup = [] //当前绘画路径点
        this.radius = 0
    }
    //绑定事件
    PatternUnlock.prototype.bindEvent = function () {
        //屏幕坐标转变为canvas坐标
        function getPos(event) {
            var e = event
            var outPos = e.currentTarget.getBoundingClientRect()
            var realX = e.touches[0].clientX - outPos.left
            var realY = e.touches[0].clientY - outPos.top
            return {
                x: realX,
                y: realY
            }

        }

        //TODO：触摸
        this.cav.addEventListener('touchstart', (e) => {
            //禁止页面拖动
            e.preventDefault()
            var pos = getPos(e)
            for (var i = 0, radius = this.radius; i < this.pointGroup.length; i++) {
                var curPoint = this.pointGroup[i]
                if (Math.abs(pos.x - curPoint.x) < radius && Math.abs(pos.y - curPoint.y) < radius) {
                    curPoint.click = true
                    this.linkGroup.push(curPoint)
                    this.drawPoint(curPoint.y, curPoint.x, 30, true)
                }
            }


        })
        this.cav.addEventListener('touchmove', (e) => {
            e.preventDefault()
            var pos = getPos(e)
            var lg = this.linkGroup
            var pg = this.pointGroup
            if (lg.length != 0) {
                var lastP = lg[lg.length - 1]
                for (var i = 0, radius = this.radius; i < pg.length; i++) {
                    var curPoint = this.pointGroup[i]
                    if (Math.abs(pos.x - curPoint.x) < radius && Math.abs(pos.y - curPoint.y) < radius && !curPoint.click) {
                        curPoint.click = true
                        this.linkGroup.push(curPoint)
                        this.drawPoint(curPoint.y, curPoint.x, 30, true)
                    }
                }
            }
            // console.log(e)
        })
        this.cav.addEventListener('touchend', (e) => {
            e.preventDefault()
            // console.log(e)
        })
        //TODO: 选取状态
    }
    //清除当前所有点的触控状态
    PatternUnlock.prototype.clearStatus = function () {

    }
    PatternUnlock.prototype.update = function () {

    }

    //画出触控点
    PatternUnlock.prototype.drawPoint = function (top, left, radius, fill) {
        var radius = radius || this.radius
        var context = this.ctx
        context.save();
        context.beginPath();
        context.arc(left, top, radius, 0, Math.PI * 2);
        context.strokeStyle = 'black';
        context.stroke();
        if (fill) {
            context.fillStyle = 'orange';
            context.fill()
        }
        context.restore();

    }
    PatternUnlock.prototype.init = function (id) {
        //获取元素        
        var cav = this.cav = document.getElementById(id)
        this.ctx = cav.getContext('2d');
        //创建初始点
        var width = cav.width
        var height = cav.height
        if (this.pointGroup.length == 0) {
            var radius = this.radius = Math.floor(width / 14)
            for (var i = 0; i < 3; i++) {
                for (var j = 0; j < 3; j++) {
                    this.pointGroup.push({
                        x: radius * (i * 4 + 3),
                        y: radius * (j * 4 + 3),
                        click: false
                    })

                }
            }
        }
        //画圆
        this.pointGroup.forEach((point) => {
            this.drawPoint(point.y, point.x, 30, point.click)
        })
        //绑定事件
        this.bindEvent()


    }
})()