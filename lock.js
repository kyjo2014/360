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
        //是否一次点击
        this.oneTouch = true
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
        //求点到直线距离
        function getDis(p0, p1, p) {
            var dis
            if (p1.x == p0.x) {　　
                dis = Math.abs(p1.x - p.x)
            } else {　　
                var k = ((p0.y - p1.y) / (p0.x - p1.x))
                var b = (p0.y * p1.x - p1.y * p0.x) / (p1.x - p0.x)
                dis = Math.abs(k * p.x - 1 * p.y + b) / Math.sqrt(1 + k * k)

            }　
            return dis
        }

        this.cav.addEventListener('touchstart', (e) => {
            //禁止页面拖动
            e.preventDefault()
            if (this.oneTouch) {
                var pos = getPos(e)
                for (var i = 0, radius = this.radius; i < this.pointGroup.length; i++) {
                    var curPoint = this.pointGroup[i]
                    if (Math.abs(pos.x - curPoint.x) < radius && Math.abs(pos.y - curPoint.y) < radius) {
                        curPoint.click = true
                        this.linkGroup.push(curPoint)
                        this.drawPoint(curPoint.y, curPoint.x, 30, true)
                    }
                }
            }



        })
        this.cav.addEventListener('touchmove', (e) => {
            e.preventDefault()
            var pos = getPos(e)
            var lg = this.linkGroup
            var pg = this.pointGroup
            this.ctx.clearRect(0, 0, 400, 400);

            if (lg.length != 0) {
                var lastP = lg[lg.length - 1]
                for (var i = 0, radius = this.radius; i < pg.length; i++) {
                    var curPoint = this.pointGroup[i]
                    this.drawPoint(this.pointGroup[i].y, this.pointGroup[i].x, 30, curPoint.click)
                    if (Math.abs(pos.x - curPoint.x) < radius && Math.abs(pos.y - curPoint.y) < radius && !curPoint.click) {
                        curPoint.click = true
                        //避免中途绕过点
                        for (var j = 0; j < pg.length; j++) {
                            //检测是否在连线范围内
                            if (getDis(lastP, pos, this.pointGroup[j]) < radius) {
                                //检测是否在上一个决定点和移动点之间
                                if (Math.abs(this.pointGroup[j].x - (pos.x + lastP.x) / 2) < radius && Math.abs(this.pointGroup[j].y - (pos.y + lastP.y) / 2) < radius) {
                                    if (!this.pointGroup[j].click) {
                                        this.pointGroup[j].click = true
                                        this.linkGroup.push(this.pointGroup[j])
                                        this.drawPoint(this.pointGroup[j].y, this.pointGroup[j].x, 30, true)
                                    }
                                }



                            }
                        }
                        this.linkGroup.push(curPoint)
                        this.drawPoint(curPoint.y, curPoint.x, 30, true)
                    }
                }


                this.drawLine(lg[lg.length - 1], pos)
            }
            for (var i = 0; i < lg.length - 1; i++) {
                this.drawLine(lg[i], lg[i + 1])
            }

            
        })
        this.cav.addEventListener('touchend', (e) => {
            e.preventDefault()
            //设置为一次连线结束
            this.oneTouch = false
            var lg = this.linkGroup
            var pg = this.pointGroup
            //最后一次绘图
            this.ctx.clearRect(0, 0, 400, 400);
            for (var i = 0, radius = this.radius; i < pg.length; i++) {
                var curPoint = this.pointGroup[i]
                this.drawPoint(curPoint.y, curPoint.x, 30, curPoint.click)
            }
            for (var i = 0; i < lg.length - 1; i++) {
                this.drawLine(lg[i], lg[i + 1])
            }
           //TODO: 停止触摸后对页面状态的判定
        })
        //TODO: 选取状态
    }
    //TODO:清除当前所有点的触控状态
    PatternUnlock.prototype.clearStatus = function () {

    }
    //TODO:更新画布
    PatternUnlock.prototype.update = function () {

    }
    //存储状态
    PatternUnlock.prototype.storeStatus = function () {
        //解决Safari无法直接对存在值setItem的问题
        if (window.localStorage.getItem('lockPwd')) {
            window.localStorage.removeItem('lockPwd')
        }
        window.localStorage.setItem('lockPwd', JSON.stringify(this.linkGroup))
    }
    //对比状态
    PatternUnlock.prototype.compareStatus = function (oldList, newList) {
        for (var i = 0; i < Math.max(oldList.length, newList.length); i++) {
            if (oldList[i].id != newList[i].id) {
                return false
            }
        }
        return true
    }
    //画出连线
    PatternUnlock.prototype.drawLine = function (lastp, nowp) {
        var context = this.ctx
        context.save();
        context.beginPath();
        context.moveTo(lastp.x, lastp.y);
        context.lineTo(nowp.x, nowp.y);
        context.strokeStyle = 'red';
        context.stroke();
        context.restore();

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
                        id: i * 3 + j,
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