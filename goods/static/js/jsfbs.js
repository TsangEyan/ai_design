var anser_5W1H = null;
var gpt_response = null;


// gpt 返回
$(document).ready(function () {
    // 输入设计问题
    $('#design-begin').click(function () {

        var DesignConcept = new FormData()

        DesignConcept.append("designID", '5W1H')
        DesignConcept.append("message", $('#design-problem').val())

        sendDataToBackend(DesignConcept).then(() => {
            add5W1H();
            initMindMap("Design");
        }).catch((error) => {
            console.log("Error while sending data: ", error);
        });

    });


    // 输入Requirements 输出Function
    $('#send-5w1h').click(function () {

        var requirementsData = new FormData()
        var requirements =
            $('#who').val() + '\n' +
            $('#what').val() + '\n' +
            $('#when').val() + '\n' +
            $('#why').val() + '\n' +
            $('#where').val() + '\n' +
            $('#how').val();

        // var requirements = $('#who').val() + '\n' + $('#who').val() + '\n' + $('#when').val() + '\n' + $('#what').val() + '\n' + $('#where').val() + '\n' + $('#how').val()
        requirementsData.append("designID", "Requirements")
        requirementsData.append("requirements", requirements)

        // sendDataToBackend(requirementsData);
        sendDataToBackend(requirementsData).then(() => {
            addFunctions()
        }).catch((error) => {
            console.log("Error while sending data: ", error);
        });

    });

    // 输入Function 输出Behaviors
    // Behavior 数据结构示例:
    // {
    //     'Function1': {
    //         'Behavior1': 'Corresponding Detailed Behavior Description',
    //         'Behavior2': 'Corresponding Detailed Behavior Description'
    //     },
    //     'Function2': {
    //         'Behavior1': 'Corresponding Detailed Behavior Description',
    //         'Behavior2': 'Corresponding Detailed Behavior Description'
    //     },
    //     ...
    // }
    $('#behaviors-generate').click(function () {
        var functionsData = getFunctions();

        sendDataToBackend(functionsData).then(() => {
            addBehaviors()
        }).catch((error) => {
            console.log("Error while sending data: ", error);
        });

    });

    // 输入Behaviors 输出sructures
    $('#sructures-generate').click(function () {
        var behaviorsData = getBehaviors();

        sendDataToBackend(behaviorsData).then(() => {
            addSructures()
        }).catch((error) => {
            console.log("Error while sending data: ", error);
        });

    });

    // 输入kansei-words 
    $('#kansei-words').click(function () {
        var kanseiData = getKansei();

        sendDataToBackend(kanseiData).then(() => {
            initMindMapKansei("Kansei")
            addKansei()
        }).catch((error) => {
            console.log("Error while sending data: ", error);
        });

    });

    // 像diuffusion输入prompt
    $('#image-generate').click(function () {
        var imgData = getDiffusion();
        sendDataToBackend(imgData).then(() => {
            addImage()
        }).catch((error) => {
            console.log("Error while sending data: ", error);
        });

    });


});


function sendDataToBackend(formData) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "/UI_mindmap/",
            type: "POST",

            // data: dataInput,
            data: formData,
            contentType: false,
            processData: false,
            dataType: "JSON",
            headers: {
                'X-CSRFToken': getCookie('csrftoken')  // 获取CSRF令牌并将其添加到请求头
            },
            success: function (response) {
                gpt_response = response
                resolve(response); // 解析 Promise

            },
            error: function (error) {
                console.log(error);
                reject(error); // 拒绝 Promise
            }
        });
    });
}

// 用于获取cookie的函数
function getCookie(name) {
    let value = "; " + document.cookie;
    let parts = value.split("; " + name + "=");
    if (parts.length === 2) return parts.pop().split(";").shift();
}


function add5W1H() {
    console.log('add5W1H')

    console.log(gpt_response)
    var keys = ["Who", "What", "When", "Why", "Where", "How"];
    for (var key of keys) {
        if (gpt_response[key] !== undefined && gpt_response[key] !== null && gpt_response[key].trim() !== "") {
            $('#' + key.toLowerCase()).val(gpt_response[key]);
        }
    }

}

