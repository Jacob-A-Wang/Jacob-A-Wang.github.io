/**
 * JAW Enhanced Search Library
 * 增强版音乐搜索库，提供更智能、更精准的搜索功能
 * Author: Jacob-A-Wang
 */

class JAWEnhancedSearch {
  /**
   * 初始化增强版搜索引擎
   * @param {Object} musicData - 音乐库数据
   * @param {Object} options - 搜索引擎配置选项
   */
  constructor(musicData, options = {}) {
    this.originalData = musicData;
    this.options = options;
    this.data = this.preprocessData(musicData);
    this.searchHistory = [];
    this.initializeFuse();
    this.loadSearchHistory();
  }

  /**
   * 预处理数据，添加拼音和分词
   * @private
   * @param {Object} data - 原始音乐数据
   * @returns {Object} - 预处理后的数据
   */
  preprocessData(data) {
    // 检查数据结构
    if (!data) {
      console.error("数据预处理错误: 输入数据为空");
      return { songs: [] }; // 返回一个安全的空数据结构
    }

    if (!data.songs || !Array.isArray(data.songs)) {
      console.error("数据预处理错误: 缺少songs数组或格式不正确");
      return { songs: [] }; // 返回一个安全的空数据结构
    }

    const processedData = JSON.parse(JSON.stringify(data));

    processedData.songs.forEach(song => {
      // 添加标题拼音
      song.titlesPinyin = song.titles.map(title => {
        if (/[\u4e00-\u9fa5]/.test(title)) { // 包含中文
          return pinyinPro.pinyin(title, { toneType: 'none', type: 'array' }).join('');
        }
        return title.toLowerCase();
      });

      // 添加标题拼音首字母
      song.titlesPinyinInitials = song.titles.map(title => {
        if (/[\u4e00-\u9fa5]/.test(title)) { // 包含中文
          return pinyinPro.pinyin(title, { toneType: 'none', type: 'array', pattern: 'first' }).join('');
        }
        return '';
      });

      // 添加创作者拼音
      song.creators.forEach(creator => {
        if (creator.name && /[\u4e00-\u9fa5]/.test(creator.name)) {
          creator.namePinyin = pinyinPro.pinyin(creator.name, { toneType: 'none', type: 'array' }).join('');
          creator.namePinyinInitials = pinyinPro.pinyin(creator.name, { toneType: 'none', type: 'array', pattern: 'first' }).join('');
        } else if (creator.name) {
          creator.namePinyin = creator.name.toLowerCase();
        }

        if (creator.aliases && creator.aliases.length > 0) {
          creator.aliasesPinyin = creator.aliases.map(alias => {
            if (/[\u4e00-\u9fa5]/.test(alias)) {
              return pinyinPro.pinyin(alias, { toneType: 'none', type: 'array' }).join('');
            }
            return alias.toLowerCase();
          });

          creator.aliasesPinyinInitials = creator.aliases.map(alias => {
            if (/[\u4e00-\u9fa5]/.test(alias)) {
              return pinyinPro.pinyin(alias, { toneType: 'none', type: 'array', pattern: 'first' }).join('');
            }
            return '';
          });
        }
      });

      // 添加相关信息拼音
      if (song.relatedInfo && song.relatedInfo.length > 0) {
        song.relatedInfoPinyin = song.relatedInfo.map(info => {
          if (/[\u4e00-\u9fa5]/.test(info)) {
            return pinyinPro.pinyin(info, { toneType: 'none', type: 'array' }).join('');
          }
          return info.toLowerCase();
        });
      }

      // 添加额外信息拼音
      if (song.extraInfo && /[\u4e00-\u9fa5]/.test(song.extraInfo)) {
        song.extraInfoPinyin = pinyinPro.pinyin(song.extraInfo, { toneType: 'none', type: 'array' }).join('');
      }

      // 添加简单分词索引
      song.wordsIndex = this.createWordsIndex(song);
    });

    return processedData;
  }

