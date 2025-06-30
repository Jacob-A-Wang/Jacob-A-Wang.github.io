function outputChByCh(outputElementId, outputText, outputTick) {
      // 获取<p>元素
      let outputElement = document.getElementById(outputElementId);

      // 创建一个函数，用于逐字显示文本
      let index = 0;
      let intervalId = setInterval(function() {
        if (index < outputText.length) {
          outputElement.textContent = (outputText.slice(0, index)).concat("_");
        }
        else {
          outputElement.textContent = outputText;
        }
        index++;

        // 如果已经显示完所有字符，清除定时器
        if (index > outputText.length) {
          clearInterval(intervalId);
        }
      }, outputTick); // 每隔outputTick毫秒显示一个字符
    }