function addFunctions() {
    console.log(gpt_response)

    var nodeList = Object.keys(gpt_response);
    var rootID = jm.get_root()['id']
    addData2MindMap(jm, rootID, nodeList, nodeList);

}

function getFunctions() {
    var functionsData = new FormData()

    let topics = jm.get_root().children.map(child => child.topic);
    var functions = topics.join('\n');
    console.log(functions);


    functionsData.append("designID", "Functions")
    functionsData.append("functions", functions)
    return functionsData
}

function addBehaviors() {
    console.log(gpt_response)
    var funcNodeList = Object.keys(gpt_response);
    for (let i = 0; i < funcNodeList.length; i++) {
        var beIDList = Object.keys(gpt_response[funcNodeList[i]]) // behavior key
        var beNodeList = Object.values(gpt_response[funcNodeList[i]])

        for (let k = 0; k < beNodeList.length; k++) {
            beNodeList[k] = "<h4>" + beIDList[k] + "</h4> " + beNodeList[k];
        }
        addData2MindMap(jm, funcNodeList[i], beIDList, beNodeList);
    }
}

function getBehaviors() {
    var behaviorsData = new FormData()



    var behaviorsList = jm.get_root().children.reduce((acc, funcNode) => {
        var behaviors = jm.get_node(funcNode.topic).children.map(child => child.topic);
        return acc.concat(behaviors);
    }, []);
    var behaviorsString = behaviorsList.join('\n')

    behaviorsData.append("designID", "Behaviors")
    behaviorsData.append("behaviors", behaviorsString)
    return behaviorsData
}

function addSructures() {
    console.log(gpt_response)
    var beNodeList = Object.keys(gpt_response);
    for (let i = 0; i < beNodeList.length; i++) {
        var sctIDList = Object.keys(gpt_response[beNodeList[i]]) // behavior key
        var sctNodeList = Object.values(gpt_response[beNodeList[i]])

        for (let k = 0; k < sctNodeList.length; k++) {
            sctNodeList[k] = "<h4>" + sctIDList[k] + "</h4> " + sctNodeList[k];
        }
        addData2MindMap(jm, beNodeList[i], sctIDList, sctNodeList);
    }
}

function getKansei() {
    var kanseiData = new FormData()

    kanseiData.append("designID", "Kansei")
    kanseiData.append("kansei_n", $('#kansei-words-n').val())
    kanseiData.append("kansei_a", $('#kansei-words-a').val())
    return kanseiData
}

function addKansei() {
    console.log(gpt_response)

    var rootID = jm_kansei.get_root()['id'];
    var kanseiTypeList = Object.keys(gpt_response);
    addData2MindMap(jm_kansei, rootID, kanseiTypeList, kanseiTypeList);

    for (let i = 0; i < kanseiTypeList.length; i++) {
        var kanseiIDList = Object.keys(gpt_response[kanseiTypeList[i]])
        var kanseiNodeList = Object.values(gpt_response[kanseiTypeList[i]]);

        for (let k = 0; k < kanseiNodeList.length; k++) {
            kanseiNodeList[k] = "<h4>" + kanseiIDList[k] + "</h4> " + kanseiNodeList[k];
        }
        addData2MindMap(jm_kansei, kanseiTypeList[i], kanseiIDList, kanseiNodeList);


    }

}

function getDiffusion() {
    var diffusionData = new FormData()
    var design = $('#message').val();
    var shapeValue = $('#shape-answer').val();
    var colorValue = $('#color-answer').val();
    var textureValue = $('#texture-answer').val();

    var diffusionString = "Product shot of" + design + shapeValue + " " + colorValue + " " + textureValue;


    diffusionData.append("designID", "Image")
    diffusionData.append("image", diffusionString)

    return diffusionData
}

function addImage() {
    console.log(gpt_response)
    var imgList = gpt_response;

    // 清空现有的图片
    $('.image-container').empty();

    // 添加新图片
    for (var i = 0; i < imgList.length; i++) {
        $('.image-container').append('<img src="/static/' + imgList[i] + '" alt="Image" />');
    }
}

function genRandomID() {
    const randomNumber = Math.floor(Math.random() * 100000) + 1; // 随机生成1～100000的整数
    return randomNumber.toString(); // 转换为字符串
}













