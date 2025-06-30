/**
 * JAWBackgroundMusicLib
 * 背景音乐播放管理脚本
 * 提供三种不同类型的播放接口：单曲播放、列表播放和主副音乐播放
 *
 * 依赖于JAWMusicLib来解析音乐ID
 */

class JAWBackgroundMusicLib {
  /**
   * 初始化背景音乐管理器
   * @param {Object} musicLib - JAWMusicLib实例，用于解析音乐ID
   * @param {boolean} autoStart - 创建后是否自动开始播放，默认为true
   */
  constructor(musicLib = null, autoStart = true) {
    // 存储JAWMusicLib实例，用于解析音乐ID
    this.musicLib = musicLib;

    // 创建音频元素
    this.audioElement = document.createElement('audio');
    this.audioElement.style.display = 'none'; // 隐藏音频元素
    document.body.appendChild(this.audioElement);

    // 播放状态
    this.isPlaying = false;
    this.currentMode = null; // 'single', 'list', 'main-sub'
    this.currentIndex = 0; // 当前播放索引（用于列表播放）
    this.audioList = []; // 音频列表
    this.isLooping = false; // 是否循环播放
    this.mainAudio = null; // 主音频（用于主副音乐模式）
    this.subAudio = null; // 副音频（用于主副音乐模式）
    this.onMainComplete = null; // 主音频完成回调

    // 绑定事件处理器
    this._bindEvents();

    // 自动启动
    this.autoStart = autoStart;
  }

  /**
   * 绑定音频事件
   * @private
   */
  _bindEvents() {
    // 音频结束事件处理
    this.audioElement.addEventListener('ended', () => {
      switch(this.currentMode) {
        case 'single':
          if (this.isLooping) {
            this.audioElement.play(); // 循环播放单曲
          } else {
            this.isPlaying = false; // 单曲不循环，播放结束
          }
          break;

        case 'list':
          this._handleListPlaybackEnd();
          break;

        case 'main-sub':
          if (this.mainAudio && this.audioElement.src === this._getFullPath(this.mainAudio)) {
            // 主音频播放完成，切换到副音频
            if (this.subAudio) {
              this.audioElement.src = this._getFullPath(this.subAudio);
              this.audioElement.loop = true; // 副音频循环播放
              this.audioElement.play();

              if (typeof this.onMainComplete === 'function') {
                this.onMainComplete(); // 调用主音频完成回调
              }
            }
          }
          break;
      }
    });

    // 错误处理
    this.audioElement.addEventListener('error', (e) => {
      console.error('背景音乐播放错误:', e);

      // 如果是列表播放模式，尝试播放下一首
      if (this.currentMode === 'list' && this.audioList.length > 0) {
        this.currentIndex = (this.currentIndex + 1) % this.audioList.length;
        this._playCurrentInList();
      }
    });
  }

  /**
   * 处理列表播放结束逻辑
   * @private
   */
  _handleListPlaybackEnd() {
    if (this.audioList.length === 0) return;

    if (this.currentIndex < this.audioList.length - 1) {
      // 播放列表中的下一首
      this.currentIndex++;
      this._playCurrentInList();
    } else {
      // 已到达列表末尾
      if (this.isLooping) {
        // 循环播放，回到列表开头
        this.currentIndex = 0;
        this._playCurrentInList();
      } else {
        // 不循环，播放结束
        this.isPlaying = false;
      }
    }
  }

  /**
   * 播放列表中当前索引的音频
   * @private
   */
  _playCurrentInList() {
    if (this.audioList.length === 0 || this.currentIndex >= this.audioList.length) return;

    const currentAudio = this.audioList[this.currentIndex];
    this.audioElement.src = this._getFullPath(currentAudio);
    this.audioElement.loop = false; // 列表播放模式下，每首歌曲都不循环

    this.audioElement.play();
    this.isPlaying = true;
  }

  /**
   * 获取完整的音频路径
   * 如果输入是音乐ID且musicLib可用，则通过musicLib获取路径
   * 否则直接返回输入（假设为URL）
   * @param {string} source - 音乐ID或URL
   * @returns {string} 完整的音频URL
   * @private
   */
  _getFullPath(source) {
    if (!source) return '';

    // 如果是字符串且musicLib可用，尝试解析为音乐ID
    if (typeof source === 'string' && this.musicLib) {
      const audioPath = this.musicLib.getAudioPath(source);
      if (audioPath) return audioPath;
    }

    // 不是音乐ID或无法解析，假设为直接URL
    return source;
  }

  /**
   * 接口类型一：单音乐播放
   * @param {string} source - 音乐ID或音频文件URL
   * @param {boolean} loop - 是否循环播放
   * @returns {JAWBackgroundMusicLib} 返回this以支持链式调用
   */
  playSingle(source, loop = false) {
    this.stop(); // 停止当前播放

    this.currentMode = 'single';
    this.isLooping = loop;

    const audioPath = this._getFullPath(source);
    if (!audioPath) {
      console.error('无效的音频源:', source);
      return this;
    }

    this.audioElement.src = audioPath;
    this.audioElement.loop = loop;

    this.audioElement.play();
    this.isPlaying = true;

    return this;
  }