  /**
   * 为歌曲创建分词索引
   * @private
   * @param {Object} song - 歌曲对象
   * @returns {string} - 分词索引
   */
  createWordsIndex(song) {
    // 收集所有可搜索文本
    const elements = [
      ...song.titles,
      ...song.creators.map(c => c.name),
      ...song.creators.flatMap(c => c.aliases || []),
      ...(song.relatedInfo || [])
    ];

    if (song.extraInfo) {
      elements.push(song.extraInfo);
    }

    // 改进的分词处理
    let words = [];
    elements.forEach(elem => {
      if (!elem) return;

      if (/[\u4e00-\u9fa5]/.test(elem)) { // 中文
        // 单字索引
        words = words.concat(elem.split(''));

        // 双字组合
        for (let i = 0; i < elem.length - 1; i++) {
          words.push(elem.substring(i, i+2));
        }

        // 三字组合（对于较长词汇很有用）
        for (let i = 0; i < elem.length - 2; i++) {
          words.push(elem.substring(i, i+3));
        }

        // 处理可能的四字成语
        for (let i = 0; i < elem.length - 3; i++) {
          const fourChars = elem.substring(i, i+4);
          // 如果这个四字组合是成语的可能性较高，权重增加
          if (fourChars.length === 4) {
            words.push(fourChars);
            // 添加两次以提高权重
            words.push(fourChars);
          }
        }

        // 拼音全拼和首字母索引
        const pinyin = pinyinPro.pinyin(elem, { toneType: 'none', type: 'array' }).join(' ');
        words.push(pinyin);

        const pinyinInitials = pinyinPro.pinyin(elem, { toneType: 'none', type: 'array', pattern: 'first' }).join('');
        words.push(pinyinInitials);

      } else {
        // 英文处理，按空格和常见分隔符切分
        words = words.concat(
          elem.toLowerCase()
            .split(/[\s\-_.,;:!?()[\]{}'"\/\\&+=#$%@|<>]+/)
            .filter(w => w.length > 0)
        );

        // 添加完整词汇
        words.push(elem.toLowerCase());
      }
    });

    // 去重
    return [...new Set(words)].join(' ');
  }

  /**
   * 初始化Fuse.js搜索引擎
   * @private
   */
  initializeFuse() {
    const defaultFuseOptions = {
      keys: [
        { name: 'titles', weight: 2.0 },             // 歌名（最高优先级）
        { name: 'titlesPinyin', weight: 1.8 },       // 歌名拼音
        { name: 'titlesPinyinInitials', weight: 1.6 }, // 歌名拼音首字母
        { name: 'extraInfo', weight: 1.4 },          // 歌曲附加信息（第三优先级）
        { name: 'extraInfoPinyin', weight: 1.2 },
        { name: 'creators.name', weight: 1.0 },      // 创作者（第四优先级）
        { name: 'creators.namePinyin', weight: 0.9 },
        { name: 'creators.namePinyinInitials', weight: 0.8 },
        { name: 'creators.aliases', weight: 0.7 },    // 创作者别名（第五优先级）
        { name: 'creators.aliasesPinyin', weight: 0.6 },
        { name: 'creators.aliasesPinyinInitials', weight: 0.5 },
        { name: 'relatedInfo', weight: 0.4 },        // 相关信息（最低优先级）
        { name: 'relatedInfoPinyin', weight: 0.3 },
        { name: 'wordsIndex', weight: 0.8 }          // 分词索引
      ],
      includeScore: true,
      includeMatches: true,   // 包含匹配信息，用于高亮
      threshold: 0.45,        // 降低阈值，增加匹配结果
      ignoreLocation: false,  // 考虑位置因素，匹配位置越靠前越好
      location: 0,            // 从开头开始匹配
      distance: 100,          // 允许匹配范围，适当放宽
      useExtendedSearch: true,
      findAllMatches: true,
      minMatchCharLength: 1   // 最小匹配1个字符
    };

    // 合并默认选项和用户提供的选项
    const fuseOptions = { ...defaultFuseOptions, ...(this.options.fuseOptions || {}) };
    this.fuse = new Fuse(this.data.songs, fuseOptions);
  }

  /**
   * 预处理搜索查询
   * @private
   * @param {string} query - 查询字符串
   * @returns {string} 处理后的查询字符串
   */
  preprocessQuery(query) {
    if (!query) return '';

    query = query.trim().toLowerCase();

    // 检测是否是高级搜索格式
    if (query.includes(':')) {
      const parts = query.split(':');
      const field = parts[0].trim();
      const value = parts[1].trim();

      // 根据字段转换为Fuse.js的扩展搜索格式
      switch (field) {
        case 'title':
          return `'${value}`;  // 前缀匹配
        case 'creator':
          return `creators.name:'${value}`;
        case 'alias':
          return `creators.aliases:'${value}`;
        case 'info':
          return `relatedInfo:'${value}`;
        default:
          return query;  // 不支持的字段
      }
    }

    return query;
  }

  /**
   * 执行搜索
   * @param {string} query - 搜索关键词
   * @returns {Array} 搜索结果
   */
  search(query) {
    const processedQuery = this.preprocessQuery(query);
    if (!processedQuery) return [];

    // 保存到搜索历史
    this.addToSearchHistory(query);

    // 执行搜索
    const results = this.fuse.search(processedQuery);

    // 智能排序
    return this.smartSort(results, query);
  }

  /**
   * 智能排序搜索结果
   * @private
   * @param {Array} results - Fuse.js搜索结果
   * @param {string} query - 原始查询字符串
   * @returns {Array} 排序后的结果
   */
  smartSort(results, query) {
    const lowerQuery = query.toLowerCase();

    return results.sort((a, b) => {
      // 1. 首先比较歌名精确匹配
      const aExactTitleMatch = a.item.titles.some(title =>
        title.toLowerCase() === lowerQuery
      );
      const bExactTitleMatch = b.item.titles.some(title =>
        title.toLowerCase() === lowerQuery
      );

      if (aExactTitleMatch && !bExactTitleMatch) return -1;
      if (!aExactTitleMatch && bExactTitleMatch) return 1;

      // 1.5 对于歌名匹配，比较匹配位置（仅对歌名，不含别名）
      // 获取歌名匹配的最小位置
      const getMinMatchPosition = (result) => {
        let minPos = Infinity;
        if (result.matches) {
          result.matches.forEach(match => {
            // 只考虑歌名匹配
            if (match.key === 'titles' && match.value) {
              match.indices.forEach(([start]) => {
                if (start < minPos) minPos = start;
              });
            }
          });
        }
        return minPos === Infinity ? -1 : minPos;
      };

      const aMinPos = getMinMatchPosition(a);
      const bMinPos = getMinMatchPosition(b);

      // 两者都有匹配位置时，位置越靠前越好
      if (aMinPos !== -1 && bMinPos !== -1) {
        if (aMinPos < bMinPos) return -1;
        if (aMinPos > bMinPos) return 1;
      } else if (aMinPos !== -1) {
        // 只有a有匹配位置
        return -1;
      } else if (bMinPos !== -1) {
        // 只有b有匹配位置
        return 1;
      }

      // 2. 比较歌名前缀匹配
      const aTitlePrefixMatch = a.item.titles.some(title =>
        title.toLowerCase().startsWith(lowerQuery)
      );
      const bTitlePrefixMatch = b.item.titles.some(title =>
        title.toLowerCase().startsWith(lowerQuery)
      );

      if (aTitlePrefixMatch && !bTitlePrefixMatch) return -1;
      if (!aTitlePrefixMatch && bTitlePrefixMatch) return 1;

      // 3. 比较extraInfo精确匹配
      const aExtraInfoMatch = a.item.extraInfo &&
        a.item.extraInfo.toLowerCase().includes(lowerQuery);
      const bExtraInfoMatch = b.item.extraInfo &&
        b.item.extraInfo.toLowerCase().includes(lowerQuery);

      if (aExtraInfoMatch && !bExtraInfoMatch) return -1;
      if (!aExtraInfoMatch && bExtraInfoMatch) return 1;

      // 4. 比较创作者名称精确匹配
      const aCreatorMatch = a.item.creators.some(creator =>
        creator.name.toLowerCase() === lowerQuery);
      const bCreatorMatch = b.item.creators.some(creator =>
        creator.name.toLowerCase() === lowerQuery);

      if (aCreatorMatch && !bCreatorMatch) return -1;
      if (!aCreatorMatch && bCreatorMatch) return 1;

      // 5. 比较创作者别名精确匹配
      const aCreatorAliasMatch = a.item.creators.some(creator =>
        (creator.aliases || []).some(alias =>
          alias.toLowerCase() === lowerQuery));
      const bCreatorAliasMatch = b.item.creators.some(creator =>
        (creator.aliases || []).some(alias =>
          alias.toLowerCase() === lowerQuery));

      if (aCreatorAliasMatch && !bCreatorAliasMatch) return -1;
      if (!aCreatorAliasMatch && bCreatorAliasMatch) return 1;

      // 6. 最后比较Fuse.js总体评分
      return a.score - b.score;
    });
  }

  /**
   * 添加查询到搜索历史
   * @private
   * @param {string} query - 查询字符串
   */
  addToSearchHistory(query) {
    if (!query || query.length < 2) return;

    // 如果禁用历史记录，则直接返回
    if (this.options.disableHistory) return;

    // 去重：如果已存在相同查询，先移除
    const index = this.searchHistory.indexOf(query);
    if (index !== -1) {
      this.searchHistory.splice(index, 1);
    }

    // 添加到历史记录头部
    this.searchHistory.unshift(query);

    // 限制历史记录长度
    const historyLimit = this.options.historyLimit || 10;
    if (this.searchHistory.length > historyLimit) {
      this.searchHistory.pop();
    }

    // 保存到localStorage
    this.saveSearchHistory();
  }

  /**
   * 保存搜索历史到localStorage
   * @private
   */
  saveSearchHistory() {
    try {
      localStorage.setItem('jawMusicSearchHistory', JSON.stringify(this.searchHistory));
    } catch (e) {
      console.warn('Failed to save search history to localStorage:', e);
    }
  }

  /**
   * 加载搜索历史
   */
  loadSearchHistory() {
    try {
      const history = localStorage.getItem('jawMusicSearchHistory');
      if (history) {
        this.searchHistory = JSON.parse(history);
      }
    } catch (e) {
      console.warn('Failed to load search history from localStorage:', e);
    }
  }

  /**
   * 清除搜索历史
   */
  clearSearchHistory() {
    this.searchHistory = [];
    try {
      localStorage.removeItem('jawMusicSearchHistory');
    } catch (e) {
      console.warn('Failed to remove search history from localStorage:', e);
    }
  }

  /**
   * 获取搜索历史
   * @returns {Array} 搜索历史记录
   */
  getSearchHistory() {
    return this.searchHistory;
  }

  /**
   * 高亮文本中的搜索关键词
   * @param {string} text - 原始文本
   * @param {Array} matches - Fuse.js匹配信息
   * @returns {string} 高亮处理后的HTML
   */
  // 高亮功能目前被禁用，此方法无效
  highlightText(text, matches) {
    if (!matches || !text) return text;

    // 构建匹配范围
    let ranges = [];
    matches.forEach(match => {
      match.indices.forEach(([start, end]) => {
        ranges.push({ start, end: end + 1 });
      });
    });

    // 合并重叠范围
    ranges.sort((a, b) => a.start - b.start);
    let mergedRanges = [];
    let currentRange = null;

    ranges.forEach(range => {
      if (!currentRange) {
        currentRange = { ...range };
      } else if (range.start <= currentRange.end) {
        currentRange.end = Math.max(currentRange.end, range.end);
      } else {
        mergedRanges.push(currentRange);
        currentRange = { ...range };
      }
    });

    if (currentRange) {
      mergedRanges.push(currentRange);
    }

    // 应用高亮
    let result = '';
    let lastIndex = 0;

    mergedRanges.forEach(range => {
      result += text.substring(lastIndex, range.start);
      result += `<span class="highlight">${text.substring(range.start, range.end)}</span>`;
      lastIndex = range.end;
    });

    result += text.substring(lastIndex);
    return result;
  }

  /**
   * 获取搜索建议
   * @param {string} prefix - 搜索前缀
   * @param {number} limit - 最大建议数量
   * @returns {Array} 建议列表
   */
  // 搜索建议不会被添加，此方法无效
  getSuggestions(prefix, maxSuggestions = 5) {
    if (!prefix || prefix.length < 1) return {titles: [], creators: [], history: []};

    // 使用用户配置的限制或默认值
    const limit = maxSuggestions || this.options.maxSuggestions || 5;

    // 转义输入以防止XSS攻击
    const safePrefix = this.escapeHTML(prefix);
    const lowerPrefix = safePrefix.toLowerCase();

    // 结果分类
    const suggestions = {
      titles: [],
      creators: [],
      history: []
    };

    // 使用Fuse.js进行模糊匹配
    const fuseOptions = {
      keys: ['titles', 'titlesPinyin', 'titlesPinyinInitials',
             'creators.name', 'creators.namePinyin', 'creators.namePinyinInitials',
             'creators.aliases', 'creators.aliasesPinyin'],
      includeMatches: true,
      threshold: 0.4,
      ignoreLocation: true
    };

    const fuse = new Fuse(this.data.songs, fuseOptions);
    const results = fuse.search(lowerPrefix);

    // 处理标题建议
    results.forEach(result => {
      // 提取标题建议
      result.item.titles.forEach((title, index) => {
        // 检查标题、拼音或拼音首字母是否匹配
        if (
          title.toLowerCase().includes(lowerPrefix) ||
          (result.item.titlesPinyin && result.item.titlesPinyin[index] &&
           result.item.titlesPinyin[index].includes(lowerPrefix)) ||
          (result.item.titlesPinyinInitials && result.item.titlesPinyinInitials[index] &&
           result.item.titlesPinyinInitials[index].includes(lowerPrefix))
        ) {
          suggestions.titles.push({
            type: 'title',
            text: title,
            originalItem: result.item,
            matches: result.matches?.filter(m => m.key === 'titles')
          });
        }
      });

      // 提取创作者建议
      result.item.creators.forEach(creator => {
        if (creator.name && (
            creator.name.toLowerCase().includes(lowerPrefix) ||
            (creator.namePinyin && creator.namePinyin.includes(lowerPrefix)) ||
            (creator.namePinyinInitials && creator.namePinyinInitials.includes(lowerPrefix))
           )) {
          suggestions.creators.push({
            type: 'creator',
            text: creator.name,
            originalItem: creator,
            matches: result.matches?.filter(m => m.key.startsWith('creators.name'))
          });
        }

        // 创作者别名
        if (creator.aliases) {
          creator.aliases.forEach((alias, aliasIndex) => {
            if (
              alias.toLowerCase().includes(lowerPrefix) ||
              (creator.aliasesPinyin && creator.aliasesPinyin[aliasIndex] &&
               creator.aliasesPinyin[aliasIndex].includes(lowerPrefix)) ||
              (creator.aliasesPinyinInitials && creator.aliasesPinyinInitials[aliasIndex] &&
               creator.aliasesPinyinInitials[aliasIndex].includes(lowerPrefix))
            ) {
              suggestions.creators.push({
                type: 'creator_alias',
                text: alias,
                originalName: creator.name,
                originalItem: creator,
                songTitle: result.item.titles[0], // 添加歌曲标题作为上下文
                matches: result.matches?.filter(m => m.key.startsWith('creators.aliases'))
              });
            }
          });
        }
      });
    });

    // 从历史记录中获取建议 (如果未禁用)
    if (!this.options.disableHistory) {
      this.searchHistory.forEach(hist => {
        if (hist.toLowerCase().includes(lowerPrefix)) {
          suggestions.history.push({
            type: 'history',
            text: hist
          });
        }
      });
    }

    // 对每个分类进行去重和排序
    const uniqueSuggestions = {
      titles: this.getUniqueByText(suggestions.titles, lowerPrefix).slice(0, Math.ceil(limit/2)),
      creators: this.getUniqueByText(suggestions.creators, lowerPrefix).slice(0, Math.floor(limit/3)),
      history: this.getUniqueByText(suggestions.history, lowerPrefix).slice(0, Math.floor(limit/3))
    };

    // 返回分类后的建议对象，而不是合并数组
    return uniqueSuggestions;
  }

  /**
   * 根据text属性去除重复项并根据匹配质量排序
   * @private
   * @param {Array} items - 建议项数组
   * @param {string} prefix - 搜索前缀，用于排序
   * @returns {Array} 去重并排序后的数组
   */
  getUniqueByText(items, prefix = '') {
    const seen = new Set();
    const uniqueItems = items.filter(item => {
      if (seen.has(item.text)) {
        return false;
      }
      seen.add(item.text);
      return true;
    });

    // 根据匹配质量排序
    return uniqueItems.sort((a, b) => {
      // 优先考虑前缀匹配
      const aStartsWithPrefix = a.text.toLowerCase().startsWith(prefix);
      const bStartsWithPrefix = b.text.toLowerCase().startsWith(prefix);

      if (aStartsWithPrefix && !bStartsWithPrefix) return -1;
      if (!aStartsWithPrefix && bStartsWithPrefix) return 1;

      // 其次考虑完全匹配
      const aExactMatch = a.text.toLowerCase() === prefix;
      const bExactMatch = b.text.toLowerCase() === prefix;

      if (aExactMatch && !bExactMatch) return -1;
      if (!aExactMatch && bExactMatch) return 1;

      // 最后按长度排序，较短的建议优先
      return a.text.length - b.text.length;
    });
  }

  /**
   * 转义HTML特殊字符以防止XSS攻击
   * @private
   */
  escapeHTML(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

// 如果在Node.js环境中使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = JAWEnhancedSearch;
}