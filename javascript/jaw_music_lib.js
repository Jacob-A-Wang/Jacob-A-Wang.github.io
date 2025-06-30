/**
 * JAWMusicLib(Jack-A-Wang's Music Library)
 * Description: A JavaScript library for music information management and search
 * Author: Jacob-A-Wang
 */

class JAWMusicLib {
  /**
   * 初始化音乐库
   * @param {Object} data - 音乐库数据
   */
  constructor(data) {
    this.data = data;
    this.initializeSearch();
  }

  /**
   * 初始化搜索引擎
   * @private
   */
  initializeSearch() {
    this.fuse = new Fuse(this.data.songs, {
      keys: [
        { name: 'titles', weight: 1.0 },
        { name: 'creators.name', weight: 0.9 },
        { name: 'creators.aliases', weight: 0.8 },
        { name: 'relatedInfo', weight: 0.7 }
      ],
      includeScore: true,
      threshold: 0.6,
      useExtendedSearch: true,
      ignoreLocation: true,
      findAllMatches: true
    });
  }

  /**
   * 搜索音乐
   * @param {string} query - 搜索关键词
   * @returns {Array} 搜索结果列表
   */
  search(query) {
    const results = this.fuse.search(this.preprocessQuery(query));
    return results.map(result => ({
      id: result.item.id,
      score: result.score,
      songInfo: this.getSongInfo(result.item.id)
    }));
  }

  /**
   * 获取歌曲完整信息
   * @param {string} songId - 歌曲ID
   * @returns {Object|null} 歌曲信息对象
   */
  getSongInfo(songId) {
    const song = this.data.songs.find(s => s.id === songId);
    if (!song) return null;

    return {
      id: song.id,
      titles: song.titles,
      primaryTitle: song.titles[0],
      creators: this.formatCreators(song.creators),
      path: song.path,
      relatedInfo: song.relatedInfo,
      extraInfo: song.extraInfo
    };
  }

  /**
   * 格式化创作者信息
   * @param {Array} creators - 创作者数组
   * @returns {Array} 格式化后的创作者信息
   * @private
   */
  formatCreators(creators) {
    return creators.map(creator => ({
      name: creator.name,
      aliases: creator.aliases || [],
      displayName: creator.name
    }));
  }

  /**
   * 获取歌曲路径
   * @param {string} songId - 歌曲ID
   * @returns {string|null} 歌曲路径
   */
  getPath(songId) {
    const song = this.data.songs.find(s => s.id === songId);
    return song ? song.path : null;
  }

  /**
   * 获取歌曲音频文件路径
   * @param {string} songId - 歌曲ID
   * @returns {string|null} 歌曲音频文件路径
   */
  getAudioPath(songId) {
    const song = this.data.songs.find(s => s.id === songId);
    return song ? song.audioPath : null;
  }

  /**
   * 获取歌曲所有标题
   * @param {string} songId - 歌曲ID
   * @returns {Array|null} 标题列表
   */
  getTitles(songId) {
    const song = this.data.songs.find(s => s.id === songId);
    return song ? song.titles : null;
  }

  /**
   * 获取歌曲额外信息
   * @param {string} songId - 歌曲ID
   * @returns {Array|null} 额外信息列表
   */
  getExtraInfo(songId) {
    const song = this.data.songs.find(s => s.id === songId);
    return song ? song.extraInfo : null;
  }

  /**
   * 获取歌曲创作者信息
   * @param {string} songId - 歌曲ID
   * @returns {Array|null} 创作者信息列表
   */
  getCreators(songId) {
    const song = this.data.songs.find(s => s.id === songId);
    return song ? this.formatCreators(song.creators) : null;
  }

  /**
   * 获取歌曲相关信息
   * @param {string} songId - 歌曲ID
   * @returns {Array|null} 相关信息列表
   */
  getRelatedInfo(songId) {
    const song = this.data.songs.find(s => s.id === songId);
    return song ? song.relatedInfo : null;
  }

  /**
   * 预处理搜索查询
   * @param {string} query - 原始查询字符串
   * @returns {string} 处理后的查询字符串
   * @private
   */
  preprocessQuery(query) {
    return query.trim().toLowerCase();
  }
}
