// 思维导图交互

// 记录当前选中的kanseibox-container内容
var selectedLabel = "design-concept"; // 默认选中shape

// 点击kanseibox-container更改当前选中内容
document.querySelectorAll('.kanseibox-container').forEach((label) => {
    label.addEventListener('click', function () {
        selectedLabel = this.getAttribute('data-label');
    });
});

function updateSelectedBackground() {
    // 移除所有已经被选中的背景色
    document.querySelectorAll('.kanseibox-container').forEach((elem) => {
        elem.classList.remove('selected');
    });

    // 添加新的背景色
    const selectedElem = document.querySelector(`[data-label="${selectedLabel}"]`);
    if (selectedElem) {
        selectedElem.classList.add('selected');
    }
}

// 初始设置
updateSelectedBackground();

// 点击kanseibox-container更改当前选中内容
document.querySelectorAll('.kanseibox-container').forEach((label) => {
    label.addEventListener('click', function () {
        selectedLabel = this.getAttribute('data-label');
        updateSelectedBackground();
    });
});



// 按下command + G，将选中的节点内容复制到对应的<textarea>
document.addEventListener('keydown', function (e) {
    if ((e.key === 'u' || e.key === 'p') && e.metaKey) {
        e.preventDefault();  // 阻止浏览器的默认行为

        // 检查哪个思维导图实例被选中
        let selectedNode;
        // 检查哪个思维导图实例被选中
        if (jm.get_selected_node()) {
            selectedNode = jm.get_selected_node(); // jm 的选中节点
        } else if (jm_kansei.get_selected_node()) {
            selectedNode = jm_kansei.get_selected_node(); // jm_kansei 的选中节点
        }

        if (selectedNode) {
            var topic = selectedNode.topic;
            var pre_value = $(`#${selectedLabel}-answer`).val();

            if (e.key === 'u') {
                e.preventDefault();  // 阻止浏览器的默认行为
                $(`#${selectedLabel}-answer`).val(topic);  // 当按下 'u'
            } else if (e.key === 'p') {
                e.preventDefault();  // 阻止浏览器的默认行为
                $(`#${selectedLabel}-answer`).val(pre_value + ' ' + topic);  // 当按下 '+'
            }
        }

    }
});