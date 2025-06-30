/**
 * 音频播放器自动化脚本
 * 负责自动创建和配置音频播放器元素
 */

function createAudioPlayer(audioPath) {
    if (audioPath) {
        // 创建audio元素
        const audioPlayer = document.createElement('audio');
        audioPlayer.controls = true; // 显示控制栏
        audioPlayer.appendChild(document.createElement('source')); // 添加source子元素
        audioPlayer.querySelector('source').src = audioPath; // 设置音频文件路径
        audioPlayer.querySelector('source').type = 'audio/mpeg'; // 设置音频类型
        audioPlayer.appendChild(document.createElement('embed')); // 添加embed子元素
        audioPlayer.querySelector('embed').src = audioPath; // 设置音频文件路径
        audioPlayer.querySelector('embed').type = 'audio/mpeg'; // 设置音频类型

        // 将audio元素添加到页面中的特定位置
        // 即id为'audio-container'的元素
        const container = document.querySelector('#audio-container');
        if (container) {
            container.appendChild(audioPlayer);
        } else {
            console.warn('未找到audio-container元素，无法添加音频播放器');
        }
    } else {
        console.warn('未找到音频文件路径');
    }
}