  /**
   * 接口类型二：列表音乐播放
   * @param {Array} sources - 音乐ID或音频文件URL的数组
   * @param {boolean} loop - 是否循环播放整个列表
   * @returns {JAWBackgroundMusicLib} 返回this以支持链式调用
   */
  playList(sources, loop = false) {
    this.stop(); // 停止当前播放

    if (!Array.isArray(sources) || sources.length === 0) {
      console.error('无效的音频源列表');
      return this;
    }

    this.currentMode = 'list';
    this.isLooping = loop;
    this.audioList = [...sources]; // 复制数组
    this.currentIndex = 0;

    this._playCurrentInList();

    return this;
  }

  /**
   * 接口类型三：主副音乐播放
   * @param {string} mainSource - 主音乐ID或音频文件URL（播放一次）
   * @param {string} subSource - 副音乐ID或音频文件URL（循环播放）
   * @param {Function} onMainComplete - 主音乐完成后的回调函数
   * @returns {JAWBackgroundMusicLib} 返回this以支持链式调用
   */
  playMainSub(mainSource, subSource, onMainComplete = null) {
    this.stop(); // 停止当前播放

    this.currentMode = 'main-sub';
    this.mainAudio = mainSource;
    this.subAudio = subSource;
    this.onMainComplete = onMainComplete;

    const mainPath = this._getFullPath(mainSource);
    if (!mainPath) {
      console.error('无效的主音频源:', mainSource);
      return this;
    }

    this.audioElement.src = mainPath;
    this.audioElement.loop = false; // 主音频不循环

    this.audioElement.play();
    this.isPlaying = true;

    return this;
  }

  /**
   * 停止播放并重置状态
   * @returns {JAWBackgroundMusicLib} 返回this以支持链式调用
   */
  stop() {
    this.audioElement.pause();
    this.audioElement.currentTime = 0;
    this.isPlaying = false;
    return this;
  }

  /**
   * 暂停播放
   * @returns {JAWBackgroundMusicLib} 返回this以支持链式调用
   */
  pause() {
    if (this.isPlaying) {
      this.audioElement.pause();
      this.isPlaying = false;
    }
    return this;
  }

  /**
   * 继续播放
   * @returns {JAWBackgroundMusicLib} 返回this以支持链式调用
   */
  resume() {
    if (!this.isPlaying && this.audioElement.src) {
      this.audioElement.play();
      this.isPlaying = true;
    }
    return this;
  }

  /**
   * 设置音量
   * @param {number} volume - 音量值（0.0到1.0之间）
   * @returns {JAWBackgroundMusicLib} 返回this以支持链式调用
   */
  setVolume(volume) {
    this.audioElement.volume = Math.max(0, Math.min(1, volume));
    return this;
  }

  /**
   * 跳到列表中指定索引的音频（仅列表播放模式有效）
   * @param {number} index - 索引位置
   * @returns {JAWBackgroundMusicLib} 返回this以支持链式调用
   */
  skipTo(index) {
    if (this.currentMode === 'list' &&
        this.audioList.length > 0 &&
        index >= 0 &&
        index < this.audioList.length) {
      this.currentIndex = index;
      this._playCurrentInList();
    }
    return this;
  }

  /**
   * 播放列表中的下一首（仅列表播放模式有效）
   * @returns {JAWBackgroundMusicLib} 返回this以支持链式调用
   */
  next() {
    if (this.currentMode === 'list' && this.audioList.length > 0) {
      this.currentIndex = (this.currentIndex + 1) % this.audioList.length;
      this._playCurrentInList();
    }
    return this;
  }

  /**
   * 播放列表中的上一首（仅列表播放模式有效）
   * @returns {JAWBackgroundMusicLib} 返回this以支持链式调用
   */
  previous() {
    if (this.currentMode === 'list' && this.audioList.length > 0) {
      this.currentIndex = (this.currentIndex - 1 + this.audioList.length) % this.audioList.length;
      this._playCurrentInList();
    }
    return this;
  }

  /**
   * 检查是否正在播放
   * @returns {boolean} 是否正在播放
   */
  isActive() {
    return this.isPlaying;
  }

  /**
   * 获取当前播放模式
   * @returns {string|null} 当前播放模式：'single', 'list', 'main-sub' 或 null
   */
  getMode() {
    return this.currentMode;
  }

  /**
   * 获取当前播放索引（仅列表播放模式有效）
   * @returns {number} 当前播放索引
   */
  getCurrentIndex() {
    return this.currentIndex;
  }

  /**
   * 获取列表长度（仅列表播放模式有效）
   * @returns {number} 播放列表长度
   */
  getListLength() {
    return this.audioList.length;
  }
}

// 如果在Node.js环境中使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = JAWBackgroundMusicLib;
}