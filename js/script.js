window.onload = function(){
    //IE低版本没有getElementsByClassName，所以自己写
    if(!document.getElementsByclassName){
        document.getElementByClassName = function(cls){
            var ret = [];
            var els = document.getElementsByTagName('*');
            for(var i = 0,len = els.length; i<len;i++){
                if(els[i].className === cls
                    ||els[i].className.indexOf(cls + ' ') >=0
                    ||els[i].className.indexOf(' '+cls + ' ') >=0
                    ||els[i].className.indexOf(' '+ cls) >=0
                    ){
                    ret.push(els[i]);
                }

            }
            return ret;
        }

    }


var cartTable = document.getElementById('cartTable');
//表格的行属性rows
var tr = cartTable.children[1].rows;
var checkInputs = document.getElementsByClassName('check');
var checkAllInputs = document.getElementsByClassName('check-all');
var selectedTotal = document.getElementById('selectedTotal');
var priceTotal = document.getElementById('priceTotal');
//foot那里的已选商品
var selected = document.getElementById('selected');
var foot = document.getElementById('foot');
var selectedViewList = document.getElementById('selectedViewList');
var deleteAll = document.getElementById('deleteAll');

//计算
function getTotal(){
    var selected = 0;
    var price = 0;
    var HTMLstr = '';
    for(var i = 0,len=tr.length;i<len; i++){
        //用tr[i],不用document，因为要一直循环着变
        if(tr[i].getElementsByTagName('input')[0].checked){
            //on是自带的？加了on就是点击每一行的时候，当前行背景亮
            tr[i].className = 'on';
            selected += parseInt(tr[i].getElementsByTagName('input')[1].value);
            //表格的列属性cells
            price += parseFloat(tr[i].cells[4].innerHTML);
            //让图片显示出来
             HTMLstr += '<div><img src="' + tr[i].getElementsByTagName('img')[0].src + '"><span class="del" index="' + i + '">取消选择</span></div>'
        }else{
            tr[i].className = '';
        }
    }
         selectedTotal.innerHTML = selected;
        priceTotal.innerHTML = price.toFixed(2);
        selectedViewList.innerHTML = HTMLstr;
        //如果没有被选择的商品，就把显示商品的浮层（带class为show）隐藏
        if (selected == 0) {
            foot.className = 'foot';
        }
}


for(var i = 0;i<tr.length; i++){
    //把事件代理到每一行上，而不用在每个元素上都绑定事件
    tr[i].onclick = function(e){
        e = e || window.event;
        //srcElement，处理浏览器兼容的，相当于e.target
        var el = e.srcElement;
        var cls = el.className;
        //注意是用this调用的，this就是tr元素
        var input = this.getElementsByTagName('input')[1];
        var val = parseInt(input.value);
        //this
        var reduce = this.getElementsByTagName('span')[1];
        switch(cls){
            case 'add':
                input.value = val + 1;
                reduce.innerHTML = '-';
                //每次点击都要调一次，参数每一行也就是this
                getSubTotal(this);
                break;
            case 'reduce':
                if(val > 1){
                    input.value = val - 1;
                }
                if(input.value<= 1){
                    reduce.innerHTML = '';
                }
                getSubTotal(this);
                break;
            //单行删除
            case 'delete':
                //confirm是自带的，点击确定会返回true，点击返回会返回false
                var conf = confirm('确定要删除吗');
                if(conf){
                    this.parentNode.removeChild(this);
                }
                break;
            default:
                break;

        }
        //小计完了，总计也要计算一下
        getTotal();
    }

    //对于数量，不用鼠标点，从键盘输入也可以，只有一个input，就不用事件代理了，直接加在input上
    tr[i].getElementsByTagName('input')[1].onkeyup = function () {
            //做parse主要是为了保证取到的是数字
            var val = parseInt(this.value);
            var tr = this.parentNode.parentNode
            var reduce = tr.getElementsByTagName('span')[1];
            if (isNaN(val) || val < 1) {
                val = 1;
            }
            this.value = val;
            if (val <= 1) {
                reduce.innerHTML = '';
            }
            else {
                reduce.innerHTML = '-';
            }
            //计算哪一行，用参数传进去
            getSubTotal(tr);
            getTotal();
        }
}


//小计
function getSubTotal(tr){
    //取得tr下面的所有td
    var tds = tr.cells;
    var price = parseFloat(tds[2].innerHTML);
    var count = parseInt(tr.getElementsByTagName('input')[1].value);
    var SubTotal = parseFloat(price*count);
    tds[4].innerHTML = SubTotal.toFixed(2);
}



for(var i = 0,len = checkInputs.length;i< len; i++){
    //给每个选择框加上点击事件
    checkInputs[i].onclick=function(){
        //每次勾选上的时候都要计算一下
         //判断是不是全选框，区别单选框。如果是全选框的话，就要把所有的单选框都勾上
         //注意是this，就是当前选择的框
        if(this.className === 'check-all check'){
            for(var j = 0;j<checkInputs.length; j++){
                //遍历所有的全选框，改成和当前的相同
                checkInputs[j].checked = this.checked;
            }
        }
        //如果有一个未选，全选框按钮也要未选
        if(this.checked === false){
            for(var k = 0; k< checkAllInputs.length; k++){
                checkAllInputs[k].checked = false;
            }
        }
         getTotal();
    }
}

//为已选商品加上事件，就是为foot加show
selected.onclick = function(){
    //实现了class的切换效果
    if(foot.className == 'foot'){
        if(selectedTotal.innerHTML !=0){
            foot.className = 'foot show';
        }
    }else{
        foot.className = 'foot';
    }
}

//事件代理，在显示商品浮层，每个商品的上面都有取消选择按钮，但浮层是动态生成的，所以不能在浮层上绑定事件，可以代理到它的父元素上
selectedViewList.onclick = function(e){
    //当事件被触发的时候，有个特殊的对象会被传到函数
    e = e || window.event;
    //获取到点击的元素
    var el = e.srcElement || e.target;
    //这个class就是拼接出来的那段中取消选择的class
    if(el.className =='del'){
        //getAttribute获得自定义的属性
        var index = el.getAttribute('index');
        var input = tr[index].getElementsByTagName('input')[0];
        input.checked = false;
        //就会触发上面写的onclick事件了
        input.onclick();
    }
}


deleteAll.onclick = function(){
    //这句是为了保证如果没有选择商品，就不要弹出删除框了
    if(selectedTotal.innerHTML !='0'){
        var conf = confirm('确定删除吗');
        if(conf){
            for(var i=0;i<tr.length;i++){
                var input = tr[i].getElementsByTagName('input')[0];
                if(input.checked){
                    tr[i].parentNode.removeChild(tr[i]);
                    //保证删除后i不往前移
                    i--;
                }
            }

        }
    }
}

//当用户进入购物车的时候，默认就把所有的商品都选上。
checkAllInputs[0].checked = true;
//触发onclick事件
checkAllInputs[0].onclick();

